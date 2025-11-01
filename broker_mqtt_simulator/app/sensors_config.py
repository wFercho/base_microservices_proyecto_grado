# Estructura de datos basada en normativas mineras (DS 024-2016-EM, ISO 45001, ISO 14001)
SENSOR_TYPES = {
    # Material particulado
    "PM10": {
        "unit": "µg/m³", 
        "min": 0, 
        "max": 500,
        "safe_max": 150,      # ISO 14001 - Límite recomendado 24h
        "danger_threshold": 250,
        "warning_threshold": 150,
        "typical_range": (20, 100)
    },
    "PM2.5": {
        "unit": "µg/m³", 
        "min": 0, 
        "max": 300,
        "safe_max": 35,       # EPA Standard (24h)
        "danger_threshold": 150,
        "warning_threshold": 75,
        "typical_range": (10, 50)
    },
    
    # Gases tóxicos
    "CO": {
        "unit": "ppm", 
        "min": 0, 
        "max": 100,
        "safe_max": 25,       # DS 024-2016-EM (8 horas)
        "danger_threshold": 50,
        "warning_threshold": 35,
        "typical_range": (0, 15)
    },
    "CO2": {
        "unit": "ppm", 
        "min": 300, 
        "max": 5000,
        "safe_max": 5000,     # DS 024-2016-EM
        "danger_threshold": 10000,
        "warning_threshold": 7500,
        "typical_range": (400, 2000)
    },
    "O2": {
        "unit": "%", 
        "min": 0, 
        "max": 25,
        "safe_min": 19.5,     # DS 024-2016-EM - Mínimo requerido
        "safe_max": 23.5,     # Máximo seguro
        "danger_threshold": 18,  # Peligro de asfixia
        "warning_threshold": 19,
        "typical_range": (20, 21)
    },
    "H2S": {
        "unit": "ppm", 
        "min": 0, 
        "max": 20,
        "safe_max": 10,       # DS 024-2016-EM
        "danger_threshold": 15,  # Muy peligroso
        "warning_threshold": 10,
        "typical_range": (0, 5)
    },
    "NO2": {
        "unit": "ppm", 
        "min": 0, 
        "max": 10,
        "safe_max": 3,        # DS 024-2016-EM
        "danger_threshold": 5,
        "warning_threshold": 3,
        "typical_range": (0, 2)
    },
    "Metano": {
        "unit": "%", 
        "min": 0, 
        "max": 5,
        "safe_max": 0.5,      # DS 024-2016-EM
        "danger_threshold": 1.0,  # Peligro de explosión
        "warning_threshold": 0.8,
        "typical_range": (0, 0.3)
    },
    "SO2": {
        "unit": "ppm", 
        "min": 0, 
        "max": 10,
        "safe_max": 2,        # OSHA
        "danger_threshold": 5,
        "warning_threshold": 3,
        "typical_range": (0, 1)
    },
    
    # Parámetros ambientales
    "Temperatura": {
        "unit": "°C", 
        "min": -10, 
        "max": 45,
        "safe_max": 30,       # DS 024-2016-EM - Temperatura confortable
        "danger_threshold": 35,  # Estrés térmico
        "warning_threshold": 32,
        "typical_range": (15, 28)
    },
    "Humedad": {
        "unit": "%", 
        "min": 0, 
        "max": 100,
        "safe_max": 70,       # OSHA - Rango confortable
        "safe_min": 30,
        "danger_threshold": 85,
        "warning_threshold": 75,
        "typical_range": (40, 65)
    },
    "Presión": {
        "unit": "Pa", 
        "min": 85000, 
        "max": 110000,
        "safe_min": 95000,
        "safe_max": 105000,
        "typical_range": (98000, 103000)
    },
    
    # Factores físicos
    "Ruido": {
        "unit": "dB", 
        "min": 30, 
        "max": 120,
        "safe_max": 85,       # DS 024-2016-EM (8 horas)
        "danger_threshold": 100,  # Daño auditivo
        "warning_threshold": 90,
        "typical_range": (70, 95)
    },
    "Vibración": {
        "unit": "m/s²", 
        "min": 0, 
        "max": 25,
        "safe_max": 5,        # ISO 2631 - Límite exposición 8h
        "danger_threshold": 15,
        "warning_threshold": 10,
        "typical_range": (0, 8)
    },
    
    # Calidad ambiental
    "Polvo_Respirable": {
        "unit": "mg/m³", 
        "min": 0, 
        "max": 10,
        "safe_max": 3,        # DS 024-2016-EM
        "danger_threshold": 5,
        "warning_threshold": 4,
        "typical_range": (0.5, 2.5)
    },
    "Iluminación": {
        "unit": "lux", 
        "min": 0, 
        "max": 1000,
        "safe_min": 50,       # DS 024-2016-EM - Mínimo en galerías
        "safe_max": 500,      # Óptimo para trabajo
        "typical_range": (100, 400)
    },
    "Radiación_UV": {
        "unit": "µW/cm²", 
        "min": 0, 
        "max": 1000,
        "safe_max": 100,      # Límite exposición 8h
        "danger_threshold": 500,
        "warning_threshold": 200,
        "typical_range": (10, 80)
    },
    
    # Seguridad estructural
    "Deformación_Techo": {
        "unit": "mm", 
        "min": 0, 
        "max": 100,
        "safe_max": 20,       # Límite de seguridad
        "danger_threshold": 50,
        "warning_threshold": 30,
        "typical_range": (0, 15)
    },
    "Presión_Soporte": {
        "unit": "MPa", 
        "min": 0, 
        "max": 50,
        "safe_max": 30,       # Capacidad diseño
        "danger_threshold": 40,
        "warning_threshold": 35,
        "typical_range": (10, 25)
    },
    
    # Calidad de agua (si aplica en minería)
    "pH_Agua": {
        "unit": "pH", 
        "min": 0, 
        "max": 14,
        "safe_min": 6.5,
        "safe_max": 8.5,
        "danger_threshold": 4,
        "warning_threshold_low": 5.5,
        "warning_threshold_high": 9,
        "typical_range": (6.8, 7.8)
    },
    "Turbidez_Agua": {
        "unit": "NTU", 
        "min": 0, 
        "max": 100,
        "safe_max": 5,        # Límite potable
        "danger_threshold": 50,
        "warning_threshold": 10,
        "typical_range": (0.1, 3)
    }
}

