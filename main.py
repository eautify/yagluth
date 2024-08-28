from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:filename>')
def catch_all(filename):
    try:
        return render_template(filename)
    except:
        return "Page not found", 404


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
