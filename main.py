import adafruit_dht
import time

# Set the sensor type and the GPIO pin to which the DHT22 is connected
sensor = adafruit_dht.DHT22
pin = 4  # Replace with your GPIO pin number

# Function to read temperature and humidity from DHT22
def read_temp_humidity():
    humidity, temperature = adafruit_dht.read_retry(sensor, pin)
    
    if humidity is not None and temperature is not None:
        print(f'Temperature: {temperature:.2f}°C')
        print(f'Humidity: {humidity:.2f}%')
    else:
        print('Failed to get reading. Try again!')

# Call the function to get the readings
while True:
    read_temp_humidity()
    time.sleep(5)
