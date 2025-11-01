import paho.mqtt.client as mqtt
import asyncio
import json
from threading import Thread
from typing import Set, Dict
from fastapi import WebSocket

BROKER = "broker_mosquitto"
PORT = 1883
USERNAME = "Ricardo"
PASSWORD = "1234"

# Estructura para gestionar clientes WebSocket con sus suscripciones
websocket_subscriptions: Dict[WebSocket, Set[int]] = {}
message_queue = asyncio.Queue()
main_loop = None

mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqtt_client.username_pw_set(USERNAME, PASSWORD)

def on_connect(client, userdata, flags, rc, properties=None):
    """Callback cuando se conecta al broker MQTT"""
    print(f"✅ Conectado al broker MQTT con código: {rc}")
    
    # Suscribirse a topics
    client.subscribe("iot/sensor/data")  # Topic general
    client.subscribe("sensors/+")         # Todos los sensores específicos
    
    print("✅ Suscrito a topics MQTT")

def on_message(client, userdata, message):
    """Callback cuando llega un mensaje MQTT"""
    try:
        data = message.payload.decode()
        topic = message.topic
        
        # Parsear el payload
        payload = json.loads(data)
        
        # Agregar información del topic
        payload['mqtt_topic'] = topic
        
        # Enviar a la cola para procesamiento asíncrono
        if main_loop is not None:
            main_loop.call_soon_threadsafe(
                lambda: asyncio.ensure_future(
                    message_queue.put((topic, payload)), 
                    loop=main_loop
                )
            )
    except Exception as e:
        print(f"❌ Error procesando mensaje MQTT: {e}")

async def process_messages():
    """Procesa mensajes desde MQTT y los envía a WebSockets suscritos"""
    while True:
        try:
            topic, payload = await message_queue.get()
            
            # Obtener sensor_id del payload
            sensor_id = payload.get('sensor_id')
            
            disconnected_clients = set()
            
            for ws, subscribed_sensors in list(websocket_subscriptions.items()):
                try:
                    # Si el cliente está suscrito a "all" o al sensor específico
                    if "all" in subscribed_sensors or sensor_id in subscribed_sensors:
                        await ws.send_json(payload)
                except Exception as e:
                    print(f"❌ Error enviando a WebSocket: {e}")
                    disconnected_clients.add(ws)
            
            # Limpiar clientes desconectados
            for ws in disconnected_clients:
                websocket_subscriptions.pop(ws, None)
                
        except Exception as e:
            print(f"❌ Error procesando cola de mensajes: {e}")
            await asyncio.sleep(1)

async def start_mqtt():
    """Inicia el cliente MQTT en un hilo separado"""
    global main_loop
    main_loop = asyncio.get_running_loop()
    
    mqtt_client.on_message = on_message
    mqtt_client.on_connect = on_connect
    
    def start_mqtt_loop():
        try:
            mqtt_client.connect(BROKER, PORT, 60)
            mqtt_client.loop_forever()
        except Exception as e:
            print(f"❌ Error en bucle MQTT: {e}")
    
    mqtt_thread = Thread(target=start_mqtt_loop)
    mqtt_thread.daemon = True
    mqtt_thread.start()
    
    print("🔌 Cliente MQTT iniciado en hilo separado")

async def register_websocket(ws: WebSocket):
    """
    Registra un WebSocket y maneja sus suscripciones
    
    Mensajes JSON que puede enviar el cliente:
    - {"action": "subscribe", "sensors": [1, 2, 3]}
    - {"action": "subscribe", "sensors": ["all"]}
    - {"action": "unsubscribe", "sensors": [1, 2]}
    """
    await ws.accept()
    
    # Por defecto, suscribir a todos los sensores
    websocket_subscriptions[ws] = {"all"}
    
    print(f"✅ WebSocket conectado (ID: {id(ws)})")
    
    try:
        # Enviar mensaje de bienvenida
        await ws.send_json({
            "type": "connection",
            "status": "connected",
            "message": "Conectado al servidor IoT",
            "subscriptions": list(websocket_subscriptions[ws])
        })
        
        while True:
            # Recibir mensajes del cliente
            message = await ws.receive_text()
            
            try:
                data = json.loads(message)
                action = data.get('action')
                sensors = data.get('sensors', [])
                
                if action == 'subscribe':
                    # Convertir "all" a string, números a int
                    sensor_set = set()
                    for s in sensors:
                        if s == "all":
                            sensor_set.add("all")
                        else:
                            sensor_set.add(int(s))
                    
                    # Si se suscribe a "all", limpiar suscripciones específicas
                    if "all" in sensor_set:
                        websocket_subscriptions[ws] = {"all"}
                    else:
                        # Eliminar "all" si existe y agregar sensores específicos
                        websocket_subscriptions[ws].discard("all")
                        websocket_subscriptions[ws].update(sensor_set)
                    
                    await ws.send_json({
                        "type": "subscription",
                        "status": "success",
                        "subscriptions": list(websocket_subscriptions[ws])
                    })
                    
                    print(f"📡 WebSocket {id(ws)} suscrito a: {websocket_subscriptions[ws]}")
                
                elif action == 'unsubscribe':
                    # Desuscribirse de sensores específicos
                    for s in sensors:
                        if s == "all":
                            websocket_subscriptions[ws].discard("all")
                        else:
                            websocket_subscriptions[ws].discard(int(s))
                    
                    # Si no queda ninguna suscripción, suscribir a "all"
                    if not websocket_subscriptions[ws]:
                        websocket_subscriptions[ws].add("all")
                    
                    await ws.send_json({
                        "type": "subscription",
                        "status": "success",
                        "subscriptions": list(websocket_subscriptions[ws])
                    })
                    
                    print(f"📡 WebSocket {id(ws)} actualizado: {websocket_subscriptions[ws]}")
                
                elif action == 'ping':
                    await ws.send_json({"type": "pong"})
                
                else:
                    await ws.send_json({
                        "type": "error",
                        "message": f"Acción desconocida: {action}"
                    })
                    
            except json.JSONDecodeError:
                await ws.send_json({
                    "type": "error",
                    "message": "Formato JSON inválido"
                })
            except Exception as e:
                print(f"❌ Error procesando mensaje WebSocket: {e}")
                
    except Exception:
        pass
    finally:
        websocket_subscriptions.pop(ws, None)
        print(f"🔌 WebSocket {id(ws)} eliminado")