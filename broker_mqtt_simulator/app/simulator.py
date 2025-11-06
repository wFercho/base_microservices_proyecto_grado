import asyncio
import json
import random
import uuid
from datetime import datetime, timedelta
from collections import defaultdict
import sys
import asyncpg
import paho.mqtt.client as mqtt

# Importar configuraciones
from sensors_config import CERTIFICATIONS, INSTALL_TYPES, MANUFACTURERS, PROTOCOLS, SENSOR_TYPES
from email_service import EmailNotificationService
from config_email import EMAIL_CONFIG, ALERT_RECIPIENTS, ALERT_SETTINGS, validate_config

# Configuración MQTT
BROKER = "broker_mosquitto"
PORT = 1883
TOPIC = "iot/sensor/data"
USERNAME = "Ricardo"
PASSWORD = "1234"
QOS = 1

# Configuración PostgreSQL
DB_CONFIG = {
    "host": "iot_devices_postgres",
    "port": 5432,
    "database": "iot_devices_db",
    "user": "iot_user",
    "password": "iot_password"
}

class SensorState:
    """Mantiene el estado de cada sensor para generar datos realistas"""
    def __init__(self, sensor_type, params):
        self.sensor_type = sensor_type
        self.params = params
        self.current_value = random.uniform(*params["typical_range"])
        self.last_update = datetime.utcnow()
        self.trend = random.choice(["stable", "increasing", "decreasing"])
        self.anomaly_chance = 0.03
        
    def update_value(self):
        """Actualiza el valor del sensor con tendencias realistas"""
        if random.random() < 0.1:
            self.trend = random.choice(["stable", "increasing", "decreasing"])
        
        typical_min, typical_max = self.params["typical_range"]
        change_rate = (typical_max - typical_min) * 0.05
        
        if self.trend == "increasing":
            change = random.uniform(0, change_rate)
        elif self.trend == "decreasing":
            change = random.uniform(-change_rate, 0)
        else:
            change = random.uniform(-change_rate * 0.3, change_rate * 0.3)
        
        noise = random.gauss(0, change_rate * 0.1)
        self.current_value += change + noise
        
        if random.random() < self.anomaly_chance:
            spike = random.uniform(change_rate * 2, change_rate * 5)
            self.current_value += spike if random.random() > 0.5 else -spike
        
        self.current_value = max(self.params["min"], 
                                min(self.params["max"], self.current_value))
        
        self.last_update = datetime.utcnow()
        return round(self.current_value, 2)
    
    def get_status(self):
        """Determina el estado basado en umbrales de seguridad"""
        value = self.current_value
        params = self.params
        
        if self.sensor_type == "O2":
            if value < params.get("danger_threshold", 0):
                return "DANGER"
            elif value < params.get("warning_threshold", 0):
                return "WARNING"
            elif params.get("safe_min", 0) <= value <= params.get("safe_max", 100):
                return "OK"
            else:
                return "WARNING"
        
        if self.sensor_type in ["Humedad", "Iluminación", "pH_Agua"]:
            safe_min = params.get("safe_min", 0)
            safe_max = params.get("safe_max", 100)
            
            if value < safe_min or value > params.get("danger_threshold", safe_max):
                return "DANGER"
            elif value < params.get("warning_threshold_low", safe_min) or value > params.get("warning_threshold_high", safe_max):
                return "WARNING"
            else:
                return "OK"
        
        if value >= params.get("danger_threshold", float('inf')):
            return "DANGER"
        elif value >= params.get("warning_threshold", float('inf')):
            return "WARNING"
        else:
            return "OK"

