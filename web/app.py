from flask import Flask, g, jsonify

app = Flask(__name__, static_url_path='')


def connect_to_database():
    engine = create_engine("mysql://{}:{}@{}:{}/{}".format(config.USER,
                                                           config.PASSWORD,
                                                           config.URI,
                                                           config.PORT,
                                                           config.DB), echo=True)
    return engine


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database()
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route("/available/<int:station_id>")
def get_stations():
    engine = get_db()
    data = []
    rows = engine.execute(
        "SELECT available_bikes from  where number = {};".format(station_id))
    for row in rows:
        data.append(dict(row))
    return jsonify(available=data)


@app.route('/')
def root():
    return app.send_static_file('./templates/index.html')


@app.route('/stations/<int:station_id>')
def station(station_id):
    return f'Retrieving data for station {station_id}'


if __name__ == "__main__":
    app.run(debug=True)
