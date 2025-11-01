-- Script para crear las tablas de la base de datos IoT
-- Ejecutar ANTES de los INSERT statements

-- 1. Crear tabla mine_zones (debe ser primero porque es referenciada)
CREATE TABLE IF NOT EXISTS mine_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    location VARCHAR(200),
    zone_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    mine_type VARCHAR(50),
    coordinates VARCHAR(100),
    depth VARCHAR(50),
    area VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- 2. Crear tabla iot_gateways (depende de mine_zones)
CREATE TABLE IF NOT EXISTS iot_gateways (
    id SERIAL PRIMARY KEY,
    mine_zone_id UUID REFERENCES mine_zones(id) ON DELETE SET NULL,
    brand VARCHAR(100) NOT NULL,
    description TEXT,
    associated_mine VARCHAR(100)
);

-- 3. Crear tabla nodos_sensores (depende de iot_gateways)
CREATE TABLE IF NOT EXISTS nodos_sensores (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    description TEXT,
    zone_name VARCHAR(100),
    zone_category VARCHAR(50),
    id_iot_gateway INTEGER REFERENCES iot_gateways(id)
);

-- 4. Crear tabla sensores (depende de nodos_sensores)
CREATE TABLE IF NOT EXISTS sensores (
    id SERIAL PRIMARY KEY,
    id_node VARCHAR(50) REFERENCES nodos_sensores(id),
    variable VARCHAR(50),
    marca VARCHAR(100),
    referencia VARCHAR(50),
    unidad_medicion VARCHAR(20),
    max_medicion DECIMAL(10,2),
    min_medicion DECIMAL(10,2),
    precision DECIMAL(10,2),
    tiempo_respuesta_valor INTEGER,
    tiempo_respuesta_unidad VARCHAR(10),
    resolucion DECIMAL(10,3),
    temperatura_max DECIMAL(6,1),
    temperatura_min DECIMAL(6,1),
    voltaje_tipo VARCHAR(10),
    voltaje_min DECIMAL(4,1),
    voltaje_max DECIMAL(4,1),
    corriente_min DECIMAL(4,2),
    corriente_max DECIMAL(4,2),
    durabilidad_valor INTEGER,
    durabilidad_unidad VARCHAR(10),
    modo_instalacion VARCHAR(50),
    tipo_salida TEXT,
    certificados TEXT
);

-- 5. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_nodos_sensores_gateway ON nodos_sensores(id_iot_gateway);
CREATE INDEX IF NOT EXISTS idx_sensores_node ON sensores(id_node);
CREATE INDEX IF NOT EXISTS idx_sensores_variable ON sensores(variable);
CREATE INDEX IF NOT EXISTS idx_nodos_zone_category ON nodos_sensores(zone_category);

-- Verificar que las tablas se crearon correctamente
\dt
INSERT INTO mine_zones (name, description, location, zone_type, mine_type, coordinates, depth, area) VALUES 
('Mina Principal Subterránea', 'Mina subterránea principal de extracción de cobre', 'Cordillera de los Andes', 'mine', 'underground', '-33.4489, -70.6693', '450m', '120 hectáreas'),
('Zona de Túneles Norte', 'Red de túneles de acceso norte', 'Nivel -150', 'zone', NULL, '-33.4490, -70.6694', '150m', '5 hectáreas'),
('Área de Procesamiento', 'Zona de procesamiento primario', 'Planta de tratamiento', 'area', NULL, '-33.4488, -70.6692', 'N/A', '2 hectáreas'),
('Sector de Extracción A', 'Sector principal de extracción mineral', 'Nivel -200', 'sector', NULL, '-33.4491, -70.6695', '200m', '8 hectáreas')
ON CONFLICT (name) DO NOTHING;

-- 3. Insertar los IoT Gateways
INSERT INTO iot_gateways (brand, description, associated_mine) VALUES 
('GatewayTech', 'Gateway principal para zona de túneles', (SELECT id FROM mine_zones WHERE name = 'Zona de Túneles Norte')),
('EdgeGateway', 'Gateway para zonas de extracción', (SELECT id FROM mine_zones WHERE name = 'Sector de Extracción A')),
('MineConnect', 'Gateway para bocaminas y áreas externas', (SELECT id FROM mine_zones WHERE name = 'Mina Principal Subterránea')),
('GatewayTech', 'Gateway secundario para túneles profundos', (SELECT id FROM mine_zones WHERE name = 'Zona de Túneles Norte')),
('EdgeGateway', 'Gateway de respaldo para zonas críticas', (SELECT id FROM mine_zones WHERE name = 'Sector de Extracción A'));
-- 3. Insertar nodos sensores ya asociados a los gateways
-- Primero necesitamos conocer los IDs de los gateways recién creados
-- Asumamos que se crearon en el mismo orden que los insertamos:
-- Gateway 1: GatewayTech (principal túneles)
-- Gateway 2: EdgeGateway (zonas extracción)
-- Gateway 3: MineConnect (bocaminas)
-- Gateway 4: GatewayTech (secundario túneles)
-- Gateway 5: EdgeGateway (respaldo)

