


MINIO_HOST="http://localhost:9000"
ACCESS_KEY="admin"
SECRET_KEY="admin123"


BUCKET_NAME="models-bucket"


declare -A MODELS
MODELS=(
    [helsinkinlp]="./<PATH_TO_helsinki>"
    [m2m100]="./<PATH_TO_m2m100>"
    [mbart50]="./<PATH_TO_mbart50>"
    [nllb]="./<PATH_TO_nllb>"
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
