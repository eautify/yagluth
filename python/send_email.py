from datetime import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import sqlite3

class EmailClass:
    def __init__(self):
        # Email configuration
        self.email_config = {
            'sender': '2021-200255@rtu.edu.ph',
            'app_password': 'lyts pxfq zibc ifdh',  # Use app password instead
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

    def send_email(self, gas_value, vibration_state):
        try:
            recipients = self.get_recipients()  # Get recipients from the database

            if not recipients:
                print("No email recipients found.")
                return

            # Prepare the email content
            msg = MIMEMultipart()
            msg['From'] = self.email_config['sender']
            msg['To'] = ', '.join(recipients)  # Join the list of recipients
            msg['Subject'] = 'Alert! - Gas and Vibration'

            # Include the gas and vibration data in the email content
            body = f"Alert! - Gas and Vibration detected!\n"
            body += f"\n"
            body += f"Gas Value: {gas_value}\n"
            body += f"Vibration State: {vibration_state}\n"
            body += f"Timestamp: {datetime.now().strftime('%m-%d-%Y %I:%M:%S %p')}.\n"

            msg.attach(MIMEText(body))

            with smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port']) as server:
                server.starttls()
                # Use app password here instead of the normal password
                server.login(self.email_config['sender'], self.email_config['app_password'])
                server.sendmail(self.email_config['sender'], recipients, msg.as_string())

            print(f"Email sent to: {', '.join(recipients)}")
        except Exception as e:
            print(f"Failed to send email: {e}")

    def run(self):
        # You can test the email sending functionality here if needed
        gas_value = 100  # Example gas value
        vibration_state = "Detected"  # Example vibration state
        self.send_email(gas_value, vibration_state)

if __name__ == "__main__":
    emailClass = EmailClass()
    emailClass.run()
