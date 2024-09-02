# python/dht_sensor.py
import time
import board
import adafruit_dht
import sqlite3
from datetime import datetime
import digitalio

class DHTSensor:
    def __init__(self):
        self.dht_device = adafruit_dht.DHT22(board.D4, use_pulseio=False)
        self.buzzer = digitalio.DigitalInOut(board.D18)
        self.buzzer.direction = digitalio.Direction.OUTPUT
        self.conn = sqlite3.connect('database/sensor_data.db')
        self.create_table()

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
            temperature = self.dht_device.temperature
            humidity = self.dht_device.humidity

            if temperature >= 32:
                self.buzzer.value = True
            elif temperature <31.9:
                self.buzzer.value = False

            now = datetime.now()
            date_str = now.strftime("%m/%d/%Y")
            time_str = now.strftime("%I:%M:%S %p")

            with self.conn:
                self.conn.execute("INSERT INTO dhtreadings (temperature, humidity, date, time) VALUES (?, ?, ?, ?)",
                                  (temperature, humidity, date_str, time_str))

            print(f"Temp: {temperature:.1f} C, Humidity: {humidity:.1f}%")

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
