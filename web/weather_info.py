from db_config import Base
import pandas as pd
import requests
from datetime import datetime
import json
from sqlalchemy import create_engine, Column, String, Integer, Double, DateTime
from sqlalchemy.orm import sessionmaker
from Database import Weather

# Sets options to read entire data frame
pd.set_option("display.max_rows", None, "display.max_columns", None)

with open('../dbinfo.json') as f:
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

engine = create_engine(
    'mysql+pymysql://{}:{}@localhost:{}/{}'.format(USER, PASSWORD, PORT, DB), echo=True)

# Takes all classes that extends from base and creates them in the
# database connects to engine and creates table for each class
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()

# Create new weather row
updated_weather = Weather(df)
session.add(updated_weather)
session.commit()
