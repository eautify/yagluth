import RPi.GPIO as GPIO
import time

# GPIO setup
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
led_pin = 25
GPIO.setup(led_pin, GPIO.OUT)

try:
    while True:
        GPIO.output(led_pin, GPIO.LOW)  # Turn on the LED
        time.sleep(1)  # Keep it on for 1 second
        GPIO.output(led_pin, GPIO.HIGH)  # Turn off the LED
        time.sleep(1)  # Keep it off for 1 second

except KeyboardInterrupt:
    pass  # Exit cleanly if interrupted

finally:
    GPIO.cleanup()  # Clean up GPIO states on exit
