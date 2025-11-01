"""
Archivo de configuración para el servicio de notificaciones por email
"""


EMAIL_CONFIG_GMAIL = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "email_user": "oscarguerr0205@gmail.com", 
    "email_password": "orcrlfosvmesyyko",  
    "from_email": "oscarguerr0205@gmail.com"
}



EMAIL_CONFIG = EMAIL_CONFIG_GMAIL  


ALERT_RECIPIENTS = {
    "DANGER": [
        "oscar.guerrero01@uptc.edu.co",
        "william.salamanca02@uptc.edu.co"
    ],
    "WARNING": [
        "oscar.guerrero01@uptc.edu.co",
        "william.salamanca02@uptc.edu.co"
    ],
    "OK": []  # No enviar emails para estado normal
}


ALERT_SETTINGS = {
    # Enviar solo una alerta cada X minutos para el mismo sensor
    "cooldown_minutes": 15,
    
    # Tipos de sensor que requieren notificación inmediata
    "critical_sensors": [
        "O2",           # Oxígeno
        "CO",           # Monóxido de carbono
        "H2S",          # Sulfuro de hidrógeno
        "Metano",       # Gas metano
        "CH4"
    ],
    
    # Enviar resumen diario
    "daily_summary": {
        "enabled": True,
        "time": "08:00",  # Hora de envío (formato 24h)
        "recipients": [
            "gerente.operaciones@empresa.com",
            "jefe.seguridad@empresa.com"
        ]
    },
    
    # Configuración de intentos de reenvío
    "retry_attempts": 3,
    "retry_delay_seconds": 60
}


CUSTOM_MESSAGES = {
    "DANGER": {
        "subject_prefix": "🚨 ALERTA CRÍTICA",
        "priority": "urgent",
        "message": "Se ha detectado una condición peligrosa que requiere acción inmediata."
    },
    "WARNING": {
        "subject_prefix": "⚠️ ADVERTENCIA",
        "priority": "high",
        "message": "Se ha detectado una condición anormal que requiere atención."
    }
}

# ===========================
# CONFIGURACIÓN DE LOGS
# ===========================
LOG_CONFIG = {
    "enabled": True,
    "file": "email_notifications.log",
    "level": "INFO",  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    "max_size_mb": 10,
    "backup_count": 5
}

# ===========================
# VALIDACIÓN DE CONFIGURACIÓN
# ===========================
def validate_config():
    """Valida que la configuración esté completa"""
    required_keys = ["smtp_server", "smtp_port", "email_user", "email_password", "from_email"]
    
    for key in required_keys:
        if key not in EMAIL_CONFIG or not EMAIL_CONFIG[key]:
            raise ValueError(f"⚠️ Falta configurar: {key} en EMAIL_CONFIG")
    
    if "tu-email" in EMAIL_CONFIG["email_user"] or "xxxx" in EMAIL_CONFIG["email_password"]:
        raise ValueError("⚠️ Debes configurar tu email y contraseña en config_email.py")
    
    print("✅ Configuración de email validada correctamente")
    return True

if __name__ == "__main__":
    # Test de configuración
    try:
        validate_config()
        print("\n📧 Configuración actual:")
        print(f"   Servidor: {EMAIL_CONFIG['smtp_server']}:{EMAIL_CONFIG['smtp_port']}")
        print(f"   Usuario: {EMAIL_CONFIG['email_user']}")
        print(f"   Remitente: {EMAIL_CONFIG['from_email']}")
        print(f"\n📮 Destinatarios DANGER: {len(ALERT_RECIPIENTS['DANGER'])}")
        print(f"📮 Destinatarios WARNING: {len(ALERT_RECIPIENTS['WARNING'])}")
    except ValueError as e:
        print(f"\n❌ Error en configuración: {e}")