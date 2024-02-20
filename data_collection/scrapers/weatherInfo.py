import pandas as pd
import requests
from datetime import datetime
from pprint import pprint 
import json
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.orm import sessionmaker, declarative_base

#Sets options to read entire data frame
pd.set_option("display.max_rows", None, "display.max_columns", None)

with open('../dbinfo.json') as f:
    db_info = json.load(f)
WEATHER_API_KEY = db_info['weatherKey']
USER = db_info['dbConnection']['USER']
PASSWORD = db_info['dbConnection']['PASSWORD']
URI = db_info['dbConnection']['URI']
PORT = db_info['dbConnection']['PORT']
DB = db_info['dbConnection']['DB']

#Weather 
#Weather URI 
WEATHER_URI = 'https://api.openweathermap.org/data/2.5/weather'
weather_request = requests.get(WEATHER_URI, params={"units": "metric", "lat": 53.344, "lon": -6.2672, "appid": WEATHER_API_KEY})
weather_data = weather_request.json()

#use pd.DataFrame because data is already an object 
df = pd.DataFrame([weather_data])

Base = declarative_base()

# Class defines tables in DB
class Weather(Base):
    __tablename__ = 'Weather'
    timestamp = Column('timestamp', String(255), primary_key=True)
    type = Column('type', String(255))
    description = Column('description', String(255))
    temperature = Column('temperature', String(255))
    feels_like = Column('feels_like', String(255))
    min_temp = Column('min_temp', String(255))
    max_temp = Column('max_temp', String(255))
    humidity = Column('humidity', String(255))
    wind_speed = Column('wind_speed', String(255))
    visibility = Column('visibility', String(255))
    clouds = Column('clouds', String(255))
    sunrise = Column('sunrise', String(255))
    sunset = Column('sunset', String(255))
    
    def __init__(self, type):
          self.timestamp = str(datetime.now().timestamp())
          self.type = type
          self.description = df['weather'][0][0]['description']
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
        return f"{self.timestamp}, {self.description}, {self.temperature}"


engine = create_engine('mysql://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB), echo=True)
print(engine.url)

# Takes all classes that extends from base and creates them in the 
# database connects to engine and creates table for each class
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()

#Create new weather row
updated_weather = Weather(df['weather'][0][0]['main'])
session.add(updated_weather)
session.commit
