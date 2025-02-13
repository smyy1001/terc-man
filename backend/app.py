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
from io import BytesIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# MinIO Configuration
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://minio:9000")
ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID", "admin")
SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "admin123")

# Create MinIO client
s3_client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
)


def load_model_from_s3(bucket_name):
    """Download a model from MinIO to a temporary local folder."""
    print(f"📡 Downloading {bucket_name} model from MinIO...")

    temp_dir = f"/tmp/models/{bucket_name}"
    os.makedirs(temp_dir, exist_ok=True)  # Ensure the directory exists

    # List all objects in the bucket
    response = s3_client.list_objects_v2(Bucket=bucket_name)

    if "Contents" not in response:
        raise Exception(f"⚠️ No files found in {bucket_name} bucket")

    # Download each file and save it locally
    for obj in response["Contents"]:
        file_key = obj["Key"]
        local_path = os.path.join(temp_dir, file_key)

        print(f"⬇️ Downloading {file_key} to {local_path}...")
        with open(local_path, "wb") as f:
            s3_client.download_fileobj(bucket_name, file_key, f)

    print(f"✅ {bucket_name} model saved at {temp_dir}.")
    return temp_dir  # Return the local folder path


# Load MBART50 model from "mbart50" bucket
try:
    mbart_dir = load_model_from_s3("mbart50")
    mbart_model = MBartForConditionalGeneration.from_pretrained(mbart_dir)
    mbart_tokenizer = MBart50Tokenizer.from_pretrained(mbart_dir)
    mbart_status = "UP"
except Exception as e:
    mbart_status = f"DOWN - {str(e)}"

# Load M2M100 model from "m2m100" bucket
try:
    m2m_dir = load_model_from_s3("m2m100")
    m2m_model = M2M100ForConditionalGeneration.from_pretrained(m2m_dir)
    m2m_tokenizer = M2M100Tokenizer.from_pretrained(m2m_dir)
    m2m_status = "UP"
except Exception as e:
    m2m_status = f"DOWN - {str(e)}"

# Load NLLB model from "nllb" bucket
try:
    nllb_dir = load_model_from_s3("nllb")
    nllb_model = AutoModelForSeq2SeqLM.from_pretrained(nllb_dir)
    nllb_tokenizer = AutoTokenizer.from_pretrained(nllb_dir)
    nllb_status = "UP"
except Exception as e:
    nllb_status = f"DOWN - {str(e)}"

# Load Helsinki-NLP model from "helsinkinlp" bucket
try:
    opus_dir = load_model_from_s3("helsinkinlp")
    opus_model = AutoModelForSeq2SeqLM.from_pretrained(opus_dir)
    opus_tokenizer = AutoTokenizer.from_pretrained(opus_dir)
    opus_status = "UP"
except Exception as e:
    opus_status = f"DOWN - {str(e)}"


@app.route("/health", methods=["GET"])
def health_check():
    health_status = {
        "mbart50": mbart_status,
        "m2m100": m2m_status,
        "nllb": nllb_status,
        "opus_mt": opus_status,
    }

    if all(status == "UP" for status in health_status.values()):
        return jsonify({"status": "healthy", "models": health_status}), 200
    else:
        return jsonify({"status": "unhealthy", "models": health_status}), 500


# Endpoint for mBART50
@app.route("/translate/mbart50", methods=["POST"])
def translate_mbart50():
    data = request.json
    text = data.get("text", "")
    src_lang = data.get("src_lang", "en_XX")
    tgt_lang = data.get("tgt_lang", "fr_XX")

    if not text:
        return jsonify({"error": "No text provided"}), 400
    if not src_lang or not tgt_lang:
        return jsonify({"error": "Source and target languages must be specified"}), 400

    mbart_tokenizer.src_lang = src_lang
    encoded_text = mbart_tokenizer(text, return_tensors="pt", truncation=True)
    generated_tokens = mbart_model.generate(
        **encoded_text, forced_bos_token_id=mbart_tokenizer.lang_code_to_id[tgt_lang]
    )
    translation = mbart_tokenizer.batch_decode(
        generated_tokens, skip_special_tokens=True
    )[0]

    return jsonify({"translation": translation})


