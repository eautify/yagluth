from flask import Flask, jsonify, render_template, request
import sqlite3
import json
import RPi.GPIO as GPIO
import threading
import time
#import adafruit_dht

class FlaskRoutes:
    def __init__(self, led_circuits):
        self.app = Flask(__name__, template_folder='../templates', static_folder='../static')
        self.led_circuits = led_circuits
        self.create_routes()

    def create_routes(self):
        # Catch-all route to render any requested HTML file
        @self.app.route('/<path:filename>')
        def catch_all(filename):
            try:
                return render_template(filename)
            except Exception as e:
                return jsonify({'message': f'File not found: {filename}'}), 404

        # Index route
        @self.app.route('/')
        def index():
            return render_template('index.html')

        # Route to handle POST request for LED statuses
        @self.app.route('/led-status', methods=['POST'])
        def led_status():
            try:
                # Get the JSON data from the request
                led_statuses = request.get_json()
                

                if not led_statuses:
                    return jsonify({'error': 'No data received'}), 400

                # Process the LED statuses
                print("Received LED statuses:", led_statuses)
                self.led_circuits.process_led_statuses(led_statuses)

                return jsonify({'message': 'LED statuses received successfully!'}), 200

            except Exception as e:
                return jsonify({'message': f'Error: {str(e)}'}), 500

    def run(self):
        self.app.run(host='0.0.0.0', port=5000, ssl_context=('server.cert', 'server.key'), debug=True)


class LedCircuits:
    def __init__(self):
        # GPIO pin setup
        self.led_green = 24
        self.led_red = 23
        self.led_yellow = 22
        self.led_blue = 27
        self.led_white = 17

        self.ledrgb_red = 26
        self.ledrgb_green = 19
        self.ledrgb_blue = 13

        self.buzzer = 25

        # GPIO setup
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)

        GPIO.setup(self.led_green, GPIO.OUT)
        GPIO.setup(self.led_red, GPIO.OUT)
        GPIO.setup(self.led_yellow, GPIO.OUT)
        GPIO.setup(self.led_blue, GPIO.OUT)
        GPIO.setup(self.led_white, GPIO.OUT)

        GPIO.setup(self.ledrgb_red, GPIO.OUT)
        GPIO.setup(self.ledrgb_green, GPIO.OUT)
        GPIO.setup(self.ledrgb_blue, GPIO.OUT)

        GPIO.setup(self.buzzer, GPIO.OUT)

        # Interval in seconds for blinking LEDs
        self.BLINK_INTERVAL = 0.5  # Example interval for blinking

    def process_led_statuses(self, led_statuses):
        # Parse the JSON and set up individual variables for each LED
        green_status = led_statuses.get('green')
        red_status = led_statuses.get('red')
        yellow_status = led_statuses.get('yellow')
        blue_status = led_statuses.get('blue')
        white_status = led_statuses.get('white')
        rgb_color = led_statuses.get('rgbColor')
        rgb_status = led_statuses.get('rgbStatus')

        # Control each LED based on the status
        self.control_led(self.led_green, green_status)
        self.control_led(self.led_red, red_status)
        self.control_led(self.led_yellow, yellow_status)
        self.control_led(self.led_blue, blue_status)
        self.control_led(self.led_white, white_status)

        # Control the RGB LED by turning off other colors first
        if rgb_color == "red":
            self.control_rgb_led(self.ledrgb_red, rgb_status)
        elif rgb_color == "green":
            self.control_rgb_led(self.ledrgb_green, rgb_status)
        elif rgb_color == "blue":
            self.control_rgb_led(self.ledrgb_blue, rgb_status)

    def control_rgb_led(self, active_pin, status):
        # Turn off all RGB LED pins first
        GPIO.output(self.ledrgb_red, GPIO.LOW)
        GPIO.output(self.ledrgb_green, GPIO.LOW)
        GPIO.output(self.ledrgb_blue, GPIO.LOW)

        # Control only the active RGB LED pin
        if status == "on":
            GPIO.output(active_pin, GPIO.HIGH)
        elif status == "off":
            GPIO.output(active_pin, GPIO.LOW)
        elif status == "blinking":
            threading.Thread(target=self.blink_led, args=(active_pin,)).start()

    def control_led(self, led_pin, status):
        if status == "on":
            GPIO.output(led_pin, GPIO.HIGH)
        elif status == "off":
            GPIO.output(led_pin, GPIO.LOW)
        elif status == "blinking":
            threading.Thread(target=self.blink_led, args=(led_pin,)).start()

    def blink_led(self, led_pin):
        while True:
            GPIO.output(led_pin, GPIO.HIGH)
            time.sleep(self.BLINK_INTERVAL)
            GPIO.output(led_pin, GPIO.LOW)
            time.sleep(self.BLINK_INTERVAL)

    
# To run the Flask app:
if __name__ == '__main__':
    led_circuits = LedCircuits()
    flask_routes = FlaskRoutes(led_circuits)
    flask_routes.run()