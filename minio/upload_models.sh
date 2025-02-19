#!/bin/bash

if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ .env file not found! Please create one."
    exit 1
fi

if [[ -z "$MINIO_HOST" || -z "$ACCESS_KEY" || -z "$SECRET_KEY" || -z "$BUCKET_NAME" ]]; then
    echo "❌ Required MinIO configuration is missing in .env!"
    exit 1
fi

declare -A MODELS
MODELS=(
    [helsinkinlp]="$HELSINKI_NLP_PATH"
    [m2m100]="$M2M100_PATH"
    [mbart50]="$MBART50_PATH"
    [nllb]="$NLLB_PATH"
)

if ! command -v mc &> /dev/null; then
    echo "❌ MinIO Client (mc) is not installed. Install it first!"
    exit 1
fi

mc alias set local "$MINIO_HOST" "$ACCESS_KEY" "$SECRET_KEY" 2>/dev/null

if ! mc ls local/"$BUCKET_NAME" &> /dev/null; then
    echo "Creating bucket: $BUCKET_NAME..."
    mc mb local/"$BUCKET_NAME"
fi

for MODEL_NAME in "${!MODELS[@]}"; do
    MODELS_DIR="${MODELS[$MODEL_NAME]}"

    if [ ! -d "$MODELS_DIR" ]; then
        echo "⚠️ Directory not found: $MODELS_DIR (Skipping...)"
        continue
    fi

    echo "Uploading models from $MODELS_DIR to bucket $BUCKET_NAME under $MODEL_NAME/..."
    mc cp --recursive "$MODELS_DIR" local/"$BUCKET_NAME"/"$MODEL_NAME"/
done

echo "✅ All models uploaded successfully into $BUCKET_NAME!"