# Endpoint for M2M100
@app.route("/translate/m2m100", methods=["POST"])
def translate_m2m100():
    data = request.json
    text = data.get("text", "")
    src_lang = data.get("src_lang", "en")
    tgt_lang = data.get("tgt_lang", "fr")

    if not text:
        return jsonify({"error": "No text provided"}), 400
    if not src_lang or not tgt_lang:
        return jsonify({"error": "Source and target languages must be specified"}), 400

    m2m_tokenizer.src_lang = src_lang
    encoded_text = m2m_tokenizer(text, return_tensors="pt", truncation=True)
    generated_tokens = m2m_model.generate(
        **encoded_text, forced_bos_token_id=m2m_tokenizer.lang_code_to_id[tgt_lang]
    )
    translation = m2m_tokenizer.batch_decode(
        generated_tokens, skip_special_tokens=True
    )[0]

    return jsonify({"translation": translation})


@app.route("/translate/nllb", methods=["POST"])
def translate_nllb():
    data = request.json
    text = data.get("text", "")
    src_lang = data.get("src_lang")
    tgt_lang = data.get("tgt_lang")

    if not text:
        return jsonify({"error": "No text provided"}), 400
    if not src_lang or not tgt_lang:
        return jsonify({"error": "Source and target languages must be specified"}), 400

    # Add source language token manually
    src_token = f"{src_lang}"
    tgt_token = f"{tgt_lang}"

    # Validate target language token
    vocab = nllb_tokenizer.get_vocab()  # Retrieve the tokenizer's vocabulary
    if tgt_token not in vocab:
        # Debugging information
        print(f"Target language token '{tgt_token}' not found in vocabulary.")
        print(
            f"Supported tokens: {[k for k in vocab if k.startswith('__') and k.endswith('__')]}"
        )
        return jsonify({"error": f"Target language '{tgt_lang}' is not supported"}), 400

    forced_bos_token_id = vocab[tgt_token]

    # Prepend the source language token to the input text
    text_with_src_lang = f"{src_token} {text}"

    # Tokenize the input text
    encoded_text = nllb_tokenizer(
        text_with_src_lang, return_tensors="pt", truncation=True
    )

    # Generate translation
    generated_tokens = nllb_model.generate(
        **encoded_text, forced_bos_token_id=forced_bos_token_id
    )
    translation = nllb_tokenizer.batch_decode(
        generated_tokens, skip_special_tokens=True
    )[0]

    return jsonify({"translation": translation})


# Endpoint for Helsinki-NLP Opus-MT
@app.route("/translate/opus_mt", methods=["POST"])
def translate_opus_mt():
    data = request.json
    text = data.get("text", "")
    src_lang = data.get("src_lang", "en")  # Default source language
    tgt_lang = data.get("tgt_lang", "fr")  # Default target language

    if not text:
        return jsonify({"error": "No text provided"}), 400
    if not src_lang or not tgt_lang:
        return jsonify({"error": "Source and target languages must be specified"}), 400

    # Set source and target language prefixes
    src_prefix = f">>{tgt_lang}<< "
    text_with_prefix = src_prefix + text

    # Tokenize and encode input text
    encoded_text = opus_tokenizer(
        text_with_prefix, return_tensors="pt", truncation=True
    )

    # Generate translation
    generated_tokens = opus_model.generate(**encoded_text)
    translation = opus_tokenizer.decode(generated_tokens[0], skip_special_tokens=True)

    return jsonify({"translation": translation})


# Fallback endpoint
@app.route("/translate", methods=["POST"])
def translate_simple():
    return jsonify({"Warning": "Lütfen geçerli bir model seçiniz"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
