from datetime import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import sqlite3

class EmailClass:
    def __init__(self):
        # Email configuration
        self.email_config = {
            'sender': 'dr.dravensmith@gmail.com',
            'app_password': 'qfqw fkyc putk itya',  # Use app password instead
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587
        }

    def get_recipients(self):
        recipients = []
        try:
            # Connect to the database
            conn = sqlite3.connect('database/sensor_data.db')
            cursor = conn.cursor()
            cursor.execute("SELECT email FROM emails")  # Fetch all email addresses
            rows = cursor.fetchall()

            # Extract emails from the fetched rows
            for row in rows:
                recipients.append(row[0])  # Assuming row[0] contains the email address

            conn.close()
        except Exception as e:
            print(f"Failed to retrieve email recipients: {e}")
        return recipients

    def decimal_to_dms(self, degrees):
        abs_degrees = abs(degrees)
        d = int(abs_degrees)
        m_float = (abs_degrees - d) * 60
        m = int(m_float)
        s = (m_float - m) * 60
        return d, m, s

    def format_coordinates(self, lat, lon):
        # Convert latitude to DMS
        lat_d, lat_m, lat_s = self.decimal_to_dms(lat)
        lat_direction = 'N' if lat >= 0 else 'S'

        # Convert longitude to DMS
        lon_d, lon_m, lon_s = self.decimal_to_dms(lon)
        lon_direction = 'E' if lon >= 0 else 'W'

        lat_str = f"{lat_d}°{lat_m}'{lat_s:.1f}\"{lat_direction}"
        lon_str = f"{lon_d}°{lon_m}'{lon_s:.1f}\"{lon_direction}"

        return lat_str, lon_str

    def send_email(self, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, longitude, latitude, altitude):
        try:
            recipients = self.get_recipients()

            if not recipients:
                print("No email recipients found.")
                return

            # Convert latitude and longitude to DMS format
            lat_dms, lon_dms = self.format_coordinates(latitude, longitude)

            # Prepare the email content
            msg = MIMEMultipart()
            msg['From'] = self.email_config['sender']
            msg['To'] = ', '.join(recipients)
            msg['Subject'] = 'Alert! - Activity #5'

            body = f"Alert! - Location is Requested!\n"
            body += f"\n"            
            body += f"Location:\n"            
            body += f"Coordinates: {lat_dms}{lon_dms}\n"
            body += f"Latitude: {latitude}\n"
            body += f"Longitude: {longitude}\n"
            body += f"Altitude: {altitude}\n"
            body += f"\n"
            body += f"Accelerometer:\n"
            body += f"X: {accel_x}\n"
            body += f"Y: {accel_y}\n"
            body += f"Z: {accel_z}\n"
            body += f"\n"
            body += f"Gyroscope:\n"
            body += f"X: {gyro_x}\n"
            body += f"Y: {gyro_y}\n"
            body += f"Z: {gyro_z}\n"
            body += f"\n"
            body += f"Timestamp: {datetime.now().strftime('%m-%d-%Y %I:%M:%S %p')}.\n"

            msg.attach(MIMEText(body))

            with smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port']) as server:
                server.starttls()
                server.login(self.email_config['sender'], self.email_config['app_password'])
                server.sendmail(self.email_config['sender'], recipients, msg.as_string())

            print(f"Email sent to: {', '.join(recipients)}")
        except Exception as e:
            print(f"Failed to send email: {e}")

    def run(self):
        # Example values
        accel_x, accel_y, accel_z = 0.12, 0.15, 0.98
        gyro_x, gyro_y, gyro_z = 1.5, -0.5, 0.8
        latitude, longitude, altitude = 14.54377, 121.09703, 150  # Example coordinates
        self.send_email(accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, longitude, latitude, altitude)

if __name__ == "__main__":
    emailClass = EmailClass()
    emailClass.run()
