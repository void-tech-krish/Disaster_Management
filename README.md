# DisasterGuard AI
**Location-Based Multi-Hazard Early Warning & Preparedness System**

DisasterGuard AI is a comprehensive decision-support and preparedness platform designed to ingest multi-hazard risk signals, assess vulnerabilities in real-time using ML, and coordinate rapid response operations.

> [!WARNING]
> **Scientific Responsibility Disclaimer:**
> DisasterGuard AI is a decision-support platform. It **does not replace** government authorities, official emergency services, official warning systems, or professional disaster-management agencies.
> - **AI Risk Assessments** are statistical predictions, not guarantees of safety or imminent disaster.
> - **Official Warnings** are displayed ONLY when sourced directly from verified government channels.
> - **Earthquake Modules** focus entirely on vulnerability zoning and post-event response. The system explicitly does not support short-term earthquake prediction.
> - Some integrated datasets (such as Cyclone or Flash Flood data) are currently strictly for **DEMO/SIMULATION** purposes and are labeled as such throughout the UI. 

---

## 🏗️ Architecture

### Frontend (User & Authority Dashboards)
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Mapping:** Leaflet & OpenStreetMap
- **Charts:** Recharts
- **Live Sync:** Socket.IO Client

### Backend (API & Event Routing)
- **Framework:** Node.js + Express.js
- **Database Driver:** `pg` (PostgreSQL/PostGIS)
- **Authentication:** JWT, bcrypt
- **Real-Time Engine:** Socket.IO
- **Simulation Engine:** Dynamic What-If Risk calculation without persistent broadcast

### Database (Storage & Geocoding)
- **Provider:** Neon Serverless PostgreSQL
- **Extensions:** PostGIS (for A* routing and spatial nearest-neighbor queries)

### ML Service (Risk Scoring)
- **Framework:** Python + FastAPI
- **Libraries:** Pandas, NumPy, Scikit-learn, XGBoost, Joblib

---

## 🚀 Setup & Installation

### 1. Database Setup
Ensure you have a [Neon](https://neon.tech) PostgreSQL database initialized with the `postgis` extension enabled.
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 2. Environment Variables
You must define the following variables securely in your host environments (do NOT commit `.env` files). See `backend/.env.example` for details.

**Backend Required Vars:**
- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL`
- `ML_SERVICE_URL`

**Frontend Required Vars:**
- `VITE_API_URL`
- `VITE_SOCKET_URL`

### 3. Running Locally
**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ Deployment Guides

### Frontend (Vercel)
1. Link your GitHub repository to Vercel.
2. Select the `frontend` root directory.
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. Inject your `VITE_API_URL` and `VITE_SOCKET_URL` variables pointing to your deployed backend.

### Backend (Render / Railway)
1. Connect your repository to Render Web Service.
2. Select the `backend` root directory.
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Inject the required Node environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`). Ensure `CLIENT_URL` matches your Vercel deployment.

### ML Service (Render / Railway)
1. Create a Python Web Service.
2. Select the `ml-service` root directory.
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`

---

## 🔒 Security & Accountability
- **Audit Logs:** All authoritative API interactions are logged securely to an append-only `audit_logs` table (viewable via EOC Dashboard).
- **CORS:** Cross-Origin Resource Sharing is strictly locked to `CLIENT_URL` in production.
- **Rate Limiting:** Global rate limit is configured to 300req/15min, with an aggressive 20req/15min limit on authentication endpoints.
- **Error Boundaries:** Frontend UI crashes are caught securely without leaking stack traces to standard users.

---

## 🔬 Advanced AI Risk Intelligence (Step 19)

DisasterGuard AI features a robust Advanced Risk Intelligence module designed to promote transparency and structured decision-support:

- **What-If Simulation Engine**: Users can dynamically tweak environmental factors (e.g., Rainfall, River Level, Slope) to observe baseline vs scenario risk deltas. These are isolated simulations, clearly labeled, and not broadcast globally to prevent panic.
- **Explainable AI (XAI)**: Feature contributions are explicitly ranked and visualized in the UI (e.g., Rainfall: 45% contribution). This is an interpretative tool, not a declaration of strict causality.
- **Strict Forecasting Limitations**: If a model does not possess a verified auto-regressive or temporal structure, the system intentionally blocks fabricated predictions and clearly outputs **"FORECAST NOT AVAILABLE"**.
- **Model Versioning & Integrity**: All predictions return strict source metadata and model versioning to trace decision logic.

---
*Built during Phase 3 Development Cycle - Step 19 (Advanced AI Risk Intelligence).*

## ?? Community Reporting & Transparency (Step 27)

- **Citizen Reports:** Citizens can securely submit observation reports with categorized evidence from the ground.
- **Authority Review:** EOC Operators use a dedicated dashboard to manually review, verify, or reject incoming reports. Unverified data is strictly isolated.
- **Public Transparency Map:** Verified citizen reports are plotted alongside Official Warnings. Coordinates are explicitly approximate for privacy.
- **Response & Recovery Integration:** Verified reports are safely linked to live Incidents or active Response Cases for operational clarity.
- **Security & Privacy:** Built-in duplicate detection and strict spatial coordinate fuzzing ensure public datasets protect citizen privacy without opaque ML scoring.


## ?? Intelligent Evacuation & Shelter Coordination (Step 28)

- **Evacuation Advisories:** Generates decision-support recommendations based on hazard severity and population exposure.
- **Human-In-The-Loop Approval:** Advisories are strictly 'PENDING_REVIEW' until manually approved and activated by an Authority via the EOC Dashboard.
- **Shelter Gap Analysis:** Actively calculates the disparity between populations at risk and available shelter capacity.
- **Lower-Risk Routing:** Provides evaluated evacuation routes (explicitly not branded as 'Guaranteed Safe') with segment-by-segment hazard exposure breakdowns.
- **Evacuation Simulator:** Allows authorities to test 'What-If' scenarios (e.g. Vijayawada Flood) to practice workflows without triggering live citizen broadcasts.

