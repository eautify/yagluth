from flask import Flask, jsonify, render_template, request
import sqlite3

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
                return jsonify({'message': f'File not found: {filename}'}), 404

        # Index route
        @self.app.route('/')
        def index():
            return render_template('index.html')

        # Route to handle POST request for LED statuses
        @self.app.route('/led-status', methods=['POST'])
        def led_status():
            try:
                # Get the JSON data from the request
                led_statuses = request.get_json()

                if not led_statuses:
                    return jsonify({'error': 'No data received'}), 400

                # Process the LED statuses (example: log them)
                print("Received LED statuses:", led_statuses)

                # Example: Save LED statuses to a file, database, etc.
                # Uncomment to save to a file
                # with open('led_statuses.json', 'w') as file:
                #     json.dump(led_statuses, file)

                return jsonify({'message': 'LED statuses received successfully!'}), 200

            except Exception as e:
                return jsonify({'message': f'Error: {str(e)}'}), 500

        # Route to save email addresses
        @self.app.route('/save-email', methods=['POST'])
        def save_email():
            try:
                data = request.get_json()
                email = data.get('email')

                if not email:
                    return jsonify({'message': 'Invalid email.'}), 400

                # Connect to the database and insert the email
                conn = sqlite3.connect('database/sensor_data.db')
                cursor = conn.cursor()
                cursor.execute('INSERT INTO emails (email) VALUES (?)', (email,))
                conn.commit()
                conn.close()

                return jsonify({'message': 'Email saved successfully!'}), 200
            except Exception as e:
                return jsonify({'message': f'Error: {str(e)}'}), 500

    def run(self):
        # Running Flask app directly without threading
        self.app.run(host='0.0.0.0', port=5000, debug=True)

# To run the Flask app:
if __name__ == '__main__':
    FlaskRoutes().run()
