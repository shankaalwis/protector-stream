A Web-Based Anomaly Detection and Firewall Management Solution

Using Machine Learning and a Large Language Model (LLM)

📌 Project Overview

This project aims to create a smart home network security system that automatically detects anomalies in domestic networks using Machine Learning (ML) and allows users to interact with a firewall via a Large Language Model (LLM).

The system provides an intuitive web-based dashboard and chat interface that translates technical security alerts into natural language, making cybersecurity accessible for non-technical users

1. SRI-CSG3101.2 Group - 01 Pro…

.

🎯 Goals

Detect suspicious or anomalous activities in home networks using ML.

Enable firewall management actions (block IPs, quarantine devices) via a conversational interface.

Integrate with a SIEM (Security Information and Event Management) system for data ingestion and analysis.

Provide human-readable explanations of anomalies using an LLM.

Improve usability and transparency of network security for everyday users

1. SRI-CSG3101.2 Group - 01 Pro…

.

⚙️ Core Features
✅ In-Scope

ML-based anomaly detection for network irregularities.

LLM-powered chat interface for alert explanations and guided actions.

API connectivity with one vendor’s Firewall + SIEM.

User dashboard for alerts, monitoring, and history.

User-driven security actions (approve/block devices, mark false positives).

Audit trail for accountability and reporting

1. SRI-CSG3101.2 Group - 01 Pro…

.

🚫 Out-of-Scope (Future Enhancements)

Multi-firewall integration.

Automated remediation without user consent.

Native iOS/Android apps.

Compliance modules (GDPR, ISO, HIPAA).

Blockchain-based logs & Zero-Knowledge Proof storage


👨‍💻 Team

Shanka Alwis (Lead Developer & Network Security Architect)

Thiveekshan Gunasegaran (Lead Developer, ML & LLM Engineer)

Manhith Ransilu Sanjeewa (Backend & QA Engineer)

Rashini Dulya Dias (Data Analyst & Frontend)

Thanoj Nimsara Sahabandu (Project Manager & QA Lead)

🚀 Getting Started

Clone the repository:

git clone https://github.com/<your-org>/<repo-name>.git
cd <repo-name>


Set up the environment:

python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt


Start the backend API:

uvicorn main:app --reload


Run the frontend:

cd frontend
npm install
npm start


📄 License

This project is developed as part of CSG3101.2 – Applied Project under the School of Science, Edith Cowan University.
All rights reserved © 2025.