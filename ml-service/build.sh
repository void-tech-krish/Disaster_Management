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

# 3. Download models securely
echo "Downloading flood model..."
curl -sL -o models/flood_model.pkl "$FLOOD_MODEL_URL"

echo "Downloading landslide model..."
curl -sL -o models/landslide_model.pkl "$LANDSLIDE_MODEL_URL"

if [ -n "$HEATWAVE_MODEL_URL" ]; then
  echo "Downloading heatwave model..."
  curl -sL -o models/heatwave_model.pkl "$HEATWAVE_MODEL_URL"
else
  echo "Warning: HEATWAVE_MODEL_URL is not set. Heatwave model will not be downloaded."
fi

if [ -n "$DROUGHT_MODEL_URL" ]; then
  echo "Downloading drought model..."
  curl -sL -o models/drought_model.pkl "$DROUGHT_MODEL_URL"
else
  echo "Warning: DROUGHT_MODEL_URL is not set. Drought model will not be downloaded."
fi

# 5. Verify files exist and are not empty for required models
for model_file in models/flood_model.pkl models/landslide_model.pkl; do
  if [ ! -s "$model_file" ]; then
    echo "Error: $model_file download failed or file is empty."
    exit 1
  fi
done

# Verify optional models if they exist
for model_file in models/heatwave_model.pkl models/drought_model.pkl; do
  if [ -f "$model_file" ] && [ ! -s "$model_file" ]; then
    echo "Error: $model_file download failed or file is empty."
    exit 1
  fi
done

echo "Models downloaded successfully."
