import RPi.GPIO as GPIO
import time

# Use GPIO pin numbering
GPIO.setmode(GPIO.BCM)

# Set up pin 27 as input with pull-down resistor
button_pin = 22
GPIO.setup(button_pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

try:
    while True:
        # Check if the button is pressed
        if GPIO.input(button_pin) == GPIO.HIGH:
            print("Button is pressed")
        else:
            print("Button is not pressed")
        
        # Short delay to prevent excessive CPU usage
        time.sleep(0.1)

except KeyboardInterrupt:
    print("Program terminated")

finally:
    GPIO.cleanup()