-- Insertamos los nodos sensores con sus gateways correspondientes
INSERT INTO nodos_sensores(id, brand, description, zone_name, zone_category, id_iot_gateway) VALUES 
('node_1', 'NodeTech', 'Nodo de sensores para monitoreo industrial', 'Zona 1', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 0)),
('node_2', 'SensorNet', 'Nodo de sensores para monitoreo industrial', 'Zona 2', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_3', 'GatewayPro', 'Nodo de sensores para monitoreo industrial', 'Zona 3', 'bocamina', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 2)),
('node_4', 'SensorNet', 'Nodo con conectividad avanzada', 'Zona 4', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 0)),
('node_5', 'NodeTech', 'Nodo de sensores para monitoreo industrial', 'Zona 5', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 0)),
('node_6', 'EdgeSensor', 'Nodo de sensores para monitoreo industrial', 'Zona 6', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_7', 'GatewayPro', 'Módulo de recolección de datos de sensores', 'Zona 7', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 0)),
('node_8', 'SensorNet', 'Módulo de recolección de datos de sensores', 'Zona 8', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 0)),
('node_9', 'NodeTech', 'Dispositivo IoT para integración de sensores', 'Zona 9', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_10', 'SensorNet', 'Dispositivo IoT para integración de sensores', 'Zona 10', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 0)),
('node_11', 'EdgeSensor', 'Nodo de sensores para monitoreo industrial', 'Zona 11', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 0)),
('node_12', 'GatewayPro', 'Unidad central para gestión de sensores', 'Zona 12', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 0)),
('node_13', 'GatewayPro', 'Nodo de sensores para monitoreo industrial', 'Zona 13', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 0)),
('node_14', 'IoTNodeX', 'Dispositivo IoT para integración de sensores', 'Zona 14', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_15', 'EdgeSensor', 'Nodo con conectividad avanzada', 'Zona 15', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_16', 'SensorNet', 'Unidad central para gestión de sensores', 'Zona 16', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_17', 'SensorNet', 'Dispositivo IoT para integración de sensores', 'Zona 17', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 0)),
('node_18', 'GatewayPro', 'Dispositivo IoT para integración de sensores', 'Zona 18', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 3)),
('node_19', 'NodeTech', 'Unidad central para gestión de sensores', 'Zona 19', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_20', 'NodeTech', 'Unidad central para gestión de sensores', 'Zona 20', 'bocamina', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 2)),
('node_21', 'NodeTech', 'Nodo de sensores para monitoreo industrial', 'Zona 21', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_22', 'GatewayPro', 'Dispositivo IoT para integración de sensores', 'Zona 22', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_23', 'NodeTech', 'Módulo de recolección de datos de sensores', 'Zona 23', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 3)),
('node_24', 'EdgeSensor', 'Nodo con conectividad avanzada', 'Zona 24', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 3)),
('node_25', 'GatewayPro', 'Dispositivo IoT para integración de sensores', 'Zona 25', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 3)),
('node_26', 'GatewayPro', 'Dispositivo IoT para integración de sensores', 'Zona 26', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 3)),
('node_27', 'EdgeSensor', 'Nodo con conectividad avanzada', 'Zona 27', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_28', 'NodeTech', 'Nodo de sensores para monitoreo industrial', 'Zona 28', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_29', 'GatewayPro', 'Unidad central para gestión de sensores', 'Zona 29', 'extraction', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 1)),
('node_30', 'EdgeSensor', 'Módulo de recolección de datos de sensores', 'Zona 30', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 4)),
('node_31', 'GatewayPro', 'Nodo con conectividad avanzada', 'Zona 31', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 4)),
('node_32', 'GatewayPro', 'Módulo de recolección de datos de sensores', 'Zona 32', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 4)),
('node_33', 'EdgeSensor', 'Unidad central para gestión de sensores', 'Zona 33', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 4)),
('node_34', 'NodeTech', 'Nodo de sensores para monitoreo industrial', 'Zona 34', 'tunel', (SELECT id FROM iot_gateways LIMIT 1 OFFSET 4));

