from db_config import Base
from static_jcd_data import Station
from jcDecaux_info import Availability
from weather_info import Weather
from flask import Flask, g, jsonify
from sqlalchemy import create_engine, Column, String, Integer, Double, Boolean
from sqlalchemy.orm import sessionmaker
import json
import sys

app = Flask(__name__, static_url_path='')

# Get the db_info
with open('../dbinfo.json') as f:
    db_info = json.load(f)

USER = db_info['dbConnection']['USER']
PASSWORD = db_info['dbConnection']['PASSWORD']
URI = db_info['dbConnection']['URI']
PORT = db_info['dbConnection']['PORT']
DB = db_info['dbConnection']['DB']

# def connect_to_database():
#     # print(engine.url)
print('mysql+pymysql://{}:{}@localhost:{}/{}'.format(USER,
                                                     PASSWORD, PORT, DB), file=sys.stdout)
engine = create_engine(
    'mysql+pymysql://{}:{}@localhost:{}/{}'.format(USER, PASSWORD, PORT, DB), echo=True)

Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)
session = Session()
print("connected")
# return session


# def get_db():
#     db = getattr(g, '_database', None)
#     if db is None:
#         db = g._database = connect_to_database()
#     return db


# @app.teardown_appcontext
# def close_connection(exception):
#     db = getattr(g, '_database', None)
#     if db is not None:
#         db.close()


@app.route("/available/<int:station_id>")
def get_stations(station_id):
    row = session.query(Availability).filter_by(station_id=station_id)
    return jsonify(row)
    # rows = engine.execute(
    #     "SELECT available_bikes from availability where station_id = {};".format(station_id))
    # for row in rows:
    #     data.append(dict(row))
    # return jsonify(available=data)


@app.route('/')
def root():
    data = []
    rows = session.query(Station).all()
    print(rows, file=sys.stdout)
    for row in rows:
        data.append(row.station_id)
    print(data, file=sys.stdout)
    return app.send_static_file('./templates/index.html')


@app.route('/stations/<int:station_id>')
def station(station_id):
    return f'Retrieving data for station {station_id}'


if __name__ == "__main__":
    app.run(debug=True)
    print("Done", file=sys.stdout)
