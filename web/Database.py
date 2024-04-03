from db_config import Base
from sqlalchemy import Column, DateTime, ForeignKey, String, Integer, Double, Boolean
from datetime import datetime
import pandas as pd

# Class defines tables in DB
class Station(Base):
    __tablename__ = 'stations'
    station_id = Column('station_id', Integer, primary_key=True)
    name = Column('name', String(255))
    address = Column('address', String(255))
    latitude = Column('latitude', Double)
    longitude = Column('longitude', Double)
    payment_terminal = Column('payment_terminal', Boolean)

    def __init__(self, station_id, name, address, latitude, longitude, payment_terminal):
        self.station_id = station_id
        self.name = name
        self.address = address
        self.latitude = latitude
        self.longitude = longitude
        self.payment_terminal = payment_terminal

    def __repr__(self):
        return f"{self.name}, {self.address}"


class Availability(Base):
    __tablename__ = 'availability'
    station_id = Column('station_id', Integer, ForeignKey(
        'stations.station_id'), primary_key=True)
    time_updated = Column('time_updated', DateTime, primary_key=True)
    bike_stands = Column('bike_stands', Integer)
    available_bikes = Column('available_bikes', Integer)
    available_bike_stands = Column('available_bike_stands', Integer)
    status = Column('status', String(32))

    def __init__(self, station_id, bike_stands, available_bikes, available_bike_stands, status):
        self.station_id = station_id
        self.time_updated = datetime.now()
        self.bike_stands = bike_stands
        self.available_bikes = available_bikes
        self.available_bike_stands = available_bike_stands
        self.status = status

    def __repr__(self):
        return f"{self.station_id}"


class Weather(Base):
    __tablename__ = 'weather'
    time_updated = Column('time_updated', DateTime, primary_key=True)
    type = Column('type', String(255))
    description = Column('description', String(255))
    temperature = Column('temperature', Double)
    feels_like = Column('feels_like', Double)
    min_temp = Column('min_temp', Double)
    max_temp = Column('max_temp', Double)
    humidity = Column('humidity', Integer)
    wind_speed = Column('wind_speed', Double)
    visibility = Column('visibility', Integer)
    clouds = Column('clouds', Integer)
    sunrise = Column('sunrise', Integer)
    sunset = Column('sunset', Integer)

    def __init__(self, df: pd.DataFrame):
        self.time_updated = datetime.now()
        self.type = str(df['weather'][0][0]['main'])
        self.description = str(df['weather'][0][0]['description'])
        self.temperature = df['main'][0]['temp']
        self.feels_like = df['main'][0]['feels_like']
        self.min_temp = df['main'][0]['temp_min']
        self.max_temp = df['main'][0]['temp_max']
        self.humidity = df['main'][0]['humidity']
        self.wind_speed = df['wind'][0]['speed']
        self.visibility = df['visibility'][0]
        self.clouds = df['clouds'][0]['all']
        self.sunrise = df['sys'][0]['sunrise']
        self.sunset = df['sys'][0]['sunset']

    def __repr__(self):
        return f"{self.time_updated}, {self.description}, {self.temperature}"

class WeatherPredictive(Base):
    __tablename__ = 'weather_predictive'
    forecast_time = Column('forecast_time', DateTime, primary_key=True)
    type = Column('type', String(255))
    description = Column('description', String(255))
    temperature = Column('temperature', Double)
    feels_like = Column('feels_like', Double)
    min_temp = Column('min_temp', Double)
    max_temp = Column('max_temp', Double)
    rain_3h = Column('rain_3h', String(255))
    humidity = Column('humidity', Integer)
    wind_speed = Column('wind_speed', Double)
    clouds = Column('clouds', Integer)

    def __init__(self, forecast_time, type, description, temperature, feels_like, min_temp, max_temp, rain_3h,
                 humidity, wind_speed, clouds):
        self.forecast_time = datetime.fromtimestamp(forecast_time)
        self.type = type
        self.description = str(description)
        self.temperature = temperature
        self.feels_like = feels_like
        self.min_temp = min_temp
        self.max_temp = max_temp
        self.rain_3h = str(rain_3h)
        self.humidity = humidity
        self.wind_speed = wind_speed
        self.clouds = clouds

    def __repr__(self):
        return f"{self.time_updated}, {self.description}, {self.temperature}"
