# main.py
import threading
from python.dht_sensor import DHTSensor
from python.route import FlaskRoutes

def start_sensor():
    sensor = DHTSensor()
    sensor.run()

def start_flask_app():
    routes = FlaskRoutes()
    # Run the Flask app in the main thread
    routes.app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)

if __name__ == "__main__":
    # Start sensor and Flask app in separate threads
    sensor_thread = threading.Thread(target=start_sensor)
    flask_thread = threading.Thread(target=start_flask_app)

    sensor_thread.start()
    flask_thread.start()

    sensor_thread.join()
    flask_thread.join()
