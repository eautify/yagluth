# python/route.py
import sqlite3
from flask import Flask, jsonify, render_template, request
import threading

class FlaskRoutes:
    def __init__(self, motion_detection):
        self.motion_detection = motion_detection
        self.app = Flask(__name__, template_folder='../templates', static_folder='../static')
        self.lock = threading.Lock()
        self.create_routes()

        # Start Flask app in a separate thread
        threading.Thread(target=self.app.run, kwargs={'host': '0.0.0.0', 'port': 5000}).start()

        self.create_tables()

    def create_tables(self):
        # Create tables in a new connection
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

    def get_historical_sound(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""SELECT soundvalue, time FROM sound ORDER BY id DESC LIMIT 30""")
            readings = cursor.fetchall()
            return readings
        except Exception as e:
            print(f"Error fetching historical sound data: {e}")
            return []

    def get_historical_rain(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""SELECT rainvalue, time FROM rain ORDER BY id DESC LIMIT 30""")
            readings = cursor.fetchall()
            return readings
        except Exception as e:
            print(f"Error fetching historical rain data: {e}")
            return []

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
                    'Sound': self.sound_val,
                    'Rain': self.rain_val,
                    'Email': self.email_sent
                }
            return jsonify(data)
        
        @self.app.route('/history-sound')
        def get_historical_sound():
            readings = self.get_historical_sound()
            data = [{'sound': row[0], 'time': row[1]} for row in readings]
            return jsonify(data)    
        
        @self.app.route('/history-rain')
        def get_historical_rain():
            readings = self.get_historical_rain()
            data = [{'rain': row[0], 'time': row[1]} for row in readings]
            return jsonify(data)   
        

        @self.app.route('/save-email', methods=['POST'])
        def save_email():
            try:
                data = request.get_json()
                email = data.get('email')

                if not email:
                    return jsonify({'message': 'Invalid email.'}), 400

                # Insert the email into the database using a fresh connection
                conn = sqlite3.connect('database/sensor_data.db')
                cursor = conn.cursor()
                cursor.execute('INSERT INTO emails (email) VALUES (?)', (email,))
                conn.commit()
                conn.close()

                return jsonify({'message': 'Email saved successfully!'})
            except Exception as e:
                return jsonify({'message': f'Error: {str(e)}'}), 500

    def update_sensor_data(self, sound_val, rain_val, email_sent):
        with self.lock:
            self.sound_val = sound_val
            self.rain_val = rain_val
            self.email_sent = email_sent
