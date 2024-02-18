from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
import MySQLdb
import traceback
import glob
import os
import pprint
import json
import requests
import time
from IPython.display import display

with open('../data_collection/dbinfo.json') as f:
    db_info = json.load(f)
USER = db_info['dbConnection']['USER']
PASSWORD = db_info['dbConnection']['PASSWORD']
URI = db_info['dbConnection']['URI']
PORT = db_info['dbConnection']['PORT']
DB = db_info['dbConnection']['DB']

engine = create_engine('mysql://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB), echo=True)
print(engine.url)

sql = """
CREATE TABLE IF NOT EXISTS station (
address VARCHAR(256),
banking INTEGER,
bike_stands INTEGER,
bonus INTEGER,
contract_name VARCHAR(256),
name VARCHAR(256),
number INTEGER,
position_lat REAL,
position_lng REAL,
status VARCHAR(256)
)"""

try:
    connection = engine.connect()
    res = connection.execute("DROP TABLE IF EXISTS station")
    res = connection.execute(sql)
    print(res)
except SQLAlchemyError as e:
    print("Error: ", e.__cause__)