INSERT INTO "sensores" ("id_node","variable","marca","referencia","unidad_medicion","max_medicion","min_medicion","precision","tiempo_respuesta_valor","tiempo_respuesta_unidad","resolucion","temperatura_max","temperatura_min","voltaje_tipo","voltaje_min","voltaje_max","corriente_min","corriente_max","durabilidad_valor","durabilidad_unidad","modo_instalacion","tipo_salida","certificados")
VALUES
('node_1','PM10','AirQuality','P3000','µg/m³',405.09,3.23,1.12,9,'s',0.201,56.8,-36.2,'DC',4.4,9.9,0.91,3.87,1,'años','Superficie','Digital, Analógica','UL'),
('node_2','Temperatura','HumidTech','P3000','°C',171.39,2.86,1.5,5,'s',0.954,56.6,-37.5,'DC',4.3,8.5,0.53,1.83,10,'años','Empotrado','Modbus','ISO 14001'),
('node_3','Humedad','AirQuality','L5000','%',139.3,1.06,2.16,7,'s',0.152,-37.5,-38.4,'DC',4.5,7.7,0.65,1.99,3,'años','Empotrado','Analógica, Modbus, Digital','ISO 14001, FCC'),
('node_4','PM2.5','AirQuality','N6000','µg/m³',178.51,1.22,2.23,7,'s',0.87,82.6,-29.3,'DC',4.8,10,0.15,4.24,1,'años','Empotrado','RS485, Digital, Analógica','ISO 14001, CE'),
('node_5','Temperatura','HumidTech','P3000','°C',287.16,1.95,0.37,6,'s',0.495,-0.1,-39.4,'DC',4.3,5.4,0.1,2.46,5,'años','Superficie','Modbus, Digital','ISO 9001'),
('node_6','Luminosidad','NoiseGuard','P3000','lux',467.95,6.33,2.43,3,'s',0.981,38.6,-31.5,'DC',4.9,7.7,0.78,6.65,4,'años','Superficie','RS485, Analógica, Modbus','UL'),
('node_7','Humedad','NoiseGuard','L5000','%',863.57,8.77,3.67,7,'s',0.387,43.5,-2.4,'DC',4.3,8,0.63,4.82,1,'años','Empotrado','Modbus, Analógica','CE, UL'),
('node_8','Ruido','LightMeter','L5000','dB',833.96,1.62,3.7,7,'s',0.197,-33.5,-31.9,'DC',5,8.4,0.88,2.54,6,'años','Colgante','Analógica','CE, ISO 9001'),
('node_9','CO2','LightMeter','C4000','ppm',131.56,8.85,0.38,2,'s',0.402,-17.6,-11.1,'DC',4.8,5.4,0.69,3.77,5,'años','Superficie','Digital, Modbus, Analógica','FCC'),
('node_10','Presión','TempCorp','T1000','Pa',953.98,1.3,0.42,5,'s',0.343,3.1,-3.6,'DC',4.9,7.9,0.84,7.7,1,'años','Colgante','Analógica','ISO 9001'),
('node_11','PM2.5','PressSense','C4000','µg/m³',761.84,5.26,3.29,3,'s',0.056,13.5,-22.4,'DC',3.2,6.8,0.88,2.82,9,'años','Superficie','Digital, RS485, Modbus','FCC, ISO 14001'),
('node_12','Ruido','PressSense','L5000','dB',828.44,1.37,2.64,2,'s',0.454,7.1,-12.2,'DC',4.8,10.1,0.23,6.93,8,'años','Empotrado','RS485, Analógica, Modbus','CE, FCC'),
('node_13','PM2.5','HumidTech','C4000','µg/m³',374.48,8.14,4.6,2,'s',0.096,-33.5,-23,'DC',4,7.9,0.71,6.89,2,'años','Superficie','Digital, Modbus, RS485','ISO 9001'),
('node_14','Temperatura','AirQuality','C4000','°C',387.17,0.75,1.09,10,'s',0.544,72.9,-15.4,'DC',4.8,8.5,0.18,7.92,6,'años','Superficie','Digital, RS485','CE, FCC'),
('node_15','Humedad','HumidTech','T1000','%',776.04,8.3,1.34,8,'s',0.758,9.7,-40.9,'DC',3.1,9.3,0.38,6.1,4,'años','Empotrado','Digital','CE, ISO 14001'),
('node_16','PM10','NoiseGuard','N6000','µg/m³',588.12,9.28,4,2,'s',0.273,44.4,-29.7,'DC',4.3,7.3,0.49,2.2,6,'años','Empotrado','Digital, Analógica','FCC'),
('node_17','Presión','LightMeter','P3000','Pa',553.33,6.99,4.57,4,'s',0.133,84.8,-16.3,'DC',3.2,7.5,0.18,9.29,7,'años','Superficie','Modbus','UL, ISO 9001'),
('node_18','Temperatura','PressSense','P3000','°C',737.69,6.2,0.39,4,'s',0.674,20.5,-7.7,'DC',3.7,10.5,0.91,7.95,2,'años','Empotrado','RS485, Modbus','CE, ISO 9001'),
('node_19','Luminosidad','HumidTech','N6000','lux',446.88,4.99,4.78,10,'s',0.506,81.3,-16.8,'DC',3,9.9,0.44,5.08,5,'años','Superficie','Analógica, RS485, Modbus','FCC, ISO 9001'),
('node_20','CO2','PressSense','T1000','ppm',436.96,6.14,3.68,1,'s',0.084,77.6,-27.2,'DC',4.8,6.3,0.64,9.36,3,'años','Empotrado','Analógica, RS485','FCC'),
('node_21','PM10','AirQuality','T1000','µg/m³',43.78,3.51,4.92,10,'s',0.369,44.1,-20.7,'DC',4.3,9.6,0.53,1.31,1,'años','Superficie','Analógica, Digital','UL, FCC'),
('node_22','Presión','LightMeter','N6000','Pa',578.64,5.26,2.38,7,'s',0.815,1.6,-15.3,'DC',4.6,9.2,0.12,4.38,6,'años','Empotrado','Analógica, Digital, Modbus','UL, CE'),
('node_23','Humedad','LightMeter','N6000','%',382.81,9.27,4.73,1,'s',0.14,4.3,-27.7,'DC',3.2,10.4,0.98,7.21,3,'años','Colgante','Analógica, Modbus','ISO 9001, ISO 14001'),
('node_24','Temperatura','TempCorp','C4000','°C',912.78,1.62,0.84,8,'s',0.232,26.1,-12.1,'DC',4.3,11.3,0.33,1.48,3,'años','Superficie','Modbus','CE'),
('node_25','PM10','NoiseGuard','N6000','µg/m³',880.09,8.95,2.11,3,'s',0.933,-31.9,-17.4,'DC',4.2,7.1,0.29,3.31,6,'años','Colgante','Analógica, Modbus, Digital','ISO 9001'),
('node_26','Presión','PressSense','P3000','Pa',943.93,0.13,0.42,6,'s',0.754,10.1,-20.9,'DC',4.5,8.3,0.37,6.95,2,'años','Superficie','Modbus, Digital, RS485','ISO 14001'),
('node_27','Ruido','LightMeter','P3000','dB',220,3.44,0.21,7,'s',0.205,-1.1,-3,'DC',3.9,10.1,0.2,3.7,1,'años','Empotrado','Modbus','UL'),
('node_28','CO2','PressSense','T1000','ppm',978.16,0.13,4.66,6,'s',0.97,66.8,-35.1,'DC',4.7,5.7,0.2,5.03,7,'años','Empotrado','Analógica','UL'),
('node_29','PM10','PressSense','P3000','µg/m³',747.9,8.76,0.52,6,'s',0.831,-23.1,-33.6,'DC',4.4,6.4,0.12,2.09,7,'años','Colgante','Modbus, RS485, Digital','ISO 14001, ISO 9001'),
('node_30','Luminosidad','TempCorp','C4000','lux',859.27,7.13,2.65,5,'s',0.838,-33.1,-3.3,'DC',3.4,9.5,0.92,1.75,9,'años','Colgante','Digital, RS485, Modbus','ISO 9001, CE'),
('node_31','PM2.5','NoiseGuard','N6000','µg/m³',664.08,4.91,4.12,9,'s',0.322,67.2,-9.5,'DC',4.1,8.5,0.5,1.7,1,'años','Empotrado','Digital, RS485','ISO 14001, CE'),
('node_32','Presión','NoiseGuard','L5000','Pa',348.83,5.5,2.09,4,'s',0.731,65,-12.9,'DC',3.7,6.7,0.51,4.15,9,'años','Superficie','Digital, RS485','CE'),
('node_33','PM2.5','LightMeter','N6000','µg/m³',89.64,7.81,3.75,4,'s',0.659,-21.2,-38.8,'DC',3.3,11.4,0.73,4.87,4,'años','Superficie','RS485, Modbus, Analógica','ISO 9001, CE'),
('node_34','PM10','HumidTech','C4000','µg/m³',18.22,2.19,3.25,8,'s',0.874,34.4,-15.2,'DC',4.8,7.6,0.14,6.67,4,'años','Colgante','Digital, RS485','ISO 14001'),
('node_1','Presión','AirQuality','T1000','Pa',550.43,0.66,0.14,8,'s',0.671,60.9,-13,'DC',3.2,6.2,0.15,5.25,10,'años','Empotrado','RS485, Digital','UL, ISO 9001'),
('node_2','Luminosidad','TempCorp','L5000','lux',774.34,8.36,4.69,7,'s',0.873,-25,-46.2,'DC',3.7,9.5,0.12,4.66,4,'años','Colgante','Modbus','CE'),
('node_3','Ruido','LightMeter','N6000','dB',301.23,7.01,3.46,5,'s',0.401,-36.3,-13.9,'DC',4.1,10,0.22,9.8,7,'años','Superficie','Analógica, Digital','ISO 14001'),
('node_4','Luminosidad','PressSense','N6000','lux',199.32,8.84,0.11,10,'s',0.203,-0.9,-25.9,'DC',3.6,10.9,0.49,6.29,4,'años','Superficie','Digital, RS485','CE, ISO 14001'),
('node_5','PM2.5','AirQuality','L5000','µg/m³',990.98,8.97,4.37,7,'s',0.78,11.9,-23.4,'DC',5,8.9,0.1,9.78,4,'años','Empotrado','Digital','UL, ISO 14001'),
('node_6','Temperatura','AirQuality','H2000','°C',633.87,5.64,0.25,5,'s',0.624,75,-49.6,'DC',3.5,8.9,0.9,7.6,4,'años','Empotrado','Digital, Analógica, Modbus','ISO 14001, UL'),
('node_7','PM10','AirQuality','T1000','µg/m³',86.07,0.67,2.43,7,'s',0.916,-4.4,-5.4,'DC',5,11.1,0.34,8.17,5,'años','Superficie','Digital, Analógica, Modbus','ISO 14001'),
('node_8','Luminosidad','PressSense','T1000','lux',597.02,7.78,2.45,8,'s',0.434,35.8,-13.5,'DC',4.2,7.8,0.23,4.07,4,'años','Colgante','Modbus, RS485, Analógica','FCC'),
('node_9','Ruido','AirQuality','N6000','dB',469.08,4.21,0.74,10,'s',0.206,62.7,-4.7,'DC',3.8,5.6,0.74,7.92,8,'años','Empotrado','Digital','ISO 14001, FCC'),
('node_10','Temperatura','HumidTech','P3000','°C',455.68,0.71,1.74,4,'s',0.425,-31,-39.8,'DC',3.2,5.8,0.59,9.11,8,'años','Empotrado','Modbus, Digital','ISO 14001'),
('node_11','Ruido','TempCorp','N6000','dB',728.81,7.14,4.87,5,'s',0.318,-4,-46.4,'DC',4.1,7.7,0.79,6.99,1,'años','Empotrado','RS485','ISO 9001'),
('node_12','Luminosidad','AirQuality','P3000','lux',328.02,8.93,4.08,2,'s',0.644,24.6,-22.7,'DC',4.1,6.4,0.55,9.61,6,'años','Superficie','Modbus, Analógica','UL, ISO 9001'),
('node_13','CO2','LightMeter','H2000','ppm',963.77,9.82,3.23,10,'s',0.749,64.6,-31.9,'DC',3.4,9.8,0.12,9.68,9,'años','Superficie','Modbus, Analógica','CE, UL'),
('node_14','Ruido','NoiseGuard','P3000','dB',21.44,5.57,4.51,6,'s',0.579,-14.3,-6.9,'DC',3.6,12,0.12,3.2,10,'años','Superficie','Modbus, Digital, RS485','ISO 14001, UL'),
('node_15','Luminosidad','HumidTech','L5000','lux',251.15,9.42,0.19,10,'s',0.242,31.1,-37.9,'DC',4.4,7.9,0.29,4.81,2,'años','Empotrado','Modbus','CE'),
('node_16','CO2','NoiseGuard','N6000','ppm',466.25,7.82,2.67,5,'s',0.533,0.1,-25.1,'DC',4.1,7.4,0.94,3.65,10,'años','Empotrado','RS485, Modbus, Analógica','UL'),
('node_17','PM2.5','PressSense','L5000','µg/m³',140.37,7.97,0.55,9,'s',0.64,73.2,-32,'DC',3.3,9,0.56,2,10,'años','Colgante','Analógica, Digital, RS485','ISO 14001'),
('node_18','PM10','PressSense','N6000','µg/m³',396.18,1.82,0.11,4,'s',0.771,25.8,-19.9,'DC',3.8,11.1,0.36,5.21,1,'años','Colgante','Modbus, Analógica','ISO 9001, FCC'),
('node_19','CO2','LightMeter','T1000','ppm',324.59,9.87,1.86,10,'s',0.046,-29.5,-42.7,'DC',3.2,11.4,0.48,6.95,10,'años','Empotrado','Modbus, Analógica, Digital','FCC'),
('node_20','Luminosidad','TempCorp','C4000','lux',379.47,3.7,3.36,10,'s',0.22,-33.3,-40.4,'DC',3.9,5.7,0.5,9.18,1,'años','Empotrado','RS485, Digital, Modbus','CE'),
('node_21','PM2.5','NoiseGuard','H2000','µg/m³',609.97,0.61,1.47,1,'s',0.894,68.7,-24.2,'DC',4,5.8,0.46,7.32,8,'años','Empotrado','Modbus, Analógica, RS485','FCC, ISO 9001'),
('node_22','Luminosidad','AirQuality','C4000','lux',766.29,3.33,4.37,8,'s',0.602,25.2,-47.1,'DC',3.8,10.1,0.68,8.88,9,'años','Colgante','Digital, Analógica','FCC, UL'),
('node_23','PM2.5','HumidTech','T1000','µg/m³',886.42,5.59,3.17,4,'s',0.251,-21.9,-8.3,'DC',4.5,6.4,0.61,1.56,3,'años','Colgante','RS485','ISO 9001'),
('node_24','PM2.5','PressSense','T1000','µg/m³',698.32,3.19,2.43,2,'s',0.771,1.7,-0.4,'DC',4.8,10.5,0.42,7.15,3,'años','Superficie','Digital, Modbus, Analógica','ISO 14001, ISO 9001'),
('node_25','Ruido','TempCorp','T1000','dB',246.31,7.03,4.17,2,'s',0.029,40.6,-8.2,'DC',3.7,8.9,0.27,6.06,10,'años','Superficie','RS485, Analógica, Modbus','ISO 14001'),
('node_26','Temperatura','LightMeter','C4000','°C',227.13,5.69,3.34,7,'s',0.292,-27.7,-0,'DC',4.7,9.2,0.7,8.38,10,'años','Superficie','RS485, Modbus','ISO 14001, FCC'),
('node_27','CO2','LightMeter','H2000','ppm',726.35,8.03,1.69,2,'s',0.882,71.8,-34.3,'DC',4.3,9.7,0.77,6.33,8,'años','Empotrado','Digital','ISO 9001'),
('node_28','CO2','PressSense','T1000','ppm',374.79,2.7,2.5,4,'s',0.268,59.9,-39.3,'DC',4.1,11.7,0.95,2.66,7,'años','Colgante','Digital','UL, CE'),
('node_29','Humedad','LightMeter','N6000','%',85.75,4.21,1.99,7,'s',0.686,-17.2,-12.4,'DC',4.6,8.3,0.79,3.71,1,'años','Empotrado','Digital, Analógica','FCC'),
('node_30','PM2.5','NoiseGuard','C4000','µg/m³',473.09,5.35,4.82,10,'s',0.448,-14.3,-6.4,'DC',3,10.7,0.68,1.14,5,'años','Superficie','Digital, RS485','ISO 9001, CE'),
('node_31','PM2.5','AirQuality','T1000','µg/m³',171.13,8.93,2.98,3,'s',0.309,57.6,-29.2,'DC',3.6,6.3,0.37,1.88,10,'años','Empotrado','Modbus, Analógica, RS485','CE'),
('node_32','Luminosidad','HumidTech','L5000','lux',194.93,3.94,4.19,4,'s',0.759,84,-23.7,'DC',4.8,5.3,0.7,1.71,3,'años','Colgante','Digital, Modbus, Analógica','ISO 9001, ISO 14001'),
('node_33','PM2.5','TempCorp','H2000','µg/m³',518.33,2.67,4.68,3,'s',0.278,75.2,-13.4,'DC',3,11.1,0.06,2.12,3,'años','Colgante','Modbus','CE, FCC'),
('node_34','PM10','LightMeter','C4000','µg/m³',386.61,1.87,4.15,9,'s',0.303,64.2,-25.3,'DC',4.4,6.7,0.07,1.51,1,'años','Superficie','RS485, Digital','ISO 14001'),
('node_1','Luminosidad','HumidTech','N6000','lux',492.4,7.63,1.62,5,'s',0.108,3.8,-7.2,'DC',4.1,7.4,0.54,5.37,8,'años','Superficie','Analógica, RS485','ISO 14001, CE'),
('node_2','CO2','AirQuality','C4000','ppm',670.51,9.04,0.98,7,'s',0.632,-37.8,-5.6,'DC',5,7.1,0.29,6.18,3,'años','Colgante','Analógica','UL, FCC'),
('node_3','Temperatura','NoiseGuard','L5000','°C',312.45,9.48,1.96,6,'s',0.499,52.3,-1.6,'DC',3.5,5.1,0.2,4.29,3,'años','Superficie','Modbus, Digital','FCC, CE'),
('node_4','PM10','PressSense','T1000','µg/m³',536.03,0.97,2.74,1,'s',0.213,53.7,-10.4,'DC',3.2,5,0.45,2.55,1,'años','Superficie','Digital, RS485','UL'),
('node_5','PM2.5','TempCorp','H2000','µg/m³',67.08,0.78,1.17,9,'s',0.405,76.2,-47.4,'DC',3.3,10.7,0.52,8.98,8,'años','Colgante','Digital','ISO 9001, UL'),
('node_6','PM2.5','LightMeter','N6000','µg/m³',567.68,6.89,1.85,2,'s',0.767,-35.3,-40.3,'DC',3.9,7.6,0.05,4.06,6,'años','Colgante','Digital','UL'),
('node_7','Ruido','LightMeter','C4000','dB',773.14,4.67,0.62,5,'s',0.774,76.1,-15,'DC',4.1,8.1,0.89,9.17,7,'años','Empotrado','RS485','ISO 14001, FCC'),
('node_8','PM2.5','NoiseGuard','P3000','µg/m³',909.75,4.24,3.8,6,'s',0.225,10.6,-10,'DC',4.5,11.1,0.9,8.89,1,'años','Colgante','Modbus, Digital, Analógica','CE'),
('node_9','Temperatura','TempCorp','P3000','°C',923.89,6.55,3.36,8,'s',0.691,9.2,-48.3,'DC',3.2,5.7,0.25,6.21,8,'años','Colgante','Modbus, RS485','ISO 9001, ISO 14001'),
('node_10','PM2.5','PressSense','P3000','µg/m³',142.05,1.37,1.24,4,'s',0.598,55.8,-0.8,'DC',3.2,6,0.85,1.45,6,'años','Colgante','Digital, Analógica, RS485','CE, ISO 14001'),
('node_11','Luminosidad','AirQuality','P3000','lux',934.01,5.28,4.23,2,'s',0.179,68.3,-24.3,'DC',4.8,9.8,0.58,6.34,6,'años','Empotrado','Analógica','ISO 14001'),
('node_12','PM2.5','PressSense','N6000','µg/m³',824.65,3.74,3.84,6,'s',0.616,5.4,-9.9,'DC',3.1,7.2,0.59,9.91,10,'años','Superficie','Analógica, Digital, RS485','CE, FCC'),
('node_13','Ruido','NoiseGuard','C4000','dB',380.96,8.82,4.44,1,'s',0.266,-26.4,-0.4,'DC',3.9,8,0.9,9.93,9,'años','Empotrado','Modbus, RS485','UL, ISO 14001'),
('node_14','Presión','NoiseGuard','H2000','Pa',248.59,6.02,2.56,2,'s',0.68,34,-9.9,'DC',4.9,6.4,0.46,9.79,10,'años','Colgante','Analógica, RS485','CE, ISO 14001'),
('node_15','CO2','NoiseGuard','C4000','ppm',400.23,6.48,3.27,4,'s',0.832,-23.8,-11.5,'DC',5,5.6,0.95,8.19,2,'años','Superficie','RS485','ISO 14001'),
('node_16','Temperatura','NoiseGuard','T1000','°C',692.43,3.93,4.98,2,'s',0.378,25.3,-44.4,'DC',4.1,10.1,0.83,4.01,10,'años','Colgante','RS485, Digital, Analógica','CE, UL'),
('node_17','PM2.5','AirQuality','P3000','µg/m³',262.55,6.07,4.85,6,'s',0.503,58.6,-45.4,'DC',3.1,6.1,0.15,9.97,7,'años','Empotrado','Analógica, Digital','ISO 14001'),
('node_18','PM10','PressSense','N6000','µg/m³',869.27,1.62,2.61,5,'s',0.766,77.4,-24.7,'DC',3.8,12,0.4,2.77,7,'años','Colgante','Modbus, RS485','ISO 9001'),
('node_19','Presión','HumidTech','L5000','Pa',602.41,0.08,1.92,6,'s',0.234,-13.8,-6.8,'DC',3.4,9.8,0.45,9.77,5,'años','Empotrado','Analógica, Digital, Modbus','UL'),
('node_20','Temperatura','LightMeter','N6000','°C',303.99,5.91,0.5,10,'s',0.611,-27.5,-21.9,'DC',4.2,6.3,0.26,6.69,8,'años','Colgante','Digital, Analógica, Modbus','ISO 14001'),
('node_21','Presión','LightMeter','N6000','Pa',935.95,4.73,1.65,7,'s',0.325,35.2,-44.9,'DC',3.8,11.3,0.66,8.91,5,'años','Empotrado','Digital, RS485','ISO 9001, CE'),
('node_22','Ruido','PressSense','C4000','dB',806.6,0.59,1.14,10,'s',0.183,68.7,-47.5,'DC',4.2,8.3,0.63,5.1,10,'años','Colgante','Modbus','ISO 14001, UL'),
('node_23','CO2','HumidTech','P3000','ppm',720.68,2.74,4.97,6,'s',0.761,83.6,-10.4,'DC',4.2,7.3,0.89,8.15,10,'años','Superficie','RS485, Modbus, Analógica','ISO 14001'),
('node_24','Ruido','PressSense','N6000','dB',608.14,9.59,0.23,1,'s',0.905,-25.2,-29.4,'DC',4.1,7.8,0.09,5.81,6,'años','Superficie','Modbus, RS485','FCC, UL'),
('node_25','Temperatura','TempCorp','T1000','°C',659.84,8.37,0.51,4,'s',0.894,66.7,-17.7,'DC',3.8,6.2,0.8,7.28,7,'años','Colgante','Analógica','ISO 9001'),
('node_26','Temperatura','PressSense','L5000','°C',583.17,5.83,1.29,6,'s',0.231,29.6,-35.2,'DC',3.6,10.8,0.27,7.66,3,'años','Superficie','RS485, Modbus','CE'),
('node_27','Humedad','NoiseGuard','P3000','%',549.13,0.66,3.66,8,'s',0.883,-28.1,-47.9,'DC',3.4,7.1,0.77,7.59,8,'años','Empotrado','RS485, Modbus, Digital','CE'),
('node_28','PM2.5','LightMeter','P3000','µg/m³',691.3,2.7,2.47,5,'s',0.529,-2.5,-46.3,'DC',3.6,8.5,0.8,5.53,4,'años','Empotrado','Modbus, Analógica','CE, ISO 9001'),
('node_29','Ruido','TempCorp','H2000','dB',695.99,6,1.86,6,'s',0.367,51,-8.1,'DC',3.8,6.1,0.5,6.29,1,'años','Colgante','RS485, Analógica, Digital','UL'),
('node_30','PM2.5','PressSense','T1000','µg/m³',681.97,6.16,4.21,7,'s',0.675,25.7,-20.4,'DC',5,8.5,0.14,3.35,1,'años','Empotrado','RS485','ISO 9001'),
('node_31','Presión','LightMeter','H2000','Pa',432.69,4.02,2.81,9,'s',0.305,61.6,-5.5,'DC',4.6,9.5,0.23,7.68,9,'años','Superficie','Digital, Modbus, RS485','UL, FCC'),
('node_32','Luminosidad','AirQuality','P3000','lux',933.64,2.22,2.58,7,'s',0.142,67.2,-25.7,'DC',3.7,9.9,0.21,7.47,7,'años','Empotrado','RS485, Analógica, Digital','ISO 9001'),
('node_33','Ruido','AirQuality','C4000','dB',807.06,6.9,4.46,8,'s',0.155,-6.3,-4.4,'DC',3,6,0.32,3.44,7,'años','Colgante','RS485','CE'),
('node_34','Luminosidad','AirQuality','T1000','lux',996.32,0.54,4.37,9,'s',0.499,21.9,-24,'DC',4,11.7,0.66,6.3,9,'años','Superficie','Digital','ISO 9001, CE'),
('node_1','PM2.5','PressSense','T1000','µg/m³',551.44,2.83,0.55,4,'s',0.992,14.2,-33.9,'DC',3,11.8,0.36,8.43,6,'años','Empotrado','Digital, RS485','UL, FCC'),
('node_2','Humedad','PressSense','T1000','%',912.15,0.41,3.23,2,'s',0.816,46.8,-18.6,'DC',3.4,9.9,0.65,5.79,9,'años','Superficie','Digital, RS485','ISO 14001, CE'),
('node_3','Temperatura','NoiseGuard','L5000','°C',496.15,2.53,1.68,3,'s',0.725,6,-44.8,'DC',3.4,11.6,0.07,6.38,7,'años','Empotrado','RS485, Digital','FCC, CE'),
('node_4','PM2.5','NoiseGuard','C4000','µg/m³',366.12,8.68,3.4,4,'s',0.057,59.5,-24.6,'DC',3.9,6.8,0.75,5.54,8,'años','Colgante','Digital','ISO 9001, ISO 14001'),
('node_5','Ruido','TempCorp','P3000','dB',282.99,4.12,3.18,5,'s',0.55,7.8,-42.8,'DC',4.6,8.7,0.52,6.15,1,'años','Superficie','RS485, Modbus','FCC, ISO 14001'),
('node_6','CO2','NoiseGuard','T1000','ppm',283.03,1.61,0.51,3,'s',0.72,-3.2,-12.5,'DC',3.4,10.3,0.28,9.69,7,'años','Colgante','Modbus','FCC, ISO 14001'),
('node_7','Temperatura','LightMeter','P3000','°C',153.44,2.74,3.7,10,'s',0.277,46.4,-16.1,'DC',3.3,8.3,0.26,7.56,3,'años','Superficie','Modbus, Digital','FCC'),
('node_8','Ruido','LightMeter','P3000','dB',75.82,1.88,0.19,8,'s',0.029,17.7,-42.4,'DC',4.1,10.2,0.09,3.92,3,'años','Colgante','Digital, Modbus','ISO 14001'),
('node_9','CO2','NoiseGuard','H2000','ppm',35.85,8.37,1.32,4,'s',0.374,51.2,-45.9,'DC',3.1,6.5,0.45,4.19,7,'años','Empotrado','Analógica, Modbus, RS485','FCC, UL'),
('node_10','Humedad','HumidTech','C4000','%',406.68,8.9,3.18,8,'s',0.809,66.6,-33.8,'DC',4.9,10.2,0.8,8.86,5,'años','Empotrado','Modbus, Analógica','UL'),
('node_11','CO2','TempCorp','T1000','ppm',984.3,2.86,2.21,3,'s',0.184,-19.7,-44.6,'DC',3.7,9,0.74,3.25,5,'años','Empotrado','Digital, RS485','ISO 9001'),
('node_12','PM10','AirQuality','C4000','µg/m³',469.24,9.86,4.94,8,'s',0.044,28.9,-21.7,'DC',4.9,7.3,0.1,4.09,1,'años','Empotrado','Digital','FCC, CE'),
('node_13','PM2.5','NoiseGuard','P3000','µg/m³',169.75,7.69,0.47,7,'s',0.263,-2.2,-26.4,'DC',3.7,6.5,0.99,2.75,10,'años','Superficie','RS485, Modbus, Digital','FCC, UL'),
('node_14','PM2.5','HumidTech','N6000','µg/m³',62.55,4.49,0.33,10,'s',0.849,72.6,-33.5,'DC',3.5,8.7,0.99,7.86,1,'años','Colgante','RS485, Modbus','ISO 9001'),
('node_15','PM10','TempCorp','H2000','µg/m³',721.81,9.31,4.05,8,'s',0.208,34.1,-4.1,'DC',4.6,10.9,0.66,7.74,7,'años','Superficie','Modbus','CE'),
('node_16','Temperatura','NoiseGuard','N6000','°C',307.24,1.43,3.35,6,'s',0.388,-22.8,-9.2,'DC',3.7,5.5,0.58,2.85,6,'años','Colgante','Modbus, Analógica, Digital','ISO 9001, CE'),
('node_17','PM2.5','LightMeter','P3000','µg/m³',902.35,5.37,3.83,3,'s',0.554,74,-10.4,'DC',4.7,10.3,0.29,2.41,2,'años','Colgante','Digital, Modbus, RS485','ISO 14001'),
('node_18','PM10','TempCorp','P3000','µg/m³',122.59,7.62,0.79,2,'s',0.654,66.6,-30.3,'DC',3.1,10.6,0.83,4.63,6,'años','Empotrado','Modbus, Analógica, RS485','UL, FCC');
