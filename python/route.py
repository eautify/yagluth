# python/route.py
import sqlite3
from flask import Flask, jsonify, render_template
from datetime import datetime
import threading

class FlaskRoutes:
    def __init__(self):
        self.app = Flask(__name__, template_folder='../templates', static_folder='../static')
        self.conn = sqlite3.connect('database/sensor_data.db', check_same_thread=False)
        self.lock = threading.Lock()
        self.temperatureW = None
        self.humidityW = None
        self.distance1W = None
        self.distance2W = None
        self.create_routes()

    def get_distance(self, distance1, distance2):
        with self.lock:
            self.distance1W = distance1
            self.distance2W = distance2        

    def get_dht22(self, temperature, humidity):
        with self.lock:
            self.temperatureW = temperature
            self.humidityW = humidity

    def get_historical_readings(self):
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT date, time, temperature, humidity
            FROM dhtreadings 
            ORDER BY id DESC 
            LIMIT 30
        """)
        readings = cursor.fetchall()
        return readings

    def get_historical_distances(self):
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT distance1, distance2, date, time 
            FROM distance_readings 
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
                    'temperature': self.temperatureW,
                    'humidity': self.humidityW,
                    'distance1': round(self.distance1W, 2) if self.distance1W is not None else None,
                    'distance2': round(self.distance2W, 2) if self.distance2W is not None else None
                }
            return jsonify(data)
 
        @self.app.route('/history-dht')
        def get_historical_data():
            readings = self.get_historical_readings()
            data = [{'date': row[0], 'time': row[1], 'temperature': row[2], 'humidity': row[3]} for row in readings]
            return jsonify(data)
        
        @self.app.route('/history-distances')
        def get_historical_distances():
            readings = self.get_historical_distances()
            data = [{'distance1': row[0], 'distance2': row[1], 'date': row[2], 'time': row[3]} for row in readings]
            return jsonify(data)
