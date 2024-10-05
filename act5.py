import serial
import time
import threading
import sqlite3
from datetime import datetime
import RPi.GPIO as GPIO  # For controlling the LEDs and Buzzer on Raspberry Pi
from python.send_email import EmailClass
from python.route import FlaskRoutes

serial_port = '/dev/ttyACM0'  
baud_rate = 9600
db_path = 'database/sensor_data.db'  # Path to your SQLite database

SOUND_LED_PIN = 22  # GPIO pin for the sound LED
RAIN_LED_PIN = 23   # GPIO pin for the rain LED
BUZZER_PIN = 27     # GPIO pin for the buzzer

try:
    ser = serial.Serial(serial_port, baud_rate, timeout=1)
    time.sleep(2)  # Wait for the connection to initialize
except serial.SerialException as e:
    print(f"Error: {e}")
    exit()

# GPIO setup for the LEDs and Buzzer
GPIO.setmode(GPIO.BCM)
GPIO.setup(SOUND_LED_PIN, GPIO.OUT)
GPIO.setup(RAIN_LED_PIN, GPIO.OUT)
GPIO.setup(BUZZER_PIN, GPIO.OUT)

class ValueGetter:
    def __init__(self):
        self.stop_thread = False  # Flag to stop the threads gracefully
        self.data_queue = []  # List to pass data between threads
        self.sound_value = None
        self.rain_value = None

        self.emailSender = EmailClass()
        self.flaskRoutes = FlaskRoutes(self)  # Pass self to FlaskRoutes

        # Create the tables when the program starts
        self.create_tables()

    def create_tables(self):
        # Create tables in a separate connection since this is called from the main thread
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sound (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                soundvalue REAL,
                date TEXT,
                time TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rain (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rainvalue REAL,
                date TEXT,
                time TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def get_values(self):
        email_sent = False  # Flag to track whether the email has been sent
        try:
            while not self.stop_thread:
                if ser.in_waiting > 0:  # Check if data is available to read
                    line = ser.readline().decode('utf-8').rstrip()  # Read a line and decode it

                    # Debugging: Print the raw line from the serial
                    #print(f"Raw data received: {line}")

                    # Try splitting the data
                    try:
                        self.sound_value, self.rain_value = line.split(',')
                        #print(f"Sound: {self.sound_value}, Rain: {self.rain_value}")
                        
                        # Check thresholds for LEDs and buzzer
                        sound_val = float(self.sound_value)
                        rain_val = float(self.rain_value)

                        
                        self.flaskRoutes.update_sensor_data(sound_val, rain_val, email_sent)

                        if sound_val >= 50:
                            threading.Thread(target=self.trigger_sound_led).start()

                        if rain_val >= 41:
                            threading.Thread(target=self.trigger_rain_led).start()

                        # Trigger buzzer when both thresholds are met
                        if sound_val >= 50 and rain_val >= 41:
                            threading.Thread(target=self.trigger_buzzer).start()                            
                            if not email_sent:
                                self.emailSender.send_email(sound_val, rain_val)
                                email_sent = True  # Set the flag to prevent further emails
                        else:                            
                            email_sent = False  # Reset the flag to prevent further emails

                        # Put the data into the queue for the logging thread to process
                        self.data_queue.append((self.sound_value, self.rain_value))
                    except ValueError:
                        print(f"Failed to split line: {line}. Check format.")
        except Exception as e:
            print(f"Error while reading serial data: {e}")
        finally:
            ser.close()  # Close the serial connection
            GPIO.cleanup()  # Clean up GPIO pins
            print("Serial connection and GPIO closed.")

    def trigger_sound_led(self):
        """Turn on the sound LED for 5 seconds when sound value reaches 50 or more."""
        #print("Sound value reached 50 or more. Turning on the sound LED for 5 seconds.")
        GPIO.output(SOUND_LED_PIN, GPIO.HIGH)  # Turn the sound LED on
        time.sleep(5)  # Keep it on for 5 seconds
        GPIO.output(SOUND_LED_PIN, GPIO.LOW)  # Turn the sound LED off
        #print("Sound LED turned off.")

    def trigger_rain_led(self):
        """Turn on the rain LED for 5 seconds when rain value reaches 41 or more."""
        #print("Rain value reached 41 or more. Turning on the rain LED for 5 seconds.")
        GPIO.output(RAIN_LED_PIN, GPIO.HIGH)  # Turn the rain LED on
        time.sleep(5)  # Keep it on for 5 seconds
        GPIO.output(RAIN_LED_PIN, GPIO.LOW)  # Turn the rain LED off
        #print("Rain LED turned off.")

    def trigger_buzzer(self):
        """Trigger the buzzer when both sound and rain thresholds are met."""
        #print("Both sound and rain thresholds met. Activating the buzzer.")
        GPIO.output(BUZZER_PIN, GPIO.HIGH)  # Turn the buzzer on
        time.sleep(2)  # Keep it on for 2 seconds
        GPIO.output(BUZZER_PIN, GPIO.LOW)  # Turn the buzzer off
        #print("Buzzer turned off.")

    def log_event(self):
        try:
            conn = sqlite3.connect(db_path)  # Create a new connection for this thread
            cursor = conn.cursor()

            while not self.stop_thread:
                try:
                    # Get the data from the queue
                    if self.data_queue:
                        sound_value, rain_value = self.data_queue.pop(0)

                        # Get the current date and time
                        current_time = datetime.now()
                        date_str = current_time.strftime('%m/%d/%Y')
                        time_str = current_time.strftime('%I:%M:%S %p')

                        # Insert data into sound table
                        cursor.execute('''
                            INSERT INTO sound (soundvalue, date, time) VALUES (?, ?, ?)
                        ''', (sound_value, date_str, time_str))

                        # Insert data into rain table
                        cursor.execute('''
                            INSERT INTO rain (rainvalue, date, time) VALUES (?, ?, ?)
                        ''', (rain_value, date_str, time_str))

                        # Commit the transaction
                        conn.commit()

                        print(f"Logged sound and rain values at {date_str} {time_str}")

                except Exception as e:
                    print(f"Error while logging data: {e}")

                time.sleep(5)  # Log every 5 seconds (or adjust as needed)
        except Exception as e:
            print(f"Error while connecting to SQLite in logging thread: {e}")
        finally:
            conn.close()

    def run(self):
        try:
            # Create threads for reading sensors and logging data
            thread1 = threading.Thread(target=self.get_values)
            thread2 = threading.Thread(target=self.log_event)

            # Start the threads
            thread1.start()
            thread2.start()

            # Wait for the threads to finish
            thread1.join()
            thread2.join()

        except KeyboardInterrupt:
            print("Program interrupted by user.")
            self.stop_thread = True  # Set the stop flag to true to terminate threads
            ser.close()  # Ensure the serial connection is closed
            GPIO.cleanup()  # Clean up GPIO pins after interrupt

starter = ValueGetter()
starter.run()
