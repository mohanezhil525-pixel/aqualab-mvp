# AquaLab: Next-Gen Water Quality Intelligence System

A high-performance Laboratory Information Management System (LIMS) designed for speed, instant compliance checking, automated PDF reporting, and real-time geospatial monitoring of water quality.

---

## Overview

This project is a role-based and highly interactive data management platform built with React, TypeScript, Node.js, and PostgreSQL.

The platform streamlines the workflow of water testing laboratories, replacing manual data entry and calculation with an automated, responsive, and visually stunning digital dashboard. Heavy DOM manipulations were avoided in favor of HTML5 Canvas for the landing page animations to maintain a strict 60fps framerate. The React Context API was utilized to prevent prop-drilling, ensuring that the heavy dataset of water samples, parameters, and audit logs could be instantly accessed and dynamically processed by any component in the application.

---

## Features

### Dashboard & Visuals
* Interactive Glassmorphism Dashboard with a dark-mode aesthetic
* High-performance HTML5 Canvas fluid particle physics engine running in the background
* Dynamic Real-Time KPIs that automatically calculate Water Quality Index (WQI), Non-Compliance Rate, and Active Load based on the current sample dataset

### Monitoring & Compliance
* Interactive mapping of water intake stations across major regions with real-time Safe/Warning/Breach indicators
* Automated Compliance Engine that instantly evaluates logged parameters (pH, Turbidity, TDS, etc.) against government-standard minimum and maximum thresholds

### Reporting & Auditing
* Client-side generation of professional PDF reports with automated sign-offs
* Simulated email delivery workflows
* System-wide timeline tracking every action taken within the platform to maintain strict laboratory compliance

---

## Technology Stack

### Frontend
* React 18
* TypeScript
* Tailwind CSS
* React Router v6
* HTML5 Canvas API
* jsPDF & jsPDF-Autotable

### Backend & Database
* Node.js
* PostgreSQL
* Redis Cache
* Docker & Docker Compose

### Development Tools
* npm
* Git
* Vite

---

## Project Structure

```text
water-lab-mvp/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/
│   │   │   ├── reports.js
│   │   │   ├── results.js
│   │   │   └── samples.js
│   │   ├── complianceThresholds.js
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   └── WaterBackground.tsx
│   │   ├── context/
│   │   │   └── LabContext.tsx
│   │   ├── lib/
│   │   │   └── pdfGenerator.ts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── IntroPage.tsx
│   │   │   ├── LabAnalysis.tsx
│   │   │   ├── ReportView.tsx
│   │   │   ├── SourceMap.tsx
│   │   │   └── StartPage.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml
```

---

## Quickstart Guide

The entire application environment is containerized using Docker to ensure it runs consistently on any machine. 

### Prerequisites
* Docker must be installed and running on your machine.

### Installation Steps

1. Clone the repository
   ```bash
   git clone <your-repository-url>
   cd water-lab-mvp
   ```

2. Build and start the containers
   ```bash
   docker-compose up --build
   ```

3. Access the application
   * Frontend UI: `http://localhost:5173`
   * Backend API: `http://localhost:4000/api/health`

### Resetting the Database
The database schema and sample data load automatically the first time the postgres volume is created. To wipe the database and start fresh:
```bash
docker-compose down -v
docker-compose up --build
```