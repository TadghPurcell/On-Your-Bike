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

with open('./se-group27-project/data_collection/dbinfo.json') as f:
    db_info = json.load(f)
USER = db_info['dbConnection']['USER']
PASSWORD = db_info['dbConnection']['PASSWORD']
URI = db_info['dbConnection']['URI']
PORT = db_info['dbConnection']['PORT']
DB = db_info['dbConnection']['DB']

engine = create_engine('mysql://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB), echo=True)
print(engine.url)
try:
    connection = engine.connect()
    print("success")
except SQLAlchemyError as err:
    print("Error: ", err.__cause__)