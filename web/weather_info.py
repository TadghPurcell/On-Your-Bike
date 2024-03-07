from db_config import Base
import pandas as pd
import requests
from datetime import datetime
import json
from sqlalchemy import create_engine, Column, String, Integer, Double, DateTime
from sqlalchemy.orm import sessionmaker

# Sets options to read entire data frame
pd.set_option("display.max_rows", None, "display.max_columns", None)

with open('./static/dbinfo.json') as f:
    db_info = json.load(f)
WEATHER_API_KEY = db_info['weatherKey']
USER = db_info['dbConnection']['USER']
PASSWORD = db_info['dbConnection']['PASSWORD']
URI = db_info['dbConnection']['URI']
PORT = db_info['dbConnection']['PORT']
DB = db_info['dbConnection']['DB']

# Weather
# Weather URI
WEATHER_URI = 'https://api.openweathermap.org/data/2.5/weather'
weather_data = requests.get(WEATHER_URI, params={
                            "units": "metric", "lat": 53.344, "lon": -6.2672, "appid": WEATHER_API_KEY})
weather_info = weather_data.json()

# use pd.DataFrame because data is already an object
df = pd.DataFrame([weather_info])

# Class defines tables in DB


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

    def __init__(self):
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


engine = create_engine(
    'mysql+pymysql://{}:{}@localhost:{}/{}'.format(USER, PASSWORD, PORT, DB), echo=True)

# Takes all classes that extends from base and creates them in the
# database connects to engine and creates table for each class
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()

# Create new weather row
updated_weather = Weather()
session.add(updated_weather)
session.commit()
