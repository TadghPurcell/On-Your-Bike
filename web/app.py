from flask import Flask

app = Flask(__name__, static_url_path='')


@app.route('/')
def root():
    return app.send_static_file('./templates/index.html')


@app.route('/stations/<int:station_id>')
def station(station_id):
    return f'Retrieving data for station {station_id}'


if __name__ == "__main__":
    app.run(debug=True)
