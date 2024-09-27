import cv2
import time
import os
import sqlite3
from gpiozero import MotionSensor, DigitalOutputDevice
import threading
import adafruit_dht
import board
from datetime import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from email.mime.text import MIMEText

# Global variables for temperature and humidity
temperature2 = 30
humidity2 = None

class MotionDetection:
    def __init__(self):
        global motionValue
        motionValue = None
        self.current_motion_value = None  # Store the current motion state for logging
        self.latest_screenshot = None  # Add to store the latest screenshot path
        self.pir = MotionSensor(17)
        self.camera = cv2.VideoCapture(0)
        self.screenshot_dir = 'static/screenshots'
        self.buzzer = DigitalOutputDevice(22)
        self.dht_device = adafruit_dht.DHT22(board.D23)
        self.ensure_directories_exist()
        self.state = False
        self.data_lock = threading.Lock()
        self.stop_event = threading.Event()

        # Email configuration
        self.email_config = {
            'sender': 'groupyagluth4@outlook.com',
            'password': 'Embeddedyagluth4',
            'recipient': '2021-200255@rtu.edu.ph',
            'smtp_server': 'smtp.office365.com',
            'smtp_port': 587
        }

        self.receiver = None

    def set_receiver(self, receiver):
        self.receiver = receiver

    def receive_dht_values(self, temperature, humidity):
        global temperature2, humidity2
        with self.data_lock:
            temperature2 = temperature
            humidity2 = humidity

    def ensure_directories_exist(self):
        os.makedirs(self.screenshot_dir, exist_ok=True)

    def create_table(self, conn):
        with conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS motion_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                motion_detected TEXT,
                date TEXT,
                time TEXT
            )''')
        print("Motion events table ensured.")

    def handle_motion_event(self, conn):
        if self.pir.motion_detected:
            print("Motion detected!")
            self.buzzer.on()
            self.current_motion_value = 'Motion Detected!'  # Update current motion state
            screenshot_path = self.capture_screenshot()
            if screenshot_path:
                self.send_email(screenshot_path)

            self.state = True
        else:
            print("No motion detected.")
            self.buzzer.off()
            self.current_motion_value = 'No Motion'  # Update current motion state
            self.state = False

        if self.receiver:
            self.receiver.get_motion(self.state)

    def log_motion_event(self, conn):
        while not self.stop_event.is_set():
            now = datetime.now()
            date_str, time_str = now.strftime("%m/%d/%Y"), now.strftime("%I:%M:%S %p")
            with conn:
                # Use the current motion value for logging
                if self.current_motion_value is not None:
                    conn.execute(
                        "INSERT INTO motion_events (motion_detected, date, time) VALUES (?, ?, ?)",
                        (self.current_motion_value, date_str, time_str)
                    )
                    print(f"Logged motion event: {self.current_motion_value} at {time_str}")
                else:
                    print("No motion value to log.")
            time.sleep(5)  # Log every 5 seconds

    def capture_screenshot(self):
        ret, frame = self.camera.read()
        if ret:
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            time_label = time.strftime("%m/%d/%Y %H:%M:%S")
            cv2.putText(frame, time_label, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2, cv2.LINE_AA)
            screenshot_path = os.path.join(self.screenshot_dir, f"screenshot_{timestamp}.jpg")
            cv2.imwrite(screenshot_path, frame)
            print(f"Screenshot saved as {screenshot_path}")
            self.latest_screenshot = screenshot_path  # Update the latest screenshot
            return screenshot_path
        else:
            print("Failed to capture frame for screenshot.")
            return None

    def send_email(self, screenshot_path):
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_config['sender']
            msg['To'] = self.email_config['recipient']
            msg['Subject'] = 'Motion Detected - Screenshot Attached'

            with open(screenshot_path, 'rb') as f:
                img_data = f.read()
            image = MIMEImage(img_data, name=os.path.basename(screenshot_path))
            msg.attach(image)
            msg.attach(MIMEText(f"Motion detected at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"))

            with smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port']) as server:
                server.starttls()
                server.login(self.email_config['sender'], self.email_config['password'])
                server.sendmail(self.email_config['sender'], self.email_config['recipient'], msg.as_string())

            print(f"Email sent to {self.email_config['recipient']} with screenshot {screenshot_path}")
        except Exception as e:
            print(f"Failed to send email: {e}")

    def pir_monitor(self):
        conn = sqlite3.connect('database/sensor_data.db')
        self.create_table(conn)
        
        # Start the logging thread
        logging_thread = threading.Thread(target=self.log_motion_event, args=(conn,))
        logging_thread.start()
        print("Logging thread started.")

        while not self.stop_event.is_set():
            with self.data_lock:
                if temperature2 is not None:
                    if 25 <= temperature2 <= 33:
                        self.handle_motion_event(conn)
                    else:
                        print(f"Temperature out of range: {temperature2}°C. PIR sensor inactive.")
                        self.buzzer.off()
                else:
                    print("Temperature not yet read.")

            time.sleep(0.1)
        conn.close()
        print("Database connection closed.")

    def read_dht_sensor(self):
        while not self.stop_event.is_set():
            try:
                temperature = self.dht_device.temperature
                humidity = self.dht_device.humidity
                self.receive_dht_values(temperature, humidity)
            except Exception as e:
                print(f"Failed to read DHT sensor: {e}")
            time.sleep(2)  # Read every 2 seconds

    def run(self):
        self.motion_thread = threading.Thread(target=self.pir_monitor)
        self.motion_thread.start()
        self.dht_thread = threading.Thread(target=self.read_dht_sensor)
        self.dht_thread.start()

    def stop(self):
        self.stop_event.set()  # Signal threads to stop
        if self.camera:
            self.camera.release()
        self.buzzer.off()
        print("Camera released.")