class UnifiedSensorSimulator:
    def __init__(self):
        self.mqtt_client = None
        self.db_pool = None
        self.sensors_cache = []
        self.sensor_states = {}
        self.email_service = None
        self.alert_cooldowns = defaultdict(lambda: datetime.min)
        self.email_stats = defaultdict(int)
        
    async def init_db(self):
        """Inicializa la conexión a PostgreSQL"""
        try:
            self.db_pool = await asyncpg.create_pool(**DB_CONFIG)
            print("✅ Conexión a PostgreSQL establecida")
            return True
        except Exception as e:
            print(f"❌ Error conectando a PostgreSQL: {e}")
            return False
    
    async def load_sensors(self):
        """Carga sensores desde la base de datos"""
        try:
            query = """
                SELECT 
                    s.id,
                    s.id_node,
                    s.variable,
                    s.marca,
                    s.referencia,
                    s.unidad_medicion,
                    s.max_medicion,
                    s.min_medicion,
                    n.zone_name,
                    n.zone_category,
                    g.mine_zone_id AS associated_mine
                FROM sensores s
                LEFT JOIN nodos_sensores n ON s.id_node = n.id
                LEFT JOIN iot_gateways g ON n.id_iot_gateway = g.id
                WHERE s.variable IS NOT NULL
            """
            
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch(query)
                
            self.sensors_cache = []
            for row in rows:
                sensor_data = {
                    'id': row['id'],
                    'node_id': row['id_node'],
                    'variable': row['variable'],
                    'brand': row['marca'],
                    'reference': row['referencia'],
                    'unit': row['unidad_medicion'],
                    'max_value': float(row['max_medicion']) if row['max_medicion'] else None,
                    'min_value': float(row['min_medicion']) if row['min_medicion'] else None,
                    'zone_name': row['zone_name'],
                    'zone_category': row['zone_category'],
                    'mine': row['associated_mine']
                }
                self.sensors_cache.append(sensor_data)
            
            return len(self.sensors_cache) > 0
            
        except Exception as e:
            print(f"❌ Error cargando sensores: {e}")
            return False

    def init_mqtt(self):
        """Configura cliente MQTT con callbacks"""
        self.mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.mqtt_client.username_pw_set(USERNAME, PASSWORD)
        
        def on_connect(client, userdata, flags, rc, properties=None):
            status = "✅ Conectado" if rc == 0 else f"❌ Error de conexión ({rc})"

        def on_disconnect(client, userdata, rc, properties=None):
            if rc != 0:
                print(f"⚠️ Desconexión inesperada (código {rc}). Reconectando...")
                client.reconnect()

        self.mqtt_client.on_connect = on_connect
        self.mqtt_client.on_disconnect = on_disconnect
        
        try:
            self.mqtt_client.connect(BROKER, PORT, 60)
            self.mqtt_client.loop_start()
            print("✅ Cliente MQTT conectado")
        except Exception as e:
            print(f"❌ Error conectando a MQTT: {e}")
            raise

    def init_email_service(self):
        """Inicializa el servicio de email"""
        try:
            self.email_service = EmailNotificationService(**EMAIL_CONFIG)
            print("✅ Servicio de email inicializado")
        except Exception as e:
            print(f"⚠️ Error inicializando servicio de email: {e}")

    def get_sensor_state(self, node_id, sensor_type):
        """Obtiene o crea el estado de un sensor"""
        key = f"{node_id}_{sensor_type}"
        if key not in self.sensor_states:
            params = SENSOR_TYPES.get(sensor_type, {
                "typical_range": [0, 100],
                "min": 0,
                "max": 100,
                "unit": "units"
            })
            self.sensor_states[key] = SensorState(sensor_type, params)
        return self.sensor_states[key]

    def should_send_alert(self, sensor_key, status):
        """Determina si se debe enviar una alerta según cooldown"""
        if status == "OK":
            return False
        
        now = datetime.now()
        last_alert = self.alert_cooldowns[sensor_key]
        cooldown = timedelta(minutes=ALERT_SETTINGS["cooldown_minutes"])
        
        if now - last_alert > cooldown:
            self.alert_cooldowns[sensor_key] = now
            return True
        return False

    async def send_email_alert(self, data):
        """Envía alerta por email si corresponde"""
        if not self.email_service:
            return

        status = data["status"]
        sensor_type = data["type"]
        sensor_key = f"{data['node_id']}_{sensor_type}"
        
        if not self.should_send_alert(sensor_key, status):
            return
        
        recipients = ALERT_RECIPIENTS.get(status, [])
        if not recipients:
            return
        
        print(f"\n{'🔴' if status == 'DANGER' else '🟡'} Enviando alerta por email...")
        print(f"   Sensor: {sensor_type} | Estado: {status}")
        print(f"   Destinatarios: {len(recipients)}")

        # success = self.email_service.send_alert(recipients, data, status)

        #if success:
        #    self.email_stats["sent"] += 1
         #   self.email_stats[status.lower()] += 1
          #  print(f"   ✅ Email enviado correctamente")
        #else:
         #   self.email_stats["failed"] += 1
          #  print(f"   ❌ Error al enviar email") """

    def generate_sensor_data_from_db(self, sensor):
        """Genera datos para sensores cargados desde BD"""
        variable = sensor['variable']

        # Usar estado del sensor para valores realistas
        state = self.get_sensor_state(sensor['node_id'], variable)
        current_value = state.update_value()
        status = state.get_status()
        
        # Última calibración
        last_calibration = datetime.now() - timedelta(days=random.randint(0, 350))
        next_calibration = last_calibration + timedelta(days=365)
        
        # Convertir UUID a string para serialización JSON
        sensor_id = str(sensor['id']) if sensor['id'] else str(uuid.uuid4())
        mine_id = str(sensor['mine']) if sensor['mine'] else str(uuid.uuid4())
        
        return {
            "id": str(uuid.uuid4()),  
            "sensor_id": sensor_id,  
            "node_id": sensor['node_id'],
            "type": variable,
            "description": f"Sensor de {variable}",
            "value": current_value,
            "unit": sensor['unit'],
            "status": status,
            "manufacturer": sensor['brand'],
            "model": sensor['reference'],
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "battery": round(random.uniform(3.2, 4.2), 2) if random.random() > 0.3 else None,
            "signal_strength": random.randint(-85, -40),
            "installation_type": random.choice(INSTALL_TYPES),
            "communication_protocol": random.choice(PROTOCOLS),
            "certifications": random.sample(CERTIFICATIONS, k=random.randint(2, 4)),
            "firmware_version": f"v{random.randint(1, 3)}.{random.randint(0, 12)}.{random.randint(0, 5)}",
            "metadata": {
                "accuracy": f"±{round(random.uniform(0.5, 3.0), 2)}%",
                "sampling_rate": f"{random.choice([1, 2, 5, 10, 30, 60])}s",
                "response_time": f"{random.choice([1, 2, 5, 10])}s",
                "last_calibration": last_calibration.strftime("%Y-%m-%d"),
                "next_calibration": next_calibration.strftime("%Y-%m-%d"),
                "calibration_status": "Valid" if (next_calibration > datetime.now()) else "Expired",
                "ip_rating": random.choice(["IP65", "IP67", "IP68"]),
                "compliance": ["ISO 45001", "ISO 14001", "DS 024-2016-EM"]
            },
            "location": {
                "zone": sensor['zone_name'],
                "sector": sensor['zone_category'],
                "mine": mine_id,
                "coordinates": {
                    "x": round(random.uniform(-1000, 1000), 2),
                    "y": round(random.uniform(-1000, 1000), 2),
                    "z": round(random.uniform(-500, 0), 2)
                }
            }
        }

    def generate_simulated_sensor_data(self, node_id):
        """Genera datos para sensores simulados (fallback)"""
        sensor_type = random.choice(list(SENSOR_TYPES.keys()))
        params = SENSOR_TYPES[sensor_type]
        
        state = self.get_sensor_state(node_id, sensor_type)
        current_value = state.update_value()
        status = state.get_status()
        
        manufacturer = random.choice(list(MANUFACTURERS.keys()))
        model = random.choice(MANUFACTURERS[manufacturer])
        
        last_calibration = datetime.now() - timedelta(days=random.randint(0, 350))
        next_calibration = last_calibration + timedelta(days=365)
        
        return {
            "id": str(uuid.uuid4()),
            "node_id": node_id,
            "type": sensor_type,
            "description": f"Sensor de {sensor_type}",
            "value": current_value,
            "unit": params["unit"],
            "status": status,
            "manufacturer": manufacturer,
            "model": model,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "battery": round(random.uniform(3.2, 4.2), 2) if random.random() > 0.3 else None,
            "signal_strength": random.randint(-85, -40),
            "installation_type": random.choice(INSTALL_TYPES),
            "communication_protocol": random.choice(PROTOCOLS),
            "certifications": random.sample(CERTIFICATIONS, k=random.randint(2, 4)),
            "firmware_version": f"v{random.randint(1, 3)}.{random.randint(0, 12)}.{random.randint(0, 5)}",
            "safety_thresholds": {
                "safe_max": params.get("safe_max"),
                "safe_min": params.get("safe_min"),
                "warning": params.get("warning_threshold"),
                "danger": params.get("danger_threshold")
            },
            "metadata": {
                "accuracy": f"±{round(random.uniform(0.5, 3.0), 2)}%",
                "sampling_rate": f"{random.choice([1, 2, 5, 10, 30, 60])}s",
                "response_time": f"{random.choice([1, 2, 5, 10])}s",
                "last_calibration": last_calibration.strftime("%Y-%m-%d"),
                "next_calibration": next_calibration.strftime("%Y-%m-%d"),
                "calibration_status": "Valid" if (next_calibration > datetime.now()) else "Expired",
                "operating_temp": f"-10 to 50 °C",
                "ip_rating": random.choice(["IP65", "IP67", "IP68"]),
                "compliance": ["ISO 45001", "ISO 14001", "DS 024-2016-EM"]
            },
            "location": {
                "zone": random.choice(["Mina Principal Subterránea", "Zona de Túneles Norte", "Área de Procesamiento"]),
                "sector": random.choice(["Producción", "Ventilación", "Transporte", "Mantenimiento"]),
                "coordinates": {
                    "x": round(random.uniform(-1000, 1000), 2),
                    "y": round(random.uniform(-1000, 1000), 2),
                    "z": round(random.uniform(-500, 0), 2)
                }
            }
        }

    async def publish_data(self, data):
        """Publica datos MQTT y maneja alertas"""
        try:

            result = self.mqtt_client.publish(
                TOPIC, 
                json.dumps(data, ensure_ascii=False, indent=2), 
                qos=QOS
            )
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                # Publicar también en topic específico del sensor
                sensor_topic = f"sensors/{data['node_id']}/{data['type']}"
                self.mqtt_client.publish(sensor_topic, json.dumps(data))
                
                # Manejar alertas por email
                if data["status"] in ["DANGER", "WARNING"]:
                    await self.send_email_alert(data)
                    
                return True
            else:
                print(f"\nError al publicar (código {result.rc})")
                return False
                
        except Exception as e:
            print(f"\nError crítico en publicación: {e}")
            return False

    async def simulate_real_sensors(self):
        """Simula sensores reales cargados desde BD"""
        if not self.sensors_cache:
            return False
        
        message_count = 0
        danger_count = 0
        warning_count = 0
        
        while True:
            for sensor in self.sensors_cache:
                data = self.generate_sensor_data_from_db(sensor)
                message_count += 1
                
                if data["status"] == "DANGER":
                    danger_count += 1
                elif data["status"] == "WARNING":
                    warning_count += 1
                
                await self.publish_data(data)
                
                # Pequeña pausa entre sensores
                await asyncio.sleep(0.1)
            
            # Mostrar estadísticas cada 10 ciclos
            if message_count % (len(self.sensors_cache) * 10) == 0:
                print(f"\n📊 Estadísticas: {message_count} mensajes | "
                      f"Peligro: {danger_count} | Advertencia: {warning_count} | "
                      f"Emails: {self.email_stats['sent']} enviados")
            
            await asyncio.sleep(5)  # Ciclo principal cada 5 segundos

    async def simulate_fallback_sensors(self):
        """Modo simulación cuando no hay BD disponible"""
        nodes = [f"node_{i:03d}" for i in range(1, 21)]  # 20 nodos simulados
        
        print(f"🔄 Usando modo simulación con {len(nodes)} nodos...")
        
        message_count = 0
        
        while True:
            for node_id in nodes:
                data = self.generate_simulated_sensor_data(node_id)
                message_count += 1
                
                await self.publish_data(data)
                
            await asyncio.sleep(random.uniform(2, 4))

    async def start(self):
        """Inicia el simulador unificado"""
        
        # Inicializar componentes
        db_connected = await self.init_db()
        
        if db_connected:
            sensors_loaded = await self.load_sensors()
        else:
            sensors_loaded = False
            
        self.init_mqtt()
        self.init_email_service()
        
        # Elegir modo de operación
        if sensors_loaded:
            await self.simulate_real_sensors()
        else:
            print("⚠️ No se cargaron sensores desde BD. Iniciando modo simulación.")

# Función principal para usar en main.py
async def simulate_data():
    """Función de entrada para iniciar la simulación unificada"""
    simulator = UnifiedSensorSimulator()
    await simulator.start()

if __name__ == "__main__":
    asyncio.run(simulate_data())