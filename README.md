# IoT Platform

Este proyecto implementa una plataforma IoT completa con un gateway para gestionar la comunicación entre sensores y clientes, un servicio de sensores para persistencia de datos, y la infraestructura necesaria para su funcionamiento.

## Arquitectura

El sistema consta de los siguientes componentes:

- **IoT Gateway**: Recibe datos de sensores IoT vía MQTT y los transmite en tiempo real a clientes conectados mediante WebSockets.
- **Servicio de Sensores**: Almacena y gestiona la información de sensores en una base de datos PostgreSQL.
- **Broker MQTT (Mosquitto)**: Maneja la comunicación asíncrona entre sensores y gateway.
- **Base de Datos PostgreSQL**: Almacena los datos persistentes de los sensores.

## Requisitos

- Docker
- Docker Compose
- Git

## Configuración

1. Clone el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd iot-platform
   ```

2. Cree un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   DATABASE_URL=postgresql://postgres:password@postgres_sensor_db:5432/sensor_db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password
   POSTGRES_DB=sensor_db
   ```

3. Configure el archivo `mosquitto.conf` en el directorio `iot-gateway/mosquitto/config/`:
   ```
   listener 1883
   allow_anonymous true
   persistence true
   persistence_location /mosquitto/data/
   log_dest file /mosquitto/log/mosquitto.log
   password_file /mosquitto/config/mosquitto.passwd
   ```

4. Cree el archivo de contraseñas para Mosquitto:
   ```bash
   docker run --rm -it eclipse-mosquitto mosquitto_passwd -c /tmp/mosquitto.passwd Ricardo
   # Introduzca la contraseña cuando se le solicite (en este caso, "1234")
   docker cp <container-id>:/tmp/mosquitto.passwd ./iot-gateway/mosquitto/config/
   ```

## Ejecución

1. Inicie todos los servicios con Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Verifique que todos los contenedores estén funcionando:
   ```bash
   docker-compose ps
   ```

3. Para ver los logs en tiempo real:
   ```bash
   docker-compose logs -f
   ```

## Estructura del Proyecto

```
iot-platform/
├── docker-compose.yml
├── .env
├── iot-gateway/
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py
│   │   ├── mqtt_client.py
│   │   ├── simulator.py
│   │   └── requirements.txt
│   └── mosquitto/
│       └── config/
│           ├── mosquitto.conf
│           └── mosquitto.passwd
├── sensor_service/
│   ├── Dockerfile
│   └── app/
│       ├── main.py
│       └── requirements.txt
└── README.md
```

## API y Endpoints

### IoT Gateway (puerto 8000)

- **GET /** - Página principal de verificación
- **WebSocket /ws** - Conexión WebSocket para recibir datos en tiempo real

### Servicio de Sensores (puerto 8001)

- **GET /sensors** - Obtener todos los sensores
- **POST /sensors** - Crear un nuevo sensor
- **GET /sensors/{sensor_id}** - Obtener un sensor específico
- **PUT /sensors/{sensor_id}** - Actualizar un sensor existente
- **DELETE /sensors/{sensor_id}** - Eliminar un sensor

## Flujo de Datos

1. El **simulador de datos** dentro del IoT Gateway genera datos simulados de sensores.
2. Estos datos se publican en el **broker MQTT** (Mosquitto) en el tema `iot/sensor/data`.
3. El **cliente MQTT** en el IoT Gateway está suscrito a este tema y recibe los mensajes.
4. El IoT Gateway procesa estos mensajes y los envía a todos los **clientes WebSocket** conectados.
5. Paralelamente, los datos son almacenados en la **base de datos PostgreSQL** a través del servicio de sensores.

## Solución de Problemas

### Problema: Los mensajes MQTT aparecen en lotes y no en tiempo real

**Solución**: Desactivar el buffering de Python en el contenedor Docker:
1. Modifique el Dockerfile del IoT Gateway:
   ```
   ENV PYTHONUNBUFFERED=1
   ```
2. O ejecute los comandos Python con la bandera `-u`:
   ```
   CMD ["python", "-u", "main.py"]
   ```

### Problema: Error "no running event loop"

**Solución**: Este error ocurre cuando se intenta acceder al bucle de eventos de asyncio desde un hilo separado. La solución implementada:
1. Mantener una referencia global al bucle de eventos principal
2. Utilizar esta referencia para programar tareas asíncronas desde callbacks de MQTT

### Problema: Errores en los callbacks de MQTT

**Solución**: Asegúrese de usar la versión correcta de la API de callbacks de MQTT:
1. Para VERSION2 de la API, los callbacks deben tener la firma correcta, por ejemplo:
   ```python
   def on_publish(client, userdata, mid, reason_code=0, properties=None)
   ```

## Desarrollo Futuro

- Implementar autenticación para WebSockets
- Añadir panel de administración
- Implementar procesamiento de datos en tiempo real
- Añadir soporte para más tipos de sensores
- Implementar alertas y notificaciones

## Licencia

[Especifique su licencia aquí]