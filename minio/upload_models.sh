#!/bin/bash

# MinIO credentials
MINIO_HOST="http://localhost:9000"
ACCESS_KEY="admin"
SECRET_KEY="admin123"

# List of bucket-directory pairs
declare -A BUCKETS
BUCKETS=(
    [helsinkinlp]="./<PATH_TO_helsinki>"
    [m2m100]="./<PATH_TO_m2m100>"
    [mbart50]="./<PATH_TO_mbart50>"
    [nllp]="./<PATH_TO_nllp>"
)


# Check if MinIO Client (mc) is installed
if ! command -v mc &> /dev/null; then
    echo "❌ MinIO Client (mc) is not installed. Install it first!"
    exit 1
fi

# Add MinIO alias if it doesn't exist
mc alias set local "$MINIO_HOST" "$ACCESS_KEY" "$SECRET_KEY" 2>/dev/null

# Iterate through the bucket-directory pairs
for BUCKET_NAME in "${!BUCKETS[@]}"; do
    MODELS_DIR="${BUCKETS[$BUCKET_NAME]}"
    
    # Check if the bucket exists, if not, create it
    if ! mc ls local/"$BUCKET_NAME" &> /dev/null; then
        echo "Creating bucket: $BUCKET_NAME..."
        mc mb local/"$BUCKET_NAME"
    fi

    # Upload all models to MinIO
    echo "Uploading models from $MODELS_DIR to bucket $BUCKET_NAME..."
    for file in "$MODELS_DIR"/*; do
        if [ -f "$file" ]; then
            echo "Uploading: $file..."
            mc cp "$file" local/"$BUCKET_NAME"/
        fi
    done

done

echo "✅ All models uploaded successfully!"

