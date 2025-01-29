#!/bin/bash

echo "Installing necessary dependencies..."

pip install sentencepiece
pip install torch
pip install transformers

cd model_scripts || exit

echo "Running download_helsinki_nlp_mul_eng.py..."
python3 download_helsinki_nlp_mul_eng.py

echo "Running download_m2m100.py..."
python3 download_m2m100.py

echo "Running download_mbart50.py..."
python3 download_mbart50.py

echo "Running download_nllb.py..."
python3 download_nllb.py

echo "All models downloaded successfully!"
