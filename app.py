from flask import Flask, request

app = Flask(__name__)

@app.route('/button-clicked', methods=['POST'])
def button_clicked():
    print("Button has been clicked!")
    return "Button has been clicked!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
