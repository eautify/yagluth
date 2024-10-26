from flask import Flask, jsonify, render_template, request
import sqlite3
import json
import threading
import time
from gtts import gTTS
import os

class FlaskRoutes:
    def __init__(self):
        self.app = Flask(__name__, template_folder='../templates', static_folder='../static')
        self.create_routes()

    def create_routes(self):
        # Catch-all route to render any requested HTML file
        @self.app.route('/<path:filename>')
        def catch_all(filename):
            try:
                return render_template(filename)
            except Exception as e:
                return jsonify({'message': f'File not found: {filename}', 'error': str(e)}), 404

        # Index route
        @self.app.route('/')
        def index():
            return render_template('index.html')
        
        @self.app.route('/txtPython', methods=['POST'])
        def receive_data():
            data = request.json
            textarea_value = data.get('textarea')
            select_value = data.get('select')

            # Process the data as needed
            print(f'Textarea: {textarea_value}, Selected: {select_value}')

            return jsonify({'status': 'success', 'received': data})

    def run(self):
        # Run the app on localhost
        self.app.run(host='localhost', port=5000, ssl_context=('server.cert', 'server.key'), debug=True)


class ProcessTTS:
    def __init__(self):
        pass
    
    # You can implement text-to-speech functionality here if needed

# To run the Flask app:
if __name__ == '__main__':
    flask = FlaskRoutes()
    flask.run()
