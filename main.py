# main.py
import threading
from python.act4 import SensorMonitor

def run_sensor_monitor():
    monitor = SensorMonitor()
    monitor.run()

if __name__ == "__main__":
    # Start sensor monitoring in a separate thread
    sensor_thread = threading.Thread(target=run_sensor_monitor)
    sensor_thread.start()

    # Keep the main thread alive
    sensor_thread.join()
