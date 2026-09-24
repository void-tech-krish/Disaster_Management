#!/bin/bash
set -e

echo "Starting ML Service build script..."

# 1. Create models directory
mkdir -p models

# 2. Check required environment variables
if [ -z "$FLOOD_MODEL_URL" ]; then
  echo "Error: FLOOD_MODEL_URL environment variable is not set."
  exit 1
fi

if [ -z "$LANDSLIDE_MODEL_URL" ]; then
  echo "Error: LANDSLIDE_MODEL_URL environment variable is not set."
  exit 1
fi

# 3. Download flood model securely
echo "Downloading flood model..."
curl -sL -o models/flood_model.pkl "$FLOOD_MODEL_URL"

# 4. Download landslide model securely
echo "Downloading landslide model..."
curl -sL -o models/landslide_model.pkl "$LANDSLIDE_MODEL_URL"

# 5. Verify files exist and are not empty
for model_file in models/flood_model.pkl models/landslide_model.pkl; do
  if [ ! -s "$model_file" ]; then
    echo "Error: $model_file download failed or file is empty."
    exit 1
  fi
done

echo "Models downloaded successfully."
