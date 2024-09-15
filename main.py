from flask import Flask, render_template, request, jsonify
from atomizer import Atomizer
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_acss', methods=['POST'])
def process_acss():
    data = request.json
    html = data.get('html', '')
    config = data.get('config', '{}')

    try:
        config_dict = json.loads(config)
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON in ACSS config'}), 400

    atomizer = Atomizer(config_dict)
    css = atomizer.getCss(html)

    return jsonify({'css': css})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
