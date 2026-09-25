from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.prediction_service import (
    predict_flood, predict_landslide, process_cyclone, get_cyclone_history,
    predict_heatwave, predict_forest_fire, predict_drought
)

app = FastAPI(title="DisasterGuard AI ML Service")

class FloodRequest(BaseModel):
    MonsoonIntensity: float = 5.0
    TopographyDrainage: float = 5.0
    RiverManagement: float = 5.0
    Deforestation: float = 5.0
    Urbanization: float = 5.0
    ClimateChange: float = 5.0
    DamsQuality: float = 5.0
    Siltation: float = 5.0
    AgriculturalPractices: float = 5.0
    Encroachments: float = 5.0
    IneffectiveDisasterPreparedness: float = 5.0
    DrainageSystems: float = 5.0
    CoastalVulnerability: float = 5.0
    Landslides: float = 5.0
    Watersheds: float = 5.0
    DeterioratingInfrastructure: float = 5.0
    PopulationScore: float = 5.0
    WetlandLoss: float = 5.0
    InadequatePlanning: float = 5.0
    PoliticalFactors: float = 5.0

class LandslideRequest(BaseModel):
    temperature_c: float = Field(alias="Temperature (°C)", default=25.0)
    humidity_pct: float = Field(alias="Humidity (%)", default=50.0)
    precipitation_mm: float = Field(alias="Precipitation (mm)", default=10.0)
    soil_moisture_pct: float = Field(alias="Soil Moisture (%)", default=40.0)
    elevation_m: float = Field(alias="Elevation (m)", default=500.0)

class HeatwaveRequest(BaseModel):
    WIND_U10: float = 0.0
    WIND_V10: float = 0.0
    MSLP: float = 1000.0
    BLH: float = 1000.0
    GEOP: float = 1000.0
    TEMP2M: float = 30.0
    TMAX: float = 35.0
    TMIN: float = 25.0
    DEW2M: float = 20.0
    CLOUD: float = 0.5
    RAIN: float = 0.0
    SRAD: float = 500.0
    EVAP: float = 0.1
    SOILT1: float = 30.0
    SOILM1: float = 0.2
    LAI: float = 1.0
    lat: Optional[float] = None
    lon: Optional[float] = None

class DroughtRequest(BaseModel):
    RH2M: float = 50.0
    T2M_MAX: float = 35.0
    T2M_MIN: float = 20.0
    WS2M: float = 5.0
    T2M: float = 28.0
    ALLSKY_SFC_SW_DWN: float = 20.0
    PRECTOTCORR: float = 0.0
    spei: float = 0.0
    lat_sin: float = 0.0
    lat_cos: float = 1.0
    lon_sin: float = 0.0
    lon_cos: float = 1.0
    month_sin: float = 0.0
    month_cos: float = 1.0

class GenericRequest(BaseModel):
    # Fallback for Phase 3 unimplemented features
    temperature: Optional[float] = 30.0
    humidity: Optional[float] = 50.0
    wind_speed: Optional[float] = 10.0
    vegetation_dryness: Optional[float] = 50.0
    rainfall_deficit: Optional[float] = 0.0
    soil_moisture: Optional[float] = 50.0
    rainfall_intensity: Optional[float] = 0.0
    slope: Optional[float] = 0.0

@app.get("/health")
def health_check():
    import os
    flood_model = os.path.exists("models/flood_model.pkl")
    landslide_model = os.path.exists("models/landslide_model.pkl")
    if not (flood_model and landslide_model):
        raise HTTPException(status_code=503, detail="Required ML models are missing")
    return {"status": "success", "message": "ML Service is running with all models loaded"}

@app.post("/predict/flood")
def get_flood_prediction(data: FloodRequest):
    try:
        return predict_flood(data.model_dump(by_alias=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/landslide")
def get_landslide_prediction(data: LandslideRequest):
    try:
        return predict_landslide(data.model_dump(by_alias=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/data/cyclone")
def get_cyclone_data():
    try:
        return get_cyclone_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/heatwave")
def get_heatwave_prediction(data: HeatwaveRequest):
    try:
        return predict_heatwave(data.model_dump(by_alias=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/forest_fire")
def get_forest_fire_prediction(data: GenericRequest):
    try:
        return predict_forest_fire(data.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/drought")
def get_drought_prediction(data: DroughtRequest):
    try:
        return predict_drought(data.model_dump(by_alias=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



