import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailNotificationService:
    """Servicio para enviar notificaciones por correo electrónico"""
    
    def __init__(self, smtp_server, smtp_port, email_user, email_password, from_email):
        """
        Inicializa el servicio de email
        
        Args:
            smtp_server: Servidor SMTP (ej: smtp.gmail.com)
            smtp_port: Puerto SMTP (ej: 587 para TLS)
            email_user: Usuario para autenticación
            email_password: Contraseña o app password
            from_email: Email remitente
        """
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.email_user = email_user
        self.email_password = email_password
        self.from_email = from_email
        
    def send_alert(self, to_emails, sensor_data, alert_type="DANGER"):
        """
        Envía una alerta por email
        
        Args:
            to_emails: Lista de emails destinatarios
            sensor_data: Datos del sensor que generó la alerta
            alert_type: Tipo de alerta (DANGER o WARNING)
        """
        try:
            # Crear mensaje
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = ', '.join(to_emails)
            msg['Subject'] = f"🚨 ALERTA {alert_type}: {sensor_data['type']} - {sensor_data['location']['zone']}"
            
            # Generar contenido HTML
            html_content = self._generate_alert_html(sensor_data, alert_type)
            
            # Adjuntar HTML
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)
            
            # Enviar email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email_user, self.email_password)
                server.send_message(msg)
                
            logger.info(f"Alerta enviada a {len(to_emails)} destinatarios: {sensor_data['type']}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error enviando email: {e}")
            return False
    
    def _generate_alert_html(self, data, alert_type):
        """Genera el contenido HTML del email de alerta"""
        
        # Colores según tipo de alerta
        colors = {
            "DANGER": {"bg": "#dc3545", "border": "#c82333", "icon": "🔴"},
            "WARNING": {"bg": "#ffc107", "border": "#e0a800", "icon": "🟡"}
        }
        
        color = colors.get(alert_type, colors["WARNING"])
        
        html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerta de Sensor</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: {color['bg']}; color: white; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px;">
                                {color['icon']} ALERTA {alert_type}
                            </h1>
                            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                Sistema de Monitoreo IoT - Seguridad Minera
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Información Principal -->
                    <tr>
                        <td style="padding: 30px;">
                            <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid {color['border']}; padding-bottom: 10px;">
                                Detección de Condición Anormal
                            </h2>
                            
                            <table width="100%" cellpadding="8" style="border-collapse: collapse; margin: 20px 0;">
                                <tr style="background-color: #f8f9fa;">
                                    <td style="font-weight: bold; width: 40%; border: 1px solid #dee2e6;">Tipo de Sensor:</td>
                                    <td style="border: 1px solid #dee2e6;">{data['type']}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: bold; border: 1px solid #dee2e6;">Descripción:</td>
                                    <td style="border: 1px solid #dee2e6;">{data['description']}</td>
                                </tr>
                                <tr style="background-color: #f8f9fa;">
                                    <td style="font-weight: bold; border: 1px solid #dee2e6;">Valor Actual:</td>
                                    <td style="border: 1px solid #dee2e6; font-size: 18px; color: {color['bg']}; font-weight: bold;">
                                        {data['value']} {data['unit']}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-weight: bold; border: 1px solid #dee2e6;">Estado:</td>
                                    <td style="border: 1px solid #dee2e6;">
                                        <span style="background-color: {color['bg']}; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">
                                            {data['status']}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Umbrales de Seguridad -->
                            <h3 style="color: #333; margin-top: 25px;">📊 Umbrales de Seguridad</h3>
                            <table width="100%" cellpadding="8" style="border-collapse: collapse; margin: 10px 0;">
                                <tr style="background-color: #d4edda;">
                                    <td style="border: 1px solid #c3e6cb; font-weight: bold;">✅ Límite Seguro:</td>
                                    <td style="border: 1px solid #c3e6cb;">{data['safety_thresholds'].get('safe_max', 'N/A')} {data['unit']}</td>
                                </tr>
                                <tr style="background-color: #fff3cd;">
                                    <td style="border: 1px solid #ffeaa7; font-weight: bold;">⚠️ Advertencia:</td>
                                    <td style="border: 1px solid #ffeaa7;">{data['safety_thresholds'].get('warning', 'N/A')} {data['unit']}</td>
                                </tr>
                                <tr style="background-color: #f8d7da;">
                                    <td style="border: 1px solid #f5c6cb; font-weight: bold;">🔴 Peligro:</td>
                                    <td style="border: 1px solid #f5c6cb;">{data['safety_thresholds'].get('danger', 'N/A')} {data['unit']}</td>
                                </tr>
                            </table>
                            
                            <!-- Ubicación -->
                            <h3 style="color: #333; margin-top: 25px;">📍 Ubicación</h3>
                            <table width="100%" cellpadding="8" style="border-collapse: collapse;">
                                <tr>
                                    <td style="border: 1px solid #dee2e6; font-weight: bold; width: 40%;">Zona:</td>
                                    <td style="border: 1px solid #dee2e6;">{data['location']['zone']}</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #dee2e6; font-weight: bold;">Sector:</td>
                                    <td style="border: 1px solid #dee2e6;">{data['location']['sector']}</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #dee2e6; font-weight: bold;">Node ID:</td>
                                    <td style="border: 1px solid #dee2e6;">{data['node_id']}</td>
                                </tr>
                            </table>
                            
                            <!-- Información del Dispositivo -->
                            <h3 style="color: #333; margin-top: 25px;">🔧 Información del Dispositivo</h3>
                            <table width="100%" cellpadding="8" style="border-collapse: collapse;">
                                <tr>
                                    <td style="border: 1px solid #dee2e6; font-weight: bold; width: 40%;">Fabricante:</td>
                                    <td style="border: 1px solid #dee2e6;">{data['manufacturer']}</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #dee2e6; font-weight: bold;">Modelo:</td>
                                    <td style="border: 1px solid #dee2e6;">{data['model']}</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #dee2e6; font-weight: bold;">Firmware:</td>
                                    <td style="border: 1px solid #dee2e6;">{data['firmware_version']}</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #dee2e6; font-weight: bold;">Última Calibración:</td>
                                    <td style="border: 1px solid #dee2e6;">{data['metadata']['last_calibration']}</td>
                                </tr>
                            </table>
                            
                            <!-- Timestamp -->
                            <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid {color['border']};">
                                <strong>🕐 Fecha y Hora:</strong><br>
                                {data['timestamp']}
                            </div>
                            
                            <!-- Normativas -->
                            <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 4px;">
                                <strong>📋 Cumplimiento Normativo:</strong><br>
                                {', '.join(data['metadata']['compliance'])}
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Acción Recomendada -->
                    <tr>
                        <td style="padding: 20px 30px; background-color: #fff3cd; border-top: 2px solid {color['border']};">
                            <h3 style="margin-top: 0; color: #856404;">⚡ Acción Recomendada</h3>
                            <p style="margin: 0; color: #856404;">
                                {'<strong>EVACUACIÓN INMEDIATA</strong> de la zona afectada. Contactar al supervisor de seguridad y equipo de respuesta ante emergencias.' if alert_type == 'DANGER' else 'Monitorear continuamente la situación. Preparar plan de contingencia y mantener comunicación con el equipo de seguridad.'}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; background-color: #343a40; color: white; text-align: center; font-size: 12px;">
                            <p style="margin: 0;">
                                Sistema de Monitoreo IoT para Seguridad Minera<br>
                                Conforme a ISO 45001, ISO 14001 y DS 024-2016-EM
                            </p>
                            <p style="margin: 10px 0 0 0; opacity: 0.7;">
                                Este es un mensaje automático. No responder a este correo.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
        return html