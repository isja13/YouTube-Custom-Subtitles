from flask import Flask, send_from_directory
import os

app = Flask(__name__)

@app.route('/<path:filename>')
def serve_file(filename):
    directory = os.path.abspath("C:/Users/ianmo/Desktop/コード/Subtitles/Subs")
    response = send_from_directory(directory, filename)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

if __name__ == '__main__':
    app.run(port=8000)
