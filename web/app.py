from db_config import Base
from static_jcd_data import Station
from jcDecaux_info import Availability
from weather_info import Weather
from flask import Flask, g, jsonify
from sqlalchemy import create_engine, func, Column, String, Integer, Double, Boolean
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

# Create a new session
engine = create_engine(
    'mysql+pymysql://{}:{}@localhost:{}/{}'.format(USER, PASSWORD, PORT, DB), echo=True)
Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)
session = Session()
print("connected")

# Gives all of the data needed for the home page


@app.route("/home/")
def get_all_stations():
    # Station ID, Name, longitude, latitude
    # Weather data
    # Station availability
    data = {"stations": {},
            "weather": {}}
    rows = session.query(Availability).filter(
        Availability.time_updated == func.max(Availability.time_updated).select())
    for row in rows:
        print(type(row.station_id), file=sys.stdout)
        data["stations"][row.station_id] = "1"
        data2.append(row.available_bikes)
        print(row.station_id)
        print(row.available_bikes)
        print(row.available_bike_stands)
        print(row.time_updated)
    print(data, file=sys.stdout)
    print(data2, file=sys.stdout)
    row = session.query(Station).all()

    return jsonify(rows)


@app.route("/available/<int:station_id>")
def get_stations(station_id):
    row = session.query(Availability).filter_by(station_id=station_id)
    return jsonify(row)


@app.route('/')
def root():
    data = []
    rows = session.query(Station).all()
    for row in rows:
        data.append(row.station_id)
    return app.send_static_file('./templates/index.html')


if __name__ == "__main__":
    app.run(debug=True)
    print("Done", file=sys.stdout)
