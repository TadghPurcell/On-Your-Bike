import pandas as pd
import requests
from datetime import datetime
from pprint import pprint 
import json
from sqlalchemy import create_engine, Column, String, Integer, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base

#Sets options to read entire data frame
pd.set_option("display.max_rows", None, "display.max_columns", None)

with open('../dbinfo.json') as f:
    db_info = json.load(f)
# URI and name
BIKE_API_KEY = db_info['JCKey']
STATIONS_URI = 'https://api.jcdecaux.com/vls/v1/stations'
NAME = 'dublin'

USER = db_info['dbConnection']['USER']
PASSWORD = db_info['dbConnection']['PASSWORD']
URI = db_info['dbConnection']['URI']
PORT = db_info['dbConnection']['PORT']
DB = db_info['dbConnection']['DB']

Base = declarative_base()

jcDecaux_data = requests.get(STATIONS_URI, params={'apiKey':BIKE_API_KEY, 'contract':NAME})
df = pd.read_json(jcDecaux_data.text)

class Availability(Base):
    __tablename__ = 'availability'
    station_id = Column('station_id', Integer, ForeignKey('stations.stationid'), primary_key=True)
    timestamp = Column('timestamp', Integer)
    bike_stands = Column('bike_stands', Integer)
    available_bikes = Column('available_bikes', Integer)
    available_bike_stands = Column('available_bike_stands', Integer)
    status = Column('status', String(32))
    

    def __init__(self, station_id, bike_stands, available_bikes, available_bike_stands, status):
        self.station_id = station_id
        self.timestamp = datetime.now().timestamp()
        self.bike_stands = bike_stands
        self.available_bikes = available_bikes 
        self.available_bike_stands = available_bike_stands
        self.status = status

    def __repr__(self):
        return f"{self.station_id}"

engine = create_engine('mysql://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB), echo=True)

# Takes all classes that extends from base and creates them in the 
# database connects to engine and creates table for each class
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()

for row in df.iterrows():
    availabilityRow = Availability(row[1].number, row[1].bike_stands, row[1].available_bike_stands, row[1].available_bikes, row[1].status)
    session.add(availabilityRow)
    # print(row[1].number, row[1].bike_stands, row[1].available_bike_stands, row[1].available_bikes, row[1].status, row[1].last_update)
    # print('-----------')

session.commit()
    

