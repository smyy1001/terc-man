from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import os

model_name = "Helsinki-NLP/opus-mt-mul-en"

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
save_path = os.path.join(base_dir, "models", "helsinki_nlp")

os.makedirs(save_path, exist_ok=True)

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

tokenizer.save_pretrained(save_path)
model.save_pretrained(save_path)
