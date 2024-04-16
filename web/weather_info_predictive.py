from db_config import Base
import requests
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from Database import WeatherPredictive

# Sets options to read entire data frame

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
WEATHER_URI = 'https://api.openweathermap.org/data/2.5/forecast'
weather_data = requests.get(WEATHER_URI, params={
                            "units": "metric", "lat": 53.344, "lon": -6.2672, "appid": WEATHER_API_KEY})
weather_info = weather_data.json()

engine = create_engine('mysql://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB), echo=True)

# Takes all classes that extends from base and creates them in the
# database connects to engine and creates table for each class
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()

# Create new weather row
updated_predictive_weather = WeatherPredictive(
weather_info['list'][0]['weather'][0]['main'], 
weather_info['list'][0]['weather'][0]['description'],
weather_info['list'][0]['main']['temp'],
weather_info['list'][0]['main']['feels_like'],
weather_info['list'][0]['main']['temp_min'],
weather_info['list'][0]['main']['temp_max'],
weather_info['list'][0].get('rain'),
weather_info['list'][0]['main']['humidity'],
weather_info['list'][0]['wind']['speed'],
weather_info['list'][0]['clouds']['all'])
session.add(updated_predictive_weather)
session.commit()
