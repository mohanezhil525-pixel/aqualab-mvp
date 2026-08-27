# AquaLab MVP: Project Study Guide

> [!TIP]
> **How to save as PDF:** You can right-click anywhere on this document, select "Print", and choose "Save as PDF" to generate your final file for the professor!

## 1. Project Overview
**Name:** AquaLab - Next-Gen Water Quality Intelligence System
**Problem Statement:** Water quality labs struggle with manual data entry, slow compliance checking, and disconnected reporting tools.
**Solution:** A high-performance Laboratory Information Management System (LIMS) designed for speed, instant compliance checking, automated PDF reporting, and real-time geospatial monitoring.

## 2. Core Features (What you built)
- **Interactive Dashboard:** Calculates live KPIs dynamically based on sample data. Features include *Active Load*, *Water Quality Index (WQI)*, *Non-Compliance Rate*, and historical trend charts.
- **Geospatial Tracking:** An interactive map plotting water intake stations across India (Chennai, Delhi, Pune, etc.) with real-time status indicators (Safe/Breach/Warning).
- **Automated Compliance Engine:** When lab technicians enter parameter values (like pH or Turbidity), the system instantly checks them against government-standard minimum and maximum thresholds.
- **One-Click Reporting & Sign-off:** Automatically generates professional PDF reports using `jsPDF`. Features a built-in workflow to email reports to clients and visually track the "Sent" status directly on the dashboard.
- **Interactive UI/UX:** A modern dark-mode aesthetic utilizing "Glassmorphism" (frosted glass) techniques, backed by a high-performance interactive particle physics engine on the landing page.

## 3. Technology Stack (What you used)
- **Frontend Framework:** React 18 with TypeScript (for strict typing and fewer runtime errors).
- **Routing:** React Router v6 for Single Page Application (SPA) navigation without page reloads.
- **Styling:** Tailwind CSS. Used heavily for the Glassmorphism aesthetic (`backdrop-blur`), rapid prototyping, and complex grid layouts.
- **Icons & Graphics:** `lucide-react` for lightweight, scalable vector icons.
- **PDF Generation:** `jspdf` and `jspdf-autotable` for client-side document rendering without needing a backend server to generate files.
- **Deployment & DevOps:** Docker & Docker Compose. The application runs in isolated containers, making it easy to deploy on any machine consistently.

## 4. Software Architecture & State Management
- **State Management (Context API):** The entire application is wrapped in a `LabProvider` (React Context API). 
  - *Why?* It acts as a "Single Source of Truth." Instead of passing data manually from the Dashboard to the Reports page (prop-drilling), all components read from and write to this central context. 
  - *What it holds:* `samples` (25+ seeded datasets), `auditLogs`, `stations`, and dynamic calculation methods.
- **Dynamic Metric Calculation:** The Dashboard doesn't use hardcoded numbers. It uses `.reduce()` and `.filter()` array methods to scan the global `samples` state in real-time, instantly recalculating the Water Quality Index and Compliance charts whenever new data is added.

## 5. Technical Highlights (How to impress the professor)
> [!IMPORTANT]
> **Use these talking points during your presentation to show deep technical understanding:**

1. **"I optimized the landing page animation using HTML5 Canvas."**
   - *Explanation:* Instead of rendering thousands of heavy HTML `<div>` elements for the water particles, you utilized the HTML5 `<canvas>` API with a custom physics engine running on `requestAnimationFrame`. This allows the browser to render thousands of interactive particles at a smooth 60 frames-per-second (60fps) without lagging the application.
2. **"I designed the application for scalability using Docker."**
   - *Explanation:* Even though this is an MVP, you utilized `docker-compose`. The architecture already provisions separate containers for a Backend, Postgres Database, and Redis cache, showing that you designed the system with future microservice expansion in mind.
3. **"I implemented an automated Audit Trail for compliance."**
   - *Explanation:* In scientific environments, tracking *who* did *what* is critical. You built a system-wide `addAuditLog` function in the global context so that every action (downloading a PDF, sending an email, flagging a breach) is permanently logged in the system timeline.

## 6. Workflow Demonstration Steps
When presenting, follow this flow:
1. **Start Page:** Show the interactive fluid particle canvas reacting to your mouse.
2. **System Tour:** Click through the intro slides to show the system's capabilities.
3. **Dashboard:** Show the dynamic charts and the Live Audit Log.
4. **Log Results:** Go to "Log Results", select a sample in Testing, and show how the system automatically highlights "PASS" or "FAIL" in red/green based on the numbers you type in.
5. **Reports:** Go to the Reports tab, download a PDF to show the `jsPDF` integration, and click "Message" to show the email workflow and the UI state changing to "Sent".
