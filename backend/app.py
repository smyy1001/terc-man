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
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the mBART50 model and tokenizer
MBART50_DIR = os.getenv("MBART50_DIR", "/app/models/mbart50")
mbart_model = MBartForConditionalGeneration.from_pretrained(MBART50_DIR)
mbart_tokenizer = MBart50Tokenizer.from_pretrained(MBART50_DIR)

# Load the M2M100 model and tokenizer
M2M100_DIR = os.getenv("M2M100_DIR", "/app/models/m2m100")
m2m_model = M2M100ForConditionalGeneration.from_pretrained(M2M100_DIR)
m2m_tokenizer = M2M100Tokenizer.from_pretrained(M2M100_DIR)

# Load the NLLB model and tokenizer
NLLB_DIR = os.getenv("NLLB_DIR", "/app/models/nllb")
nllb_model = AutoModelForSeq2SeqLM.from_pretrained(NLLB_DIR)
nllb_tokenizer = AutoTokenizer.from_pretrained(NLLB_DIR)

# # Load the MT5 model and tokenizer
# MT5_DIR = os.getenv("MT5_DIR", "/app/models/mT5_multilingual_XLSum")
# mt5_tokenizer = AutoTokenizer.from_pretrained(MT5_DIR)
# mt5_model = AutoModelForSeq2SeqLM.from_pretrained(MT5_DIR)

# # Load the T5 model and tokenizer
# T5_DIR = os.getenv("T5_DIR", "models/t5-small")
# tokenizer = AutoTokenizer.from_pretrained(T5_DIR)
# model = AutoModelForSeq2SeqLM.from_pretrained(T5_DIR)


# Load the Helsinki-NLP Opus-MT model and tokenizer
HELSINKI_NLP_DIR = os.getenv("HELSINKI_NLP_DIR", "models/helsinki_nlp")
opus_tokenizer = AutoTokenizer.from_pretrained(HELSINKI_NLP_DIR)
opus_model = AutoModelForSeq2SeqLM.from_pretrained(HELSINKI_NLP_DIR)


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


# # Endpoint for mT5_multilingual_XLSum
# @app.route("/translate/mt5", methods=["POST"])
# def translate_mt5():
#     data = request.json
#     text = data.get("text", "")
#     src_lang = data.get("src_lang")
#     tgt_lang = data.get("tgt_lang")

#     if not text:
#         return jsonify({"error": "No text provided"}), 400
#     if not src_lang or not tgt_lang:
#         return jsonify({"error": "Source and target languages must be specified"}), 400

#     task_prefix = f"Translate {src_lang} text to {tgt_lang}: {text}"

#     input_ids = mt5_tokenizer(task_prefix, return_tensors="pt").input_ids

#     generated_tokens = mt5_model.generate(
#         input_ids, max_length=512, num_beams=4, early_stopping=True
#     )
#     translation = mt5_tokenizer.decode(generated_tokens[0], skip_special_tokens=True)

#     return jsonify({"translation": translation})


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
