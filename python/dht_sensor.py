# python/dht_sensor.py
import time
import board
import adafruit_dht
import sqlite3
from datetime import datetime
import digitalio

class DHTSensor:
    def __init__(self):
        self.dht_device = adafruit_dht.DHT22(board.D23, use_pulseio=False)
        self.buzzer = digitalio.DigitalInOut(board.D22)
        self.buzzer.direction = digitalio.Direction.OUTPUT
        self.conn = sqlite3.connect('database/sensor_data.db')
        self.temperature = None
        self.humidity = None
        self.create_table()
        
        # Reference to another class to send readings
        self.receiver = None

    def set_receiver(self, receiver):
        self.receiver = receiver

    def create_table(self):
        with self.conn:
            self.conn.execute('''CREATE TABLE IF NOT EXISTS dhtreadings (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                temperature REAL,
                                humidity REAL,
                                date TEXT,
                                time TEXT)''')

    def read_sensor(self):
        try:
            self.temperature = self.dht_device.temperature
            self.humidity = self.dht_device.humidity

            if self.receiver:
                # Update this line to call the correct method
                self.receiver.get_DHT22(self.temperature, self.humidity)
            
            if self.receiver:
                self.receiver.receive_dht_values(self.temperature, self.humidity)

            if self.temperature >= 32:
                self.buzzer.value = True
            else:
                self.buzzer.value = False

            now = datetime.now()
            date_str = now.strftime("%m/%d/%Y")
            time_str = now.strftime("%I:%M:%S %p")

            with self.conn:
                self.conn.execute("INSERT INTO dhtreadings (temperature, humidity, date, time) VALUES (?, ?, ?, ?)",
                                (self.temperature, self.humidity, date_str, time_str))

            print(f"Saved to DB: Temp={self.temperature:.1f} C, Humidity={self.humidity:.1f}%, Date={date_str}, Time={time_str}")

        except RuntimeError as error:
            print(f"Error reading sensor: {error}")
        except Exception as error:
            self.dht_device.exit()
            raise error


    def run(self):
        while True:
            self.read_sensor()
            time.sleep(3)

if __name__ == "__main__":
    sensor = DHTSensor()
    sensor.run()
