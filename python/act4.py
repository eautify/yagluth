#act4.py
import time
import sqlite3
from datetime import datetime
import RPi.GPIO as GPIO
import serial
import threading
from python.send_email import EmailClass
from python.route import FlaskRoutes

class SensorMonitor:
    def __init__(self):
        self.port = '/dev/ttyUSB0'
        self.baudrate = 9600

        self.BUZZER_PIN = 27  # GPIO pin for the buzzer
        self.SW420_PIN = 17   # GPIO pin for SW-420 sensor DOUT

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.SW420_PIN, GPIO.IN)
        GPIO.setup(self.BUZZER_PIN, GPIO.OUT)

        self.gasValue = None  # Initialize as None
        self.vibrationState = None
        self.warningState = False

        # Serial connection with ESP8266 (MQ-2)
        self.ser = serial.Serial(self.port, self.baudrate, timeout=1)
        print(f"Connected to ESP8266 on {self.port}")

        self.emailSender = EmailClass()
        self.flaskRoutes = FlaskRoutes(self)  # Pass self to FlaskRoutes

        # Lock for synchronization between threads
        self.lock = threading.Lock()

    def create_tables(self, conn):
        # Create tables for gas and vibration readings
        with conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS gasreadings (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    value REAL,
                                    date TEXT,
                                    time TEXT)''')

            conn.execute('''CREATE TABLE IF NOT EXISTS vibrationreadings (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    value TEXT,
                                    date TEXT,
                                    time TEXT)''')

    def read_serial_data(self):
        try:
            line = self.ser.readline().decode('utf-8').strip()
            if line:
                gas_value = float(line)
                if 0 <= gas_value <= 100:  # Ensure valid gas value range
                    return gas_value
                else:
                    print("Invalid gas value:", gas_value)
            return None
        except ValueError:
            print("Error converting serial data to float:", line)
            return None

    def monitor_vibration(self):
        vibration_state = GPIO.input(self.SW420_PIN)
        return vibration_state == GPIO.LOW  # Assuming LOW means vibration detected

    def log_event(self):
        # Each thread needs its own SQLite connection
        conn = sqlite3.connect('database/sensor_data.db')
        self.create_tables(conn)

        while True:
            now = datetime.now()
            date_str = now.strftime("%m/%d/%Y")
            time_str = now.strftime("%I:%M:%S %p")

            with self.lock:
                gas_value = self.gasValue
                vibration_state = self.vibrationState

            if gas_value is not None and vibration_state is not None:
                with conn:
                    conn.execute("INSERT INTO gasreadings (value, date, time) VALUES (?, ?, ?)",
                                 (gas_value, date_str, time_str))
                with conn:
                    conn.execute("INSERT INTO vibrationreadings (value, date, time) VALUES (?, ?, ?)",
                                 (vibration_state, date_str, time_str))
                print(f"Logged to Vibration DB: {vibration_state}")
                print(f"Logged to Gas DB: {gas_value}")
                print(f"Date: {date_str}, Time: {time_str}")

            time.sleep(5)

    def runVibGas(self):
        email_sent = False  # Flag to track whether the email has been sent
        try:
            while True:
                gas_value = self.read_serial_data()
                vibration_state = self.monitor_vibration()

                with self.lock:
                    self.gasValue = gas_value
                    self.vibrationState = vibration_state
                
                # Update Flask with new sensor data
                self.flaskRoutes.update_sensor_data(gas_value, vibration_state, self.warningState)

                if (gas_value is not None and gas_value >= 60) and vibration_state:
                    GPIO.output(self.BUZZER_PIN, GPIO.HIGH)  # Turn on the buzzer
                    self.warningState = True

                    # Send email only if it hasn't been sent yet
                    if not email_sent:
                        self.emailSender.send_email(gas_value, vibration_state)
                        email_sent = True  # Set the flag to prevent further emails
                else:
                    GPIO.output(self.BUZZER_PIN, GPIO.LOW)  # Turn off the buzzer
                    email_sent = False  # Reset the flag when conditions are no longer met
                    self.warningState = False

                time.sleep(0.5)


        except KeyboardInterrupt:
            print("Program interrupted by user.")
        finally:
            GPIO.cleanup()
            self.ser.close()


    def run(self):
        # Create threads for reading sensors and logging data
        thread1 = threading.Thread(target=self.runVibGas)
        thread2 = threading.Thread(target=self.log_event)

        # Start the threads
        thread1.start()
        thread2.start()

        # Wait for the threads to finish
        thread1.join()
        thread2.join()

if __name__ == "__main__":
    monitor = SensorMonitor()
    monitor.run()
