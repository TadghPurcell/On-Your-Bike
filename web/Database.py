from db_config import Base
from sqlalchemy import Column, DateTime, ForeignKey, String, Integer, Double, Boolean
from datetime import datetime


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
