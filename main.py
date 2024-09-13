# main.py
import threading
from python.dht_sensor import DHTSensor
from python.route import FlaskRoutes
from python.distance import DistanceMonitor

def start_sensor(routes):
    sensor = DHTSensor()
    sensor.set_receiver(routes)
    sensor.run()

def start_distance(routes):
    monitor = DistanceMonitor()
    monitor.set_receiver(routes)  # Pass FlaskRoutes instance to DistanceMonitor
    monitor.start()

def start_flask_app(routes):
    routes.app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)

if __name__ == "__main__":
    routes = FlaskRoutes()

    sensor_thread = threading.Thread(target=start_sensor, args=(routes,))
    distance_thread = threading.Thread(target=start_distance, args=(routes,))
    flask_thread = threading.Thread(target=start_flask_app, args=(routes,))

    sensor_thread.start()
    distance_thread.start()
    flask_thread.start()

    sensor_thread.join()
    distance_thread.join()
    flask_thread.join()
