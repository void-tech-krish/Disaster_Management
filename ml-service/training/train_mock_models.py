import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Mock data generation for Flood
def generate_flood_data(n=1000):
    np.random.seed(42)
    rainfall = np.random.uniform(0, 300, n)
    river_level = np.random.uniform(0, 10, n)
    soil_moisture = np.random.uniform(10, 100, n)
    elevation = np.random.uniform(0, 500, n)
    river_distance = np.random.uniform(0.1, 10, n)
    
    # Label logic: high rain + high river level + low elevation -> higher risk (1)
    risk_score = (rainfall * 0.3) + (river_level * 10) + (soil_moisture * 0.2) - (elevation * 0.1)
    labels = (risk_score > 80).astype(int)
    
    return pd.DataFrame({
        'rainfall': rainfall,
        'river_level': river_level,
        'soil_moisture': soil_moisture,
        'elevation': elevation,
        'river_distance': river_distance
    }), labels

# Mock data generation for Landslide
def generate_landslide_data(n=1000):
    np.random.seed(42)
    rainfall = np.random.uniform(0, 300, n)
    slope = np.random.uniform(0, 60, n)
    elevation = np.random.uniform(100, 3000, n)
    soil_moisture = np.random.uniform(10, 100, n)
    historical = np.random.randint(0, 5, n)
    
    risk_score = (rainfall * 0.2) + (slope * 1.5) + (historical * 10)
    labels = (risk_score > 70).astype(int)
    
    return pd.DataFrame({
        'rainfall': rainfall,
        'slope': slope,
        'elevation': elevation,
        'soil_moisture': soil_moisture,
        'historical_landslides': historical
    }), labels

def train_and_save():
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    # Train Flood Model
    print("Training Flood Model...")
    X_flood, y_flood = generate_flood_data()
    flood_model = RandomForestClassifier(n_estimators=100, random_state=42)
    flood_model.fit(X_flood, y_flood)
    joblib.dump(flood_model, os.path.join(models_dir, 'flood_model.pkl'))
    print("Flood model saved.")
    
    # Train Landslide Model
    print("Training Landslide Model...")
    X_land, y_land = generate_landslide_data()
    land_model = RandomForestClassifier(n_estimators=100, random_state=42)
    land_model.fit(X_land, y_land)
    joblib.dump(land_model, os.path.join(models_dir, 'landslide_model.pkl'))
    print("Landslide model saved.")

if __name__ == "__main__":
    train_and_save()
