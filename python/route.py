# python/route.py
import sqlite3
from flask import Flask, jsonify, render_template, request
import threading

class FlaskRoutes:
    def __init__(self, motion_detection):
        self.motion_detection = motion_detection
        self.app = Flask(__name__, template_folder='../templates', static_folder='../static')
        self.conn = sqlite3.connect('database/sensor_data.db', check_same_thread=False)
        self.lock = threading.Lock()
        self.gas_value = None
        self.vibration_state = None
        self.create_routes()
        
        # Start Flask app in a separate thread
        threading.Thread(target=self.app.run, kwargs={'host': '0.0.0.0', 'port': 5000}).start()
    
    def get_historical_gas(self):
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT value, time 
            FROM gasreadings
            ORDER BY id DESC 
            LIMIT 30
        """)
        readings = cursor.fetchall()
        return readings 
       
    def get_historical_vibration(self):
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT value, time 
            FROM vibrationreadings
            ORDER BY id DESC 
            LIMIT 30
        """)
        readings = cursor.fetchall()
        return readings

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
                    'Gas': self.gas_value,
                    'Vibration': self.vibration_state,
                    'Warning': self.warningDetected
                }
            return jsonify(data)
        
        @self.app.route('/history-gas')
        def get_historical_gas():
            readings = self.get_historical_gas()
            data = [{'gas': row[0], 'time': row[1]} for row in readings]
            return jsonify(data)    
        
        @self.app.route('/history-vibration')
        def get_historical_vibration():
            readings = self.get_historical_vibration()
            data = [{'vibration': row[0], 'time': row[1]} for row in readings]
            return jsonify(data)   
        

        @self.app.route('/save-email', methods=['POST'])
        def save_email():
            try:
                data = request.get_json()
                email = data.get('email')

                if not email:
                    return jsonify({'message': 'Invalid email.'}), 400

                # Insert the email into the database
                with self.lock:
                    cursor = self.conn.cursor()
                    cursor.execute('INSERT INTO emails (email) VALUES (?)', (email,))
                    self.conn.commit()

                return jsonify({'message': 'Email saved successfully!'})
            except Exception as e:
                return jsonify({'message': f'Error: {str(e)}'}), 500

    def update_sensor_data(self, gas_value, vibration_state, warningDetected):
        with self.lock:
            self.gas_value = gas_value
            self.vibration_state = vibration_state
            self.warningDetected = warningDetected
