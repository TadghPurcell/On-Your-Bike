from db_config import Base
import pandas as pd
import requests
from datetime import datetime
import json
from sqlalchemy import create_engine, Column, String, Integer, Double, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship

# Sets options to read entire data frame
pd.set_option("display.max_rows", None, "display.max_columns", None)

with open('./static/dbinfo.json') as f:
    db_info = json.load(f)
# URI and name
BIKE_API_KEY = db_info['JCKey']
STATIONS_URI = 'https://api.jcdecaux.com/vls/v1/stations'
NAME = 'dublin'

#Details for connecting to database from dbinfo
USER = db_info['dbConnection']['USER']
PASSWORD = db_info['dbConnection']['PASSWORD']
URI = db_info['dbConnection']['URI']
PORT = db_info['dbConnection']['PORT']
DB = db_info['dbConnection']['DB']

#Request data from API
jcDecaux_data = requests.get(
    STATIONS_URI, params={'apiKey': BIKE_API_KEY, 'contract': NAME})
jcDecaux_info = jcDecaux_data.json()

#Creates a data frame to organise data from API
df = pd.DataFrame(jcDecaux_info)

#Static data
class Station(Base):
    __tablename__ = 'stations'
    station_id = Column('station_id', Integer, primary_key=True)
    name = Column('name', String(255))
    address = Column('address', String(255))
    latitude = Column('latitude', Double)
    longitude = Column('longitude', Double)
    payment_terminal = Column('payment_terminal', Boolean)
    availabilities = relationship("Availability", back_populates="station")

    def __init__(self, station_id, name, address, latitude, longitude, payment_terminal):
        self.station_id = station_id
        self.name = name
        self.address = address
        self.latitude = latitude
        self.longitude = longitude
        self.payment_terminal = payment_terminal

    def __repr__(self):
        return f"{self.name}, {self.address}"

#Dynamic Data
class Availability(Base):
    __tablename__ = 'availability'
    station_id = Column('station_id', Integer, ForeignKey(
        'stations.station_id'), primary_key=True)
    time_updated = Column('time_updated', DateTime, primary_key=True)
    bike_stands = Column('bike_stands', Integer)
    available_bikes = Column('available_bikes', Integer)
    available_bike_stands = Column('available_bike_stands', Integer)
    status = Column('status', String(32))
    station = relationship("Station", back_populates="availabilities")

    def __init__(self, station_id, bike_stands, available_bikes, available_bike_stands, status):
        self.station_id = station_id
        self.time_updated = datetime.now()
        self.bike_stands = bike_stands
        self.available_bikes = available_bikes
        self.available_bike_stands = available_bike_stands
        self.status = status
        

    def __repr__(self):
        return f"{self.station_id}"


engine = create_engine(
    'mysql+pymysql://{}:{}@localhost:{}/{}'.format(USER, PASSWORD, PORT, DB), echo=True)

# Takes all classes that extends from base and creates them in the
# database connects to engine and creates table for each class
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()

#Loop through df and add all static info for stations
for row in df.itertuples():
    existing_station = session.query(Station).filter_by(
        station_id=row.number).first()
    if existing_station is None:
        station = Station(row.number, row.name, row.address,
                          row.position['lat'], row.position['lng'], row.banking)
        session.add(station)
session.commit()

#Loop through data frame and add row to table
for row in df.itertuples():
    availabilityRow = Availability(
        row.number, row.bike_stands, row.available_bikes, row.available_bike_stands, row.status)
    session.add(availabilityRow)
    # print(row.number, row.bike_stands, row.available_bike_stands, row.available_bikes, row.status, row.last_update)
    # print('-----------')

session.commit()
