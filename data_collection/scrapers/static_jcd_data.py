from db_config import Base
import pandas as pd
import json
import requests
from sqlalchemy import create_engine, Column, String, Integer, Boolean
from sqlalchemy.orm import sessionmaker

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

jcDecaux_data = requests.get(STATIONS_URI, params={'apiKey':BIKE_API_KEY, 'contract':NAME})
df = pd.read_json(jcDecaux_data.text)


# Class defines tables in DB
class Station(Base):
    __tablename__ = 'stations' 
    station_id = Column('station_id', Integer, primary_key=True)
    name = Column('name', String(255))
    address = Column('address', String(255))
    latitude = Column('latitude', String(255))
    longitude = Column('longitude', String(255))
    payment_terminal = Column('payment_terminal', Boolean)

    def __init__(self, stationid, name, address, latitude, longitude, payment_terminal):
        self.stationid = stationid
        self.name = name
        self.address = address
        self.latitude = latitude
        self.longitude = longitude
        self.payment_terminal = payment_terminal

    def __repr__(self):
        return f"{self.name}, {self.address}"

engine = create_engine('mysql://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB), echo=True)

# Takes all classes that extends from base and creates them in the 
# database connects to engine and creates table for each class
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()

for row in df.iterrows():
    existing_station = session.query(Station).filter_by(stationid=row[1]).first()
    if existing_station is None:
        station = Station(row[1].number, row[1].name, row[1].address, row[1].position['lat'], row[1].position['lng'], row[1].banking)
        session.add(station)
session.commit()
