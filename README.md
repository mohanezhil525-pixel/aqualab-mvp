# AquaLab: Next-Gen Water Quality Intelligence System 💧

AquaLab is a high-performance Laboratory Information Management System (LIMS) designed for speed, instant compliance checking, automated PDF reporting, and real-time geospatial monitoring of water quality.

This MVP was built to streamline the workflow of water testing laboratories, replacing manual data entry and calculation with an automated, responsive, and visually stunning digital dashboard.

## ✨ Key Features

- **Interactive Glassmorphism Dashboard:** A modern, dark-mode aesthetic with a high-performance HTML5 Canvas fluid particle physics engine running in the background.
- **Dynamic Real-Time KPIs:** Automatically calculates *Water Quality Index (WQI)*, *Non-Compliance Rate*, and *Active Load* based on the current sample dataset.
- **Geospatial Tracking:** Interactive mapping of water intake stations across major regions with real-time Safe/Warning/Breach indicators.
- **Automated Compliance Engine:** Instantly evaluates logged parameters (pH, Turbidity, TDS, etc.) against government-standard minimum and maximum thresholds.
- **One-Click Reporting:** Client-side generation of professional PDF reports with automated sign-offs and simulated email delivery workflows.
- **Comprehensive Audit Log:** A system-wide timeline tracking every action taken within the platform to maintain strict laboratory compliance.

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, React Router v6
- **Visuals:** HTML5 Canvas API (custom physics engine using `requestAnimationFrame`), Lucide React Icons
- **PDF Engine:** jsPDF, jsPDF-Autotable
- **State Management:** React Context API (Single Source of Truth)
- **Containerization & Deployment:** Docker, Docker Compose
- **Backend Architecture Setup:** Node.js API, PostgreSQL Database, Redis Cache (Provisioned via Docker for future microservice scaling).

## 🚀 Quickstart Guide (How to run locally)

The entire application environment is containerized using Docker to ensure it runs consistently on any machine. 

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) must be installed and running on your machine.

### Installation Steps

1. **Clone the repository** (or extract the project zip file):
   ```bash
   git clone <your-repository-url>
   cd water-lab-mvp
   ```

2. **Build and start the containers:**
   ```bash
   docker-compose up --build
   ```
   *(Note: The first run may take a few minutes as Docker downloads the necessary Node, Postgres, and Redis images).*

3. **Access the application:**
   - **Frontend UI:** Open your browser and navigate to `http://localhost:5173`
   - **Backend API:** `http://localhost:4000/api/health`

### Resetting the Database
The database schema and sample data load automatically the first time the `postgres` volume is created. To wipe the database and start fresh:
```bash
docker-compose down -v
docker-compose up --build
```

## 📝 Design Philosophy
The system was designed with a focus on both aesthetics and usability. Heavy DOM manipulations were avoided in favor of HTML5 Canvas for the landing page animations to maintain a strict 60fps framerate. The React Context API was utilized to prevent prop-drilling, ensuring that the heavy dataset of water samples, parameters, and audit logs could be instantly accessed and dynamically processed by any component in the application.
