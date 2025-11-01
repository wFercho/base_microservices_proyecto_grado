import asyncio
import json
import random
from datetime import datetime
import asyncpg
import paho.mqtt.client as mqtt
from sensors_config import SENSOR_TYPES

# Configuración MQTT
BROKER = "broker_mosquitto"
PORT = 1883
USERNAME = "Ricardo"
PASSWORD = "1234"

# Configuración PostgreSQL (ajusta según tu entorno)
DB_CONFIG = {
    "host": "iot_devices_postgres",
    "port": 5432,
    "database": "iot_devices_db",
    "user": "iot_user",
    "password": "iot_password"
}

class SensorSimulator:
    def __init__(self):
        self.mqtt_client = None
        self.db_pool = None
        self.sensors_cache = []
        
    async def init_db(self):
        """Inicializa la conexión a PostgreSQL"""
        try:
            self.db_pool = await asyncpg.create_pool(**DB_CONFIG)
            print("✅ Conexión a PostgreSQL establecida")
        except Exception as e:
            print(f"❌ Error conectando a PostgreSQL: {e}")
            raise
    
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
                    g.associated_mine
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
            
            print(f"✅ {len(self.sensors_cache)} sensores cargados desde BD")
            return len(self.sensors_cache) > 0
            
        except Exception as e:
            print(f"❌ Error cargando sensores: {e}")
            return False
    
    def init_mqtt(self):
        """Inicializa cliente MQTT"""
        self.mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.mqtt_client.username_pw_set(USERNAME, PASSWORD)
        
        try:
            self.mqtt_client.connect(BROKER, PORT, 60)
            self.mqtt_client.loop_start()
            print("✅ Cliente MQTT conectado")
        except Exception as e:
            print(f"❌ Error conectando a MQTT: {e}")
            raise
    
    def generate_sensor_value(self, sensor):
        """Genera un valor simulado basado en el tipo de sensor"""
        variable = sensor['variable']
        
        # Buscar configuración del sensor en sensors_config.py
        sensor_config = SENSOR_TYPES.get(variable)
        
        if sensor_config:
            # Usar rangos típicos con variación gaussiana
            typical_min, typical_max = sensor_config['typical_range']
            mean = (typical_min + typical_max) / 2
            std_dev = (typical_max - typical_min) / 6
            
            value = random.gauss(mean, std_dev)
            
            # Limitar al rango válido del sensor
            value = max(sensor_config['min'], min(sensor_config['max'], value))
        else:
            # Si no hay configuración, usar rangos de BD
            if sensor['min_value'] is not None and sensor['max_value'] is not None:
                value = random.uniform(sensor['min_value'], sensor['max_value'])
            else:
                value = random.uniform(0, 100)
        
        return round(value, 2)
    
    def determine_status(self, value, variable):
        """Determina el estado basado en umbrales de seguridad"""
        sensor_config = SENSOR_TYPES.get(variable)
        
        if not sensor_config:
            return "normal"
        
        # Para O2 (oxígeno) la lógica es inversa
        if variable == "O2":
            if value < sensor_config.get('danger_threshold', 18):
                return "danger"
            elif value < sensor_config.get('warning_threshold', 19):
                return "warning"
            elif value > sensor_config.get('safe_max', 23.5):
                return "warning"
            else:
                return "normal"
        
        # Para otros sensores
        if value > sensor_config.get('danger_threshold', float('inf')):
            return "danger"
        elif value > sensor_config.get('warning_threshold', float('inf')):
            return "warning"
        elif value > sensor_config.get('safe_max', float('inf')):
            return "warning"
        else:
            return "normal"
    
    async def publish_sensor_data(self, sensor):
        """Publica datos de un sensor en topics específicos"""
        value = self.generate_sensor_value(sensor)
        status = self.determine_status(value, sensor['variable'])
        
        payload = {
            "sensor_id": sensor['id'],
            "node_id": sensor['node_id'],
            "variable": sensor['variable'],
            "value": value,
            "unit": sensor['unit'],
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "brand": sensor['brand'],
                "reference": sensor['reference'],
                "zone_name": sensor['zone_name'],
                "zone_category": sensor['zone_category'],
                "mine": sensor['mine']
            }
        }
        
        payload_json = json.dumps(payload)
        
        # Publicar en topic general
        self.mqtt_client.publish("iot/sensor/data", payload_json)
        
        # Publicar en topic específico del sensor
        self.mqtt_client.publish(f"sensors/{sensor['id']}", payload_json)
    
    async def simulate(self):
        """Bucle principal de simulación"""
        if not self.sensors_cache:
            print("⚠️ No hay sensores para simular")
            return
        
        print(f"🔄 Iniciando simulación con {len(self.sensors_cache)} sensores...")
        
        while True:
            try:
                # Publicar datos de todos los sensores
                for sensor in self.sensors_cache:
                    await self.publish_sensor_data(sensor)
                
                # Esperar antes del próximo ciclo (5 segundos)
                await asyncio.sleep(5)
                
            except Exception as e:
                print(f"❌ Error en simulación: {e}")
                await asyncio.sleep(5)
    
    async def start(self):
        """Inicia el simulador completo"""
        try:
            await self.init_db()
            await self.load_sensors()
            self.init_mqtt()
            await self.simulate()
        except Exception as e:
            print(f"❌ Error fatal en simulador: {e}")
        finally:
            if self.db_pool:
                await self.db_pool.close()
            if self.mqtt_client:
                self.mqtt_client.loop_stop()
                self.mqtt_client.disconnect()

# Función para usar en main.py
async def simulate_data():
    """Función de entrada para iniciar la simulación"""
    simulator = SensorSimulator()
    await simulator.start()