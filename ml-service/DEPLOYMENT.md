# ML Service Deployment Documentation

This document outlines the required steps, environment variables, and architecture for deploying the DisasterGuard AI ML Service.

## 1. Build Command
To prepare the environment and download the necessary models, run:
```bash
chmod +x build.sh
./build.sh
pip install -r requirements.txt
```

## 2. Start Command
To start the production server, use:
```bash
uvicorn app:app --host 0.0.0.0 --port $PORT
```
*Note: The application dynamically binds to the `$PORT` environment variable provided by your cloud host (e.g., Render, Railway).*

## 3. Required Environment Variables
The following environment variables **must** be set for the service to build and start successfully:
- `PORT`: The port number the server will listen on.
- `FLOOD_MODEL_URL`: The direct download URL for the `flood_model.pkl` file (approx. 155MB).
- `LANDSLIDE_MODEL_URL`: The direct download URL for the `landslide_model.pkl` file.

## 4. Optional Environment Variables
For full prediction capabilities, configure the following variables:
- `HEATWAVE_MODEL_URL`: The direct download URL for `heatwave_model.pkl`.
- `DROUGHT_MODEL_URL`: The direct download URL for `drought_model.pkl`.

*If these are not provided, the respective endpoints will raise an error indicating the model is unavailable.*

## 5. Health Endpoint
**`GET /health`**
Returns the status of the service and the availability of each model.
```json
{
  "status": "ok",
  "models": {
    "flood": true,
    "landslide": true,
    "heatwave": true,
    "drought": true
  }
}
```
If a required model fails to load, `status` will read `"degraded"` and the specific model will be marked as `false`.

## 6. Prediction Endpoints
- `POST /predict/flood`
- `POST /predict/landslide`
- `POST /predict/heatwave`
- `POST /predict/drought`
- `POST /predict/forest_fire` (See limitations below)
- `GET /data/cyclone`

## 7. Model Download Architecture
Due to GitHub file size limits (specifically for the 155MB Flood model), `.pkl` and `.joblib` files are excluded from source control via `.gitignore`. 
Instead, models are fetched securely during the build phase (`build.sh`) via `curl` using the environment variables defined above. They are then loaded into memory **once** at server startup (`lifespan`) to ensure optimal performance.

## 8. Cyclone CSV Requirement
The historical cyclone endpoint (`GET /data/cyclone`) requires the local CSV dataset.
**Important:** Do not delete or ignore `data/raw/cyclone/cyclone_labels.csv`. It is explicitly whitelisted in `.gitignore` and must be packaged with the deployment.

## 9. Forest Fire DEMO Limitation
The `POST /predict/forest_fire` endpoint is maintained for API contract compatibility but is explicitly marked as **DEMO / NOT TRAINED**. It will safely return a null risk score and an `UNKNOWN` risk level.

## 10. Local Verification Steps
To simulate a clean deployment environment locally:
1. Create a fresh virtual environment: `python -m venv venv2`
2. Activate it: `source venv2/bin/activate` (Linux/Mac) or `.\venv2\Scripts\activate` (Windows)
3. Set your environment variables (e.g., `$env:PORT=8000`).
4. Run `./build.sh` (Requires valid URLs).
5. Run `pip install -r requirements.txt`.
6. Start the server: `uvicorn app:app --host 0.0.0.0 --port $PORT`.
7. Test the health endpoint: `curl http://localhost:8000/health`.
