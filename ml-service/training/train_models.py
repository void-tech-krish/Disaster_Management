import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, precision_score, recall_score, f1_score
import joblib
import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

model_registry = []

def train_flood():
    print("Training Flood Model...")
    df = pd.read_csv(os.path.join(DATA_DIR, 'raw', 'flood', 'train.csv'))
    # Sample data to speed up execution for demonstration purposes
    df = df.sample(n=50000, random_state=42)
    
    target = 'FloodProbability'
    features = [c for c in df.columns if c not in ['id', target]]
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    model_path = os.path.join(MODELS_DIR, 'flood_model.pkl')
    joblib.dump(model, model_path)
    
    model_registry.append({
        "hazard": "FLOOD",
        "model_version": "flood-v1",
        "algorithm": "RandomForestRegressor",
        "dataset": "train.csv",
        "target": target,
        "features": features,
        "metrics": {"MSE": mse, "R2": r2},
        "status": "TRAINED"
    })
    print(f"Flood Model Trained. R2: {r2}")

def train_landslide():
    print("Training Landslide Model...")
    df = pd.read_csv(os.path.join(DATA_DIR, 'raw', 'landslide', 'regenerated_landslide_risk_dataset.csv'))
    
    target = 'Landslide Risk Prediction'
    features = ['Temperature (°C)', 'Humidity (%)', 'Precipitation (mm)', 'Soil Moisture (%)', 'Elevation (m)']
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    model_path = os.path.join(MODELS_DIR, 'landslide_model.pkl')
    joblib.dump(model, model_path)
    
    model_registry.append({
        "hazard": "LANDSLIDE",
        "model_version": "landslide-v1",
        "algorithm": "RandomForestClassifier",
        "dataset": "regenerated_landslide_risk_dataset.csv",
        "target": target,
        "features": features,
        "metrics": {"Accuracy": acc},
        "status": "TRAINED"
    })
    print(f"Landslide Model Trained. Accuracy: {acc}")

def train_heatwave():
    print("Training Heatwave Model...")
    df = pd.read_csv(os.path.join(DATA_DIR, 'raw', 'heatwave', 'Rajasthan_Heatwave_2006_2025.csv'))
    
    # Chronological split
    df_sorted = df.sort_values(by=['YEAR', 'MONTH', 'DAY'])
    
    target = 'HEATWAVE'
    # excluding identifiers and target
    features = ['WIND_U10', 'WIND_V10', 'MSLP', 'BLH', 'GEOP', 'TEMP2M', 'TMAX', 'TMIN', 'DEW2M', 'CLOUD', 'RAIN', 'SRAD', 'EVAP', 'SOILT1', 'SOILM1', 'LAI']
    
    split_index = int(len(df_sorted) * 0.8)
    train_df = df_sorted.iloc[:split_index]
    test_df = df_sorted.iloc[split_index:]
    
    X_train = train_df[features]
    y_train = train_df[target]
    X_test = test_df[features]
    y_test = test_df[target]
    
    model = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    model_path = os.path.join(MODELS_DIR, 'heatwave_model.pkl')
    joblib.dump(model, model_path)
    
    model_registry.append({
        "hazard": "HEATWAVE",
        "model_version": "heatwave-v1",
        "algorithm": "RandomForestClassifier",
        "dataset": "Rajasthan_Heatwave_2006_2025.csv",
        "target": target,
        "features": features,
        "metrics": {"Accuracy": acc},
        "status": "TRAINED"
    })
    print(f"Heatwave Model Trained. Accuracy: {acc}")

def train_drought():
    print("Training Drought Model...")
    df = pd.read_csv(os.path.join(DATA_DIR, 'raw', 'drought', 'stage_4_drought_dataset.csv'))
    
    target = 'label'
    features = ['RH2M', 'T2M_MAX', 'T2M_MIN', 'WS2M', 'T2M', 'ALLSKY_SFC_SW_DWN', 'PRECTOTCORR', 'spei', 'lat_sin', 'lat_cos', 'lon_sin', 'lon_cos', 'month_sin', 'month_cos']
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    model_path = os.path.join(MODELS_DIR, 'drought_model.pkl')
    joblib.dump(model, model_path)
    
    model_registry.append({
        "hazard": "DROUGHT",
        "model_version": "drought-v1",
        "algorithm": "RandomForestClassifier",
        "dataset": "stage_4_drought_dataset.csv",
        "target": target,
        "features": features,
        "metrics": {"Accuracy": acc},
        "status": "TRAINED"
    })
    print(f"Drought Model Trained. Accuracy: {acc}")


def train_cyclone():
    print("Training Cyclone Model...")
    df = pd.read_csv(os.path.join(DATA_DIR, 'raw', 'cyclone', 'cyclone_labels.csv'))
    
    target = 'WindSpeed'
    features = ['Longitude', 'Latitude', 'PressureDrop', 'Pressure']
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    model_path = os.path.join(MODELS_DIR, 'cyclone_model.pkl')
    joblib.dump(model, model_path)
    
    model_registry.append({
        "hazard": "CYCLONE",
        "model_version": "cyclone-v1",
        "algorithm": "RandomForestRegressor",
        "dataset": "cyclone_labels.csv",
        "target": target,
        "features": features,
        "metrics": {"MSE": mse, "R2": r2},
        "status": "TRAINED"
    })
    print(f"Cyclone Model Trained. R2: {r2}")


if __name__ == '__main__':
    train_flood()
    train_landslide()
    train_heatwave()
    train_drought()
    train_cyclone()
    
    registry_path = os.path.join(MODELS_DIR, 'model_registry.json')
    with open(registry_path, 'w') as f:
        json.dump(model_registry, f, indent=4)
    print("All models trained and registry saved.")
