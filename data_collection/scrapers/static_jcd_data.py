from data_collection.scrapers.db_config import Base
import pandas as pd
import json
from sqlalchemy import create_engine, ForeignKey, Column, String, Integer, CHAR
from sqlalchemy.orm import sessionmaker, declarative_base

# Class defines tables in DB
class Station(Base):
    __tablename__ = 'stations' 
    stationid = Column('stationid', Integer, primary_key=True)
    name = Column('name', String(255))
    address = Column('address', String(255))
    latitude = Column('latitude', String(255))
    longitude = Column('longitude', String(255))

    def __init__(self, stationid, name, address, latitude, longitude):
        self.stationid = stationid
        self.name = name
        self.address = address
        self.latitude = latitude
        self.longitude = longitude

    def __repr__(self):
        return f"{self.name}, {self.address}"

    

with open('../dbinfo.json') as f:
    db_info = json.load(f)
USER = db_info['dbConnection']['USER']
PASSWORD = db_info['dbConnection']['PASSWORD']
URI = db_info['dbConnection']['URI']
PORT = db_info['dbConnection']['PORT']
DB = db_info['dbConnection']['DB']

engine = create_engine('mysql://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB), echo=True)
print(engine.url)

# Takes all classes that extends from base and creates them in the 
# database connects to engine and creates table for each class
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()

df = pd.read_csv(f"../dublin_bikes_static_info.csv", keep_default_na=True, delimiter=',', skipinitialspace=True, encoding='Windows-1252')
print(df)


for row in df.itertuples():
    print(row)
    existing_station = session.query(Station).filter_by(stationid=row[1]).first()
    if existing_station is None:
        station = Station(row[1], row[2], row[3], str(row[4]), str(row[5]))
        session.add(station)
session.commit()