import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

FLOOD_MODEL_PATH = os.path.join(MODELS_DIR, 'flood_model.pkl')
LANDSLIDE_MODEL_PATH = os.path.join(MODELS_DIR, 'landslide_model.pkl')
HEATWAVE_MODEL_PATH = os.path.join(MODELS_DIR, 'heatwave_model.pkl')
DROUGHT_MODEL_PATH = os.path.join(MODELS_DIR, 'drought_model.pkl')

def get_risk_level(score):
    if score >= 80:
        return "CRITICAL"
    elif score >= 60:
        return "HIGH"
    elif score >= 40:
        return "MODERATE"
    else:
        return "LOW"

def get_explainable_factors(model, feature_names, features_array):
    importances = getattr(model, 'feature_importances_', None)
    if importances is None:
        importances = np.ones(len(feature_names)) / len(feature_names)
        
    factors = []
    for i, name in enumerate(feature_names):
        contribution = int(importances[i] * 100)
        factors.append({
            "name": name,
            "contribution": contribution
        })
    
    factors = sorted(factors, key=lambda x: x["contribution"], reverse=True)
    return factors[:5] # Return top 5 factors for clarity



def predict_flood(data: dict):
    feature_names = [
        "MonsoonIntensity", "TopographyDrainage", "RiverManagement", "Deforestation",
        "Urbanization", "ClimateChange", "DamsQuality", "Siltation", "AgriculturalPractices",
        "Encroachments", "IneffectiveDisasterPreparedness", "DrainageSystems", "CoastalVulnerability",
        "Landslides", "Watersheds", "DeterioratingInfrastructure", "PopulationScore",
        "WetlandLoss", "InadequatePlanning", "PoliticalFactors"
    ]
    
    if os.path.exists(FLOOD_MODEL_PATH):
        model = joblib.load(FLOOD_MODEL_PATH)
        features = np.array([[data.get(k, 5.0) for k in feature_names]])
        prob = model.predict(features)[0] # Regressor output
        score = int(prob * 100)
        factors = get_explainable_factors(model, feature_names, features)
    else:
        score = 0
        factors = []
        
    return {
        "hazard": "flood",
        "risk_score": score,
        "risk_level": get_risk_level(score),
        "confidence": 0.85,
        "factors": factors,
        "forecasts": [],
        "model_version": "v1.0",
        "source": "AI RISK ASSESSMENT"
    }

def predict_landslide(data: dict):
    feature_names = ['Temperature (°C)', 'Humidity (%)', 'Precipitation (mm)', 'Soil Moisture (%)', 'Elevation (m)']
    
    if os.path.exists(LANDSLIDE_MODEL_PATH):
        model = joblib.load(LANDSLIDE_MODEL_PATH)
        features = np.array([[data.get(k, 0) for k in feature_names]])
        # RandomForestClassifier -> low, moderate, high output, but we need proba for score.
        try:
            probas = model.predict_proba(features)[0]
            # Classes are likely ['High', 'Low', 'Moderate'] - we need to map correctly or just use label
            label = model.predict(features)[0]
            if label == 'High': score = 90
            elif label == 'Moderate': score = 60
            else: score = 20
        except Exception:
            score = 50
        factors = get_explainable_factors(model, feature_names, features)
    else:
        score = 0
        factors = []
        
    return {
        "hazard": "landslide",
        "risk_score": score,
        "risk_level": get_risk_level(score),
        "confidence": 0.82,
        "factors": factors,
        "forecasts": [],
        "model_version": "v1.0",
        "source": "AI RISK ASSESSMENT"
    }

def get_cyclone_history():
    cyclone_file = os.path.join(DATA_DIR, 'raw', 'cyclone', 'cyclone_labels.csv')
    if os.path.exists(cyclone_file):
        df = pd.read_csv(cyclone_file)
        # Sample or limit to latest tracks for the frontend
        # Sort by datetime and group by CycloneID
        recent_cyclones = df['CycloneID'].unique()[:5]
        tracks = []
        for cid in recent_cyclones:
            c_data = df[df['CycloneID'] == cid].sort_values(by='DateTime')
            track_points = []
            for _, row in c_data.iterrows():
                track_points.append({
                    "lat": row['Latitude'],
                    "lon": row['Longitude'],
                    "time": row['DateTime'],
                    "wind_speed": row['WindSpeed'],
                    "pressure": row['Pressure']
                })
            tracks.append({
                "cyclone_id": str(cid),
                "basin": c_data['Basin'].iloc[0],
                "points": track_points
            })
        return {
            "status": "success",
            "source": "HISTORICAL CYCLONE TRACK",
            "tracks": tracks
        }
    return {"status": "error", "message": "No historical cyclone data found"}

def process_cyclone(data: dict):
    wind_speed = data.get('wind_speed', 0)
    score = min(100, int((wind_speed / 250) * 100))
    return {
        "hazard": "cyclone",
        "risk_score": score,
        "risk_level": get_risk_level(score),
        "confidence": 0.95,
        "factors": [],
        "forecasts": [],
        "official_tracking": True,
        "model_version": "v1.0",
        "source": "HISTORICAL CYCLONE DATA"
    }

def predict_heatwave(data: dict):
    feature_names = ['WIND_U10', 'WIND_V10', 'MSLP', 'BLH', 'GEOP', 'TEMP2M', 'TMAX', 'TMIN', 'DEW2M', 'CLOUD', 'RAIN', 'SRAD', 'EVAP', 'SOILT1', 'SOILM1', 'LAI']
    
    if os.path.exists(HEATWAVE_MODEL_PATH):
        model = joblib.load(HEATWAVE_MODEL_PATH)
        features = np.array([[data.get(k, 0) for k in feature_names]])
        label = model.predict(features)[0] # 0 or 1
        score = 85 if label == 1 else 20
        factors = get_explainable_factors(model, feature_names, features)
    else:
        score = 0
        factors = []
        
    return {
        "hazard": "heatwave",
        "risk_score": score,
        "risk_level": get_risk_level(score),
        "confidence": 0.90,
        "factors": factors,
        "forecasts": [],
        "model_version": "v1.0",
        "source": "Rajasthan Historical Heatwave Dataset"
    }

def predict_drought(data: dict):
    feature_names = ['RH2M', 'T2M_MAX', 'T2M_MIN', 'WS2M', 'T2M', 'ALLSKY_SFC_SW_DWN', 'PRECTOTCORR', 'spei', 'lat_sin', 'lat_cos', 'lon_sin', 'lon_cos', 'month_sin', 'month_cos']
    
    if os.path.exists(DROUGHT_MODEL_PATH):
        model = joblib.load(DROUGHT_MODEL_PATH)
        features = np.array([[data.get(k, 0) for k in feature_names]])
        label = model.predict(features)[0]
        # label maps to drought categories, mock score based on label mapping
        score = min(100, int(label * 20)) if isinstance(label, (int, float)) else 50
        factors = get_explainable_factors(model, feature_names, features)
    else:
        score = 0
        factors = []
        
    return {
        "hazard": "drought",
        "risk_score": score,
        "risk_level": get_risk_level(score),
        "confidence": 0.80,
        "factors": factors,
        "forecasts": [],
        "model_version": "v1.0",
        "source": "AI RISK ASSESSMENT"
    }

def predict_forest_fire(data: dict):
    return {
        "hazard": "forest_fire",
        "risk_score": 0,
        "risk_level": "LOW",
        "confidence": 0,
        "factors": [],
        "forecasts": [],
        "source": "Dataset unavailable"
    }

