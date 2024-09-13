# python/distance.py
import board
import busio
import adafruit_ssd1306
from PIL import Image, ImageDraw, ImageFont
import time
import adafruit_hcsr04
import digitalio
import threading
import sqlite3
from datetime import datetime

class DistanceMonitor:
    def __init__(self):
        # Initialize I2C for OLED
        self.i2c = busio.I2C(board.SCL, board.SDA)
        self.disp = adafruit_ssd1306.SSD1306_I2C(128, 64, self.i2c)

        # Reference to another class to send readings
        self.receiver = None

        # Load default font
        self.font = ImageFont.load_default()

        # Create a new image with mode '1' (1-bit pixels, black and white)
        self.image = Image.new('1', (self.disp.width, self.disp.height))
        self.draw = ImageDraw.Draw(self.image)

        # Initialize HC-SR04 sensors
        self.sonar1 = adafruit_hcsr04.HCSR04(trigger_pin=board.D23, echo_pin=board.D24)
        self.sonar2 = adafruit_hcsr04.HCSR04(trigger_pin=board.D27, echo_pin=board.D22)

        # Initialize GPIO for buzzer
        self.buzzer = digitalio.DigitalInOut(board.D17)
        self.buzzer.direction = digitalio.Direction.OUTPUT

        self.threshold = 12

        # Initialize global variables for sensor data
        self.distance1 = 0.0
        self.distance2 = 0.0

        # Create a lock for synchronizing access to distance variables
        self.lock = threading.Lock()

        # Start threads for reading/displaying data and saving to database
        self.sensor_thread = threading.Thread(target=self.read_and_display)
        self.db_thread = threading.Thread(target=self.save_to_database)

    def set_receiver(self, receiver):
        self.receiver = receiver

    def start(self):
        """Start the monitoring and database threads."""
        self.sensor_thread.start()
        self.db_thread.start()

    def save_to_database(self):
        """Save distance data to the SQLite database every 5 seconds."""
        conn = sqlite3.connect('database/sensor_data.db')
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS distance_readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                distance1 REAL,
                distance2 REAL,
                date TEXT,
                time TEXT
            )
        ''')
        conn.commit()

        while True:
            with self.lock:
                now = datetime.now()
                date_str = now.strftime("%m/%d/%Y")
                time_str = now.strftime("%I:%M:%S %p")

                cursor.execute("INSERT INTO distance_readings (distance1, distance2, date, time) VALUES (?, ?, ?, ?)",
                               (round(self.distance1, 2), round(self.distance2, 2), date_str, time_str))
                conn.commit()

            time.sleep(5)
        conn.close()

    def read_and_display(self):
        """Continuously read data from sensors and display it on the OLED."""
        while True:
            try:
                current_distance1 = self.sonar1.distance
                current_distance2 = self.sonar2.distance

                self.distance1 = current_distance1
                self.distance2 = current_distance2

                if self.receiver:
                    self.receiver.get_distance(self.distance1, self.distance2)


                with self.lock:
                    self.distance1 = current_distance1
                    self.distance2 = current_distance2

                if self.distance1 <= self.threshold or self.distance2 <= self.threshold:
                    self.buzzer.value = True
                else:
                    self.buzzer.value = False

                self.draw.rectangle((0, 0, self.disp.width, self.disp.height), outline=0, fill=0)
                self.draw.text((0, 0), f'Distance 1: {self.distance1:.2f} cm', font=self.font, fill=255)
                self.draw.text((0, 10), 'DISTANCE TOO CLOSE' if self.distance1 <= self.threshold else 'DISTANCE IS SAFE', font=self.font, fill=255)
                self.draw.text((0, 25), f'Distance 2: {self.distance2:.2f} cm', font=self.font, fill=255)
                self.draw.text((0, 35), 'DISTANCE TOO CLOSE' if self.distance2 <= self.threshold else 'DISTANCE IS SAFE', font=self.font, fill=255)
                self.disp.image(self.image)
                self.disp.show()

            except RuntimeError as e:
                self.draw.rectangle((0, 0, self.disp.width, self.disp.height), outline=0, fill=0)
                self.draw.text((0, 0), 'Error reading distance', font=self.font, fill=255)
                self.disp.image(self.image)
                self.disp.show()
                print(f"Error: {e}")

            time.sleep(0.1)

if __name__ == "__main__":
    monitor = DistanceMonitor()
    monitor.start()