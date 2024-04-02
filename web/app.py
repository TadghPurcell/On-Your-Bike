from db_config import Base
from flask import Flask, g, jsonify, render_template
from Database import Station, Availability, Weather
from sqlalchemy import create_engine, func, Column, String, Integer, Double, Boolean
from sqlalchemy.orm import sessionmaker, joinedload
import pandas as pd
import json
import sys
import pickle
import requests
from datetime import datetime
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.model_selection import train_test_split

app = Flask(__name__, static_url_path='')

# Get the db_info
with open('./static/dbinfo.json') as f:
    db_info = json.load(f)

USER = db_info['dbConnection']['USER']
PASSWORD = db_info['dbConnection']['PASSWORD']
URI = db_info['dbConnection']['URI']
PORT = db_info['dbConnection']['PORT']
DB = db_info['dbConnection']['DB']

FORECAST_URI = 'https://api.openweathermap.org/data/2.5/forecast'

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
    bike_stations = session.query(Station).all()
    bike_availability = session.query(Availability).filter(
        Availability.time_updated == func.max(Availability.time_updated).select()).all()
    weather = session.query(Weather).filter(
        Weather.time_updated == func.max(Weather.time_updated).select()).first()

    for row in bike_availability:
        data["stations"][row.station_id] = {
            "available_bikes": row.available_bikes,
            "available_bike_stands": row.available_bike_stands
        }

    for row in bike_stations:
        data["stations"][row.station_id]["name"] = row.name
        data["stations"][row.station_id]["latitude"] = row.latitude
        data["stations"][row.station_id]["longitude"] = row.longitude
    data["weather"] = {
        "type": weather.type,
        "temperature": weather.temperature,
        "humidity": weather.humidity,
        "wind speed": weather.wind_speed

    }
    print(data, file=sys.stdout)
    row = session.query(Station).all()

    return jsonify(data)


# Joins stations tables to give static data and latest dynamic data
@app.route("/stations/")
def get_stations():
    # subquery to find latest data in availability
    latest_dynamic_data = session.query(
        func.max(Availability.time_updated)).scalar_subquery()

    station_data = session.query(Station, Availability).\
        join(Availability, Station.station_id == Availability.station_id).\
        filter(Availability.time_updated == latest_dynamic_data).all()

    data = []

    for station, availability in station_data:
        station_data = {
            'station_id': station.station_id,
            'name': station.name,
            'latitude': station.latitude,
            'longitude': station.longitude,
            'payment_terminal': station.payment_terminal,
            'total_bike_stands': availability.bike_stands,
            'available_bikes': availability.available_bikes,
            'available_bike_stands': availability.available_bike_stands,
            'time_updated': availability.time_updated
        }
        data.append(station_data)
    return jsonify(data)


@app.route("/available/<int:station_id>")
def get_station(station_id):
    midnight = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    weather_historical = session.query(Weather).filter(
        Weather.time_updated > midnight).all()

    weather_historical_df = pd.DataFrame(
        [row.__dict__ for row in weather_historical])
    weather_historical_df = weather_historical_df[[
        'time_updated', 'temperature', 'wind_speed', 'humidity', 'type']]

    weather_data = requests.get(FORECAST_URI, params={
                                "units": "metric", "lat": 53.344, "lon": -6.2672, "appid": db_info["weatherKey"]})
    weather_info = weather_data.json()

    predicted_weather_df = pd.DataFrame(weather_info['list'])
    predicted_weather_df['temperature'] = [row['main']['temp']
                                           for row in weather_info['list']]
    predicted_weather_df['humidity'] = [row['main']['humidity']
                                        for row in weather_info['list']]
    predicted_weather_df['wind_speed'] = [row['wind']['speed']
                                          for row in weather_info['list']]
    predicted_weather_df['time_updated'] = pd.to_datetime(
        predicted_weather_df['dt_txt'])

    predicted_weather_df['humidity'] = predicted_weather_df['humidity'].astype(
        'int64')
    predicted_weather_df['temperature'] = predicted_weather_df['temperature'].astype(
        'float64')
    predicted_weather_df['wind_speed'] = predicted_weather_df['wind_speed'].astype(
        'float64')
    predicted_weather_df = predicted_weather_df[[
        'time_updated', 'temperature', 'wind_speed', 'humidity']]

    weather_combined = pd.concat([weather_historical_df, predicted_weather_df])

    current_date = datetime.now()

    # Generate a list of hours for today
    hours_today = [current_date.replace(
        hour=h, minute=30, second=0, microsecond=0) for h in range(24)]
    hourly_df = pd.DataFrame(hours_today, columns=['time_updated'])

    df = pd.merge_asof(hourly_df, weather_combined, on='time_updated')

    days = ['Friday', 'Monday', 'Saturday', 'Sunday', 'Thursday', 'Tuesday',
            'Wednesday']

    # One hot encode day of the week
    df['weekday'] = df['time_updated'].dt.day_name()
    df['hour'] = df['time_updated'].dt.hour
    for day in days:
        df[day] = df['weekday'] == day

    weather_types = ['Clear', 'Clouds', 'Drizzle', 'Mist', 'Rain']

    for weather_type in weather_types:
        df[weather_type] = df['type'] == weather_type

    df.drop('time_updated', axis=1, inplace=True)
    df.drop('weekday', axis=1, inplace=True)
    df.drop('type', axis=1, inplace=True)
    with open(f'../ML_models/station_{station_id}.pkl', 'rb') as file:
        # Load the model from the file
        poly_reg_model = pickle.load(file)

    poly = PolynomialFeatures(degree=3, include_bias=False)
    poly_features = poly.fit_transform(df)

    df['predicted_available'] = poly_reg_model.predict(poly_features)

    # row = session.query(Availability).filter_by(station_id=station_id)
    return df[['hour', 'predicted_available']].to_json()


@app.route('/')
def root():
    data = []
    rows = session.query(Station).all()
    for row in rows:
        data.append(row.station_id)
    # Changed to render_template as we will be importing data and I was getting errors.
    return render_template('index.html', data=data, mapsAPIKey=db_info['mapsAPIKey'])


if __name__ == "__main__":
    app.run(debug=True)
    print("Done", file=sys.stdout)