MANUFACTURERS = {
    "AirQuality Pro": ["AQ-3000", "AQ-5000X", "AQ-GasMonitor"],
    "Industrial Sensors": ["IS-PM10", "IS-PM2.5", "IS-MultiGas"],
    "SafeMine Tech": ["SMT-Gas-100", "SMT-Gas-200", "SMT-Structural"],
    "EnviroMonitor": ["EM-Climate", "EM-Multi", "EM-WaterQuality"],
    "NoiseGuard": ["NG-6000", "NG-Pro", "NG-Vibration"],
    "VibrationSense": ["VS-Industrial", "VS-Mining", "VS-Structural"],
    "OxygenTech": ["OT-Safe", "OT-Precision", "OT-MultiGas"],
    "GasAlert": ["GA-Multi", "GA-Portable", "GA-Fixed"],
    "WaterSafe": ["WS-pH100", "WS-Turbidity", "WS-Quality"],
    "MineSafety Inc": ["MS-Structural", "MS-Deformation", "MS-Pressure"]
}

INSTALL_TYPES = ["Fijo de superficie", "Empotrado en pared", "Montaje en techo", "Portátil", "Subterráneo"]
PROTOCOLS = ["Modbus RTU", "RS485", "4-20mA", "Digital", "LoRaWAN", "Zigbee"]
CERTIFICATIONS = ["ATEX", "IECEx", "CE", "ISO 9001", "ISO 14001", "ISO 45001", "MSHA"]
