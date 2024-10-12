# python/route.py
import sqlite3
from flask import Flask, jsonify, render_template, request
import threading

class FlaskRoutes:
    def __init__(self):
        self.app = Flask(__name__, template_folder='../templates', static_folder='../static')
        self.lock = threading.Lock()
        self.create_database()  # Initialize the database and table
        self.create_routes()

        # Start Flask app in a separate thread
        threading.Thread(target=self.app.run, kwargs={'host': '0.0.0.0', 'port': 5000}).start()

    def create_database(self):
        # Create the SQLite database and emails table
        conn = sqlite3.connect('database/sensor_data.db')
        cursor = conn.cursor()
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS emails (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL
        )
        ''')
        conn.commit()
        conn.close()

    def create_routes(self):
        @self.app.route('/<path:filename>')
        def catch_all(filename):
            return render_template(filename)
        
        @self.app.route('/')
        def index():
            return render_template('index.html')
        
        @self.app.route('/data')
        def get_sensor_data():
            with self.lock:
                data = {
                    'accel_x': self.accel_x,
                    'accel_y': self.accel_y,
                    'accel_z': self.accel_z,
                    'gyro_x': self.gyro_x,
                    'gyro_y': self.gyro_y,
                    'gyro_z': self.gyro_z,
                    'longitude': self.longitude,
                    'latitude': self.latitude,
                    'altitude': self.altitude,
                    'email': self.emailFlag
                }
            return jsonify(data)
        
        @self.app.route('/save-email', methods=['POST'])
        def save_email():
            try:
                data = request.get_json()
                email = data.get('email')

                if not email:
                    return jsonify({'message': 'Invalid email.'}), 400

                # Insert the email into the database
                conn = sqlite3.connect('database/sensor_data.db')
                cursor = conn.cursor()
                cursor.execute('INSERT INTO emails (email) VALUES (?)', (email,))
                conn.commit()
                conn.close()

                return jsonify({'message': 'Email saved successfully!'})
            except Exception as e:
                return jsonify({'message': f'Error: {str(e)}'}), 500


    def update_sensor_data(self, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, longitude, latitude, altitude, emailFlag):
        with self.lock:
            self.accel_x = accel_x
            self.accel_y = accel_y
            self.accel_z = accel_z
            self.gyro_x = gyro_x
            self.gyro_y = gyro_y
            self.gyro_z = gyro_z
            self.longitude = longitude
            self.latitude = latitude
            self.altitude = altitude
            self.emailFlag = emailFlag
