from db_config import Base
import pandas as pd
import requests
import json
from sqlalchemy import create_engine, Column, String, Integer, Double, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship
from Database import Availability, Station

# Sets options to read entire data frame
pd.set_option("display.max_rows", None, "display.max_columns", None)

with open('./se-group27-project/web/static/dbinfo.json') as f:
    db_info = json.load(f)
# URI and name
BIKE_API_KEY = db_info['JCKey']
STATIONS_URI = 'https://api.jcdecaux.com/vls/v1/stations'
NAME = 'dublin'

# Details for connecting to database from dbinfo
USER = db_info['dbConnection']['USER']
PASSWORD = db_info['dbConnection']['PASSWORD']
URI = db_info['dbConnection']['URI']
PORT = db_info['dbConnection']['PORT']
DB = db_info['dbConnection']['DB']

# Request data from API
jcDecaux_data = requests.get(
    STATIONS_URI, params={'apiKey': BIKE_API_KEY, 'contract': NAME})
jcDecaux_info = jcDecaux_data.json()

# Creates a data frame to organise data from API
df = pd.DataFrame(jcDecaux_info)

engine = create_engine('mysql://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB), echo=True)

# Takes all classes that extends from base and creates them in the
# database connects to engine and creates table for each class
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()

# Loop through df and add all static info for stations
for row in df.itertuples():
    existing_station = session.query(Station).filter_by(
        station_id=row.number).first()
    if existing_station is None:
        station = Station(row.number, row.name, row.address,
                          row.position['lat'], row.position['lng'], row.banking)
        session.add(station)
session.commit()

# Loop through data frame and add row to table
for row in df.itertuples():
    availabilityRow = Availability(
        row.number, row.bike_stands, row.available_bikes, row.available_bike_stands, row.status)
    session.add(availabilityRow)
    # print(row.number, row.bike_stands, row.available_bike_stands, row.available_bikes, row.status, row.last_update)
    # print('-----------')

session.commit()
