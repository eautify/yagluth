import time
import board
import busio
import adafruit_ssd1306
import digitalio
from PIL import Image, ImageDraw, ImageFont

# GPIO setup using board and digitalio
TRIG = digitalio.DigitalInOut(board.D4)  # GPIO 4
ECHO = digitalio.DigitalInOut(board.D17) # GPIO 17
TRIG.direction = digitalio.Direction.OUTPUT
ECHO.direction = digitalio.Direction.INPUT

# Initialize I2C for OLED
i2c = busio.I2C(board.SCL, board.SDA)
disp = adafruit_ssd1306.SSD1306_I2C(128, 64, i2c)

# Load default font
font = ImageFont.load_default()

def measure_distance():
    # Send a pulse to trigger
    TRIG.value = False
    time.sleep(0.5)
    TRIG.value = True
    time.sleep(0.00001)
    TRIG.value = False
    
    # Measure pulse duration
    pulse_start = time.time()
    while not ECHO.value:
        pulse_start = time.time()
    while ECHO.value:
        pulse_end = time.time()
    
    pulse_duration = pulse_end - pulse_start
    distance = pulse_duration * 17150
    distance = round(distance, 2)
    return distance

def main():
    while True:
        distance = measure_distance()
        
        # Create image object for drawing
        image = Image.new('1', (disp.width, disp.height))
        draw = ImageDraw.Draw(image)
        draw.rectangle((0, 0, disp.width, disp.height), outline=0, fill=0)
        
        # Draw the text
        draw.text((0, 0), 'Distance:', font=font, fill=255)
        draw.text((0, 20), f'{distance} cm', font=font, fill=255)
        
        # Display the image
        disp.image(image)
        disp.show()  # Use show() instead of display()
        
        # Wait before the next measurement (1 second)
        time.sleep(1)

try:
    main()
except KeyboardInterrupt:
    pass  # Clean up GPIO if needed
