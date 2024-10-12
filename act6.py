import serial
import time
import smbus2
from python.route6 import FlaskRoutes
import random
import RPi.GPIO as GPIO  # For controlling the LEDs and Buzzer on Raspberry Pi

from python.send_email6 import EmailClass



# Serial port configuration
serial_port = '/dev/ttyACM0'  
baud_rate = 9600


GPIO.setmode(GPIO.BCM)
BUZZER_PIN = 17     # GPIO pin for the buzzer
GPIO.setup(BUZZER_PIN, GPIO.OUT)

# Set up pin 27 as input with pull-down resistor
button_pin = 22
GPIO.setup(button_pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

# MPU6050 I2C address
MPU6050_ADDR = 0x68

# Register addresses
ACCEL_XOUT_H = 0x3B
GYRO_XOUT_H = 0x43

# Sensitivity scales for accelerometer and gyroscope
ACCEL_SCALE = 16384.0  # for +/- 2g
GYRO_SCALE = 131.0      # for +/- 250 degrees/second


class Activity6:
    def __init__(self):        
        self.stop_thread = False  # Flag to stop the threads gracefully

        # Initialize serial connection
        try:
            self.ser = serial.Serial(serial_port, baud_rate, timeout=1)
            time.sleep(2)  # Wait for the connection to initialize
        except serial.SerialException as e:
            print(f"Error: {e}")
            exit()

        # Initialize the I2C bus
        self.bus = smbus2.SMBus(1)

        # Wake up the MPU6050
        self.bus.write_byte_data(MPU6050_ADDR, 0x6B, 0)

        self.emailSender = EmailClass()
        self.flaskRoutes = FlaskRoutes()  # Pass self to FlaskRoutes


    def read_raw_data(self, register):
        # Read two bytes of data
        high = self.bus.read_byte_data(MPU6050_ADDR, register)
        low = self.bus.read_byte_data(MPU6050_ADDR, register + 1)
        # Combine high and low bytes
        value = (high << 8) + low
        # Convert to signed 16-bit
        if value >= 32768:
            value -= 65536
        return value
    
    def get_random_coordinates_within_pasig(self):
        # Latitude and longitude range for Pasig City, Philippines
        latitude = round(random.uniform(14.571232, 14.575946), 6)
        longitude = round(random.uniform(121.096163, 121.099188), 6)
        altitude = 0
        return latitude, longitude, altitude

    def get_values(self):
        # Read accelerometer values
        accel_xRaw = self.read_raw_data(ACCEL_XOUT_H)
        accel_yRaw = self.read_raw_data(ACCEL_XOUT_H + 2)
        accel_zRaw = self.read_raw_data(ACCEL_XOUT_H + 4)

        # Read gyroscope values
        gyro_xRaw = self.read_raw_data(GYRO_XOUT_H)
        gyro_yRaw = self.read_raw_data(GYRO_XOUT_H + 2)
        gyro_zRaw = self.read_raw_data(GYRO_XOUT_H + 4)

        # Processed values
        accel_x = accel_xRaw / ACCEL_SCALE  # Convert to g's
        accel_y = accel_yRaw / ACCEL_SCALE
        accel_z = accel_zRaw / ACCEL_SCALE

        gyro_x = gyro_xRaw / GYRO_SCALE  # Convert to degrees/sec
        gyro_y = gyro_yRaw / GYRO_SCALE
        gyro_z = gyro_zRaw / GYRO_SCALE

        return (accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z)
        
    def getValues(self):
        emailFlag = False
        try:
            while True:
                # Initialize latitude and longitude to None
                latitude = None
                longitude = None
                altitude = None

                # Read data from the serial port
                if self.ser.in_waiting > 0:  # Check if there is data available
                    try:
                        # Read a line from the serial port, decode it, and strip whitespace
                        line = self.ser.readline().decode('utf-8').strip()
                        # Split the line into latitude, longitude, and altitude, and convert to float
                        latitude, longitude, altitude = map(float, line.split(', '))
                        
                        # Turn off the buzzer since we have valid data
                        GPIO.output(BUZZER_PIN, GPIO.LOW)  
                    except ValueError:
                        # Handle cases where the line cannot be converted to floats
                        print("Error: Incomplete or malformed data received:", line)
                        # Optionally, turn on the buzzer to indicate an error
                        GPIO.output(BUZZER_PIN, GPIO.HIGH)  
                        # Generate random coordinates as a fallback
                        latitude, longitude, altitude = self.get_random_coordinates_within_pasig()
                else:
                    print("No data available on serial port. Generating random coordinates.")
                    # Turn on the buzzer to indicate no data
                    GPIO.output(BUZZER_PIN, GPIO.HIGH)  
                    # Get random coordinates within Pasig
                    latitude, longitude, altitude = self.get_random_coordinates_within_pasig()


                print(f'Latitude: {latitude}, Longitude: {longitude}')

                if GPIO.input(button_pin) == GPIO.HIGH:
                    emailFlag = True
                    self.emailSender.send_email(accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, longitude, latitude, altitude)
                    print("Button is pressed")              
                    GPIO.output(BUZZER_PIN, GPIO.HIGH)  # Turn the buzzer ON
                else:
                    emailFlag = False              
                    GPIO.output(BUZZER_PIN, GPIO.LOW)  # Turn the buzzer off

                # Read data from the MPU6050
                accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z = self.get_values()
                print(f'Accelerometer: ax: {accel_x}, ay: {accel_y}, az: {accel_z} | Gyroscope: gx: {gyro_x}, gy: {gyro_y}, gz: {gyro_z}')

                # Update sensor data
                self.flaskRoutes.update_sensor_data(accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, longitude, latitude, altitude,emailFlag)


                time.sleep(1)  # Delay for readability

        except KeyboardInterrupt:
            print("Exiting...")
        finally:
            self.ser.close()  # Close the serial connection
            GPIO.cleanup()  # Clean up GPIO pins


# Create an instance of Activity6 and start running
activity = Activity6()
activity.getValues()
