from flask import Flask, request, jsonify
from transformers import (
    MBartForConditionalGeneration,
    MBart50Tokenizer,
    M2M100ForConditionalGeneration,
    M2M100Tokenizer,
    AutoModelForSeq2SeqLM,
    AutoTokenizer,
)
import os
import boto3
import torch
import redis
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

S3_BUCKET = os.getenv("BUCKET_NAME", "models-bucket")
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://minio:9000")
ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID", "admin")
SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "admin123")

MODEL_PATHS = {
    "mbart50": os.getenv("MINIO_MBART50_PATH", "models/mbart50/"),
    "m2m100": os.getenv("MINIO_M2M100_PATH", "models/m2m100/"),
    "nllb": os.getenv("MINIO_NLLB_PATH", "models/nllb/"),
    "helsinkinlp": os.getenv("MINIO_HELSINKINLP_PATH", "models/helsinkinlp/"),
}

s3_client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
)

# Initialize Redis
redis_client = redis.StrictRedis(host="redis", port=6379, db=0)

# Model configurations
models = {
    "mbart50": {"class": MBartForConditionalGeneration, "tokenizer": MBart50Tokenizer},
    "m2m100": {"class": M2M100ForConditionalGeneration, "tokenizer": M2M100Tokenizer},
    "nllb": {"class": AutoModelForSeq2SeqLM, "tokenizer": AutoTokenizer},
    "helsinkinlp": {"class": AutoModelForSeq2SeqLM, "tokenizer": AutoTokenizer},
}

# Dictionary to store loaded models
loaded_models = {}


def load_model_from_s3(model_name):
    print(f"📡 Downloading {model_name} model from MinIO...")

    temp_dir = f"/tmp/models/{model_name}"
    os.makedirs(temp_dir, exist_ok=True)

    model_s3_path = MODEL_PATHS.get(model_name)
    if not model_s3_path:
        raise Exception(f"⚠️ Model path not found for {model_name}")

    response = s3_client.list_objects_v2(Bucket=S3_BUCKET, Prefix=model_s3_path)

    if "Contents" not in response:
        raise Exception(f"⚠️ No files found for {model_name} in {S3_BUCKET}")

    for obj in response["Contents"]:
        file_key = obj["Key"]
        local_path = os.path.join(temp_dir, file_key.replace(model_s3_path, ""))

        print(f"⬇️ Downloading {file_key} to {local_path}...")
        with open(local_path, "wb") as f:
            s3_client.download_fileobj(S3_BUCKET, file_key, f)

    print(f"✅ {model_name} model saved at {temp_dir}.")
    return temp_dir


models = {
    "mbart50": {"class": MBartForConditionalGeneration, "tokenizer": MBart50Tokenizer},
    "m2m100": {"class": M2M100ForConditionalGeneration, "tokenizer": M2M100Tokenizer},
    "nllb": {"class": AutoModelForSeq2SeqLM, "tokenizer": AutoTokenizer},
    "helsinkinlp": {"class": AutoModelForSeq2SeqLM, "tokenizer": AutoTokenizer},
}

loaded_models = {}
loaded_status = {}

for model_name, config in models.items():
    try:
        model_dir = load_model_from_s3(model_name)
        model = config["class"].from_pretrained(model_dir)
        tokenizer = config["tokenizer"].from_pretrained(model_dir)

        loaded_models[model_name] = {"model": model, "tokenizer": tokenizer}
        print(f"✅ {model_name} model is ready.")

    except Exception as e:
        print(f"⚠️ Error loading {model_name}: {e}")

print("✅ All models loaded successfully.")


@app.route("/health", methods=["GET"])
def health_check():
    return (
        jsonify({"status": "healthy", "models": loaded_status}),
        200 if all(status == "UP" for status in loaded_status.values()) else 500,
    )


@app.route("/translate/<model_name>", methods=["POST"])
def translate(model_name):
    data = request.json
    text = data.get("text", "").strip()
    src_lang = data.get("src_lang")
    tgt_lang = data.get("tgt_lang")

    if not text:
        return jsonify({"error": "No text provided"}), 400
    if not src_lang or not tgt_lang:
        return jsonify({"error": "Source and target languages must be specified"}), 400
    if model_name not in loaded_models:
        return jsonify({"error": f"Model '{model_name}' not found"}), 400

    cache_key = f"{model_name}:{src_lang}:{tgt_lang}:{text}"
    cached_translation = redis_client.get(cache_key)
    if cached_translation:
        return jsonify({"translation": cached_translation.decode("utf-8")})

    model_obj = loaded_models[model_name]
    model, tokenizer = model_obj["model"], model_obj["tokenizer"]

    if model_name in ["mbart50", "m2m100"]:
        tokenizer.src_lang = src_lang
        encoded_text = tokenizer(text, return_tensors="pt", truncation=True)
        generated_tokens = model.generate(
            **encoded_text, forced_bos_token_id=tokenizer.lang_code_to_id[tgt_lang]
        )
    elif model_name == "nllb":
        vocab = tokenizer.get_vocab()
        tgt_token = f"{tgt_lang}"
        if tgt_token not in vocab:
            return (
                jsonify({"error": f"Target language '{tgt_lang}' is not supported"}),
                400,
            )
        forced_bos_token_id = vocab[tgt_token]
        text_with_src_lang = f"{src_lang} {text}"
        encoded_text = tokenizer(
            text_with_src_lang, return_tensors="pt", truncation=True
        )
        generated_tokens = model.generate(
            **encoded_text, forced_bos_token_id=forced_bos_token_id
        )
    elif model_name == "helsinkinlp":
        text_with_prefix = f">>{tgt_lang}<< {text}"
        encoded_text = tokenizer(text_with_prefix, return_tensors="pt", truncation=True)
        generated_tokens = model.generate(**encoded_text)
    else:
        return jsonify({"error": "Invalid model name"}), 400

    translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

    redis_client.set(cache_key, translation, ex=3600)  # 1 saat cache'de tut
    return jsonify({"translation": translation})


if __name__ == "__main__":
    from waitress import serve

    print("🚀 Downloading and loading models before starting the server...")
    # load_all_models()

    print("🚀 Starting Flask app with Waitress server...")
    serve(app, host="0.0.0.0", port=8080)
