# python/routes.py
from flask import render_template, jsonify

class Routes:
    def __init__(self, app, shared_data):
        self.app = app
        self.shared_data = shared_data
        self.register_routes()

    def register_routes(self):
        @self.app.route('/<path:filename>')
        def catch_all(filename):
            try:
                return render_template(filename)
            except:
                return "Page not found", 404

        @self.app.route('/')
        def index():
            return render_template('index.html')

        @self.app.route('/subpages/activitylist/activity1.html')
        def activity1():
            temperature = self.shared_data.get('temperature')
            humidity = self.shared_data.get('humidity')
            return render_template('subpages/activitylist/activity1.html', temperature=temperature, humidity=humidity)
        
        @self.app.route('/get_readings')
        def get_readings():
            # Fetch the current temperature and humidity from shared_data
            temperature = self.shared_data.get('temperature')
            humidity = self.shared_data.get('humidity')
            
            # Return the data as JSON
            return jsonify({'temperature': temperature, 'humidity': humidity})
