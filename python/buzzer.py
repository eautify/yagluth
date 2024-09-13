import RPi.GPIO as GPIO
import time

class Buzzer:
    def __init__(self, pin):
        self.pin = pin
        GPIO.setup(self.pin, GPIO.OUT)
        GPIO.output(self.pin, GPIO.LOW)  # Ensure the buzzer is off initially

    def activate(self):
        GPIO.output(self.pin, GPIO.HIGH)  # Turn on the buzzer
        print("Buzzer activated")

    def deactivate(self):
        GPIO.output(self.pin, GPIO.LOW)  # Turn off the buzzer
        print("Buzzer deactivated")

    def cleanup(self):
        GPIO.output(self.pin, GPIO.LOW)  # Ensure the buzzer is off on cleanup
        GPIO.cleanup(self.pin)
