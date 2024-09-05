# python/route.py
import sqlite3
from flask import Flask, jsonify, render_template
from datetime import datetime, timedelta


class FlaskRoutes:
    def __init__(self):
        self.app = Flask(__name__, template_folder='../templates', static_folder='../static')

        # Connect to the SQLite database
        self.conn = sqlite3.connect('database/sensor_data.db', check_same_thread=False)
        self.create_routes()  # Set up routes

    def get_readings(self):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM dhtreadings ORDER BY id DESC LIMIT 1")
        reading = cursor.fetchone()
        return reading
    
    def get_historical_readings(self):
        # Get the current date and time
        current_datetime = datetime.now()
        
        # Calculate the datetime 5 minutes ago
        time_threshold = current_datetime - timedelta(minutes=5)
        
        # Convert the datetime object to match your date and time format in the database
        date_threshold = time_threshold.strftime('%m/%d/%Y')
        time_threshold_str = time_threshold.strftime('%I:%M:%S %p')
        
        # Execute the query to fetch data within the last 5 minutes
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT date, time, temperature, humidity 
            FROM dhtreadings 
            WHERE (date = ? AND time >= ?) 
            OR (date > ?)
            ORDER BY id ASC
        """, (date_threshold, time_threshold_str, date_threshold))
        
        readings = cursor.fetchall()
        return readings

    
    def create_routes(self):
        @self.app.route('/<path:filename>')
        def catch_all(filename):
            # This will serve any HTML file inside the templates folder
            return render_template(filename)
        
        @self.app.route('/')
        def index():
            return render_template('index.html')
        
        @self.app.route('/data')
        def get_sensor_data():
            reading = self.get_readings()
            if reading:
                data = {
                    'temperature': reading[1],
                    'humidity': reading[2],
                    'date': reading[3],
                    'time': reading[4]
                }
            else:
                data = {
                    'temperature': None,
                    'humidity': None,
                    'date': None,
                    'time': None
                }
            return jsonify(data)
        
        @self.app.route('/history-dht')
        def get_historical_data():
            readings = self.get_historical_readings()
            data = []
            for row in readings:
                data.append({
                    'date': row[0],
                    'time': row[1],
                    'temperature': row[2],
                    'humidity': row[3]
                })
            return jsonify(data)



# Ensure the Flask app runs only if this script is executed directly
if __name__ == "__main__":
    routes = FlaskRoutes()
    routes.app.run(debug=True, use_reloader=False)
