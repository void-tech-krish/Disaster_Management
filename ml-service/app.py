from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from contextlib import asynccontextmanager
from services.prediction_service import (
    predict_flood, predict_landslide, process_cyclone, get_cyclone_history,
    predict_heatwave, predict_forest_fire, predict_drought,
    load_models, get_models_status
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    yield

app = FastAPI(title="DisasterGuard AI ML Service", lifespan=lifespan)

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
    latitude: float = 20.0
    longitude: float = 78.0
    wind_speed: float = 10.0
    cloud_cover: float = 50.0
    precipitation_probability: float = 10.0
    pressure_surface_level: float = 1000.0
    dew_point: float = 20.0
    uv_index: float = 5.0
    visibility: float = 10.0
    rainfall: float = 0.0
    solar_radiation: float = 500.0
    snowfall: float = 0.0
    max_temperature: float = 35.0
    min_temperature: float = 25.0
    max_humidity: float = 80.0
    min_humidity: float = 40.0

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
    status_data = get_models_status()
    all_loaded = all(status_data.values())
    status = "ok" if all_loaded else "degraded"
    
    return {
        "status": status,
        "models": status_data
    }

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



