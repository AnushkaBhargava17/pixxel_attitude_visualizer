# pixxel_attitude_visualizer
# Satellite Attitude Visualizer – Pixxel Assignment

This is a full-stack web application for visualizing the orientation (attitude) of a satellite over time, using quaternion data provided daily in `.csv` format. It supports both actual and predicted data, and is designed to be used by engineers and non-technical users alike.

---

## Features

- 3D Attitude Visualization using Quaternions  
- Fixed XYZ + Rotated X'Y'Z' frame  
- Animated Time Slider with Playback  
- Actual vs Predicted comparison using color-coded cubes  
- Interactive file source visual bar  
- Export stitched CSV data (All / Actual / Predicted)  
- Save 3D Plot as PNG  
- Web-based GUI (multi-user capable)

---

## Folder Structure

pixxel_attitude_visualizer/
├── code/
│ ├── app.py # Flask server
│ ├── data_loader.py # CSV loader and stitching
│ ├── prediction_model.py # evaluation model
│ ├── quaternion_utils.py # Rotation computation
│ ├── static/
│ │ └── script.js # Main frontend logic
│ └── templates/
│ └── index.html # Main HTML page
├── data/ # Daily input CSV files which can be modified 
│ ├── attitude_2025-06-14.csv
│ ├── ...
│ └── exported_actuals.csv
├── requirements.txt
└── README.md

---

## Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

```bash
git clone https://github.com/AnushkaBhargava17/pixxel_attitude_visualizer.git
cd pixxel_attitude_visualizer
pip install -r requirements.txt
cd code
python code/app.py
Then open http://127.0.0.1:5000 

