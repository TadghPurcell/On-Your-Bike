import sqlalchemy as sqla
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
import MySQLdb
import mysql.connector
from mysql.connector import Error
import traceback
import glob
import os
import pprint
import json
import requests
import time
from IPython.display import display

# with open('../data_collection/dbinfo.json') as f:
#     db_info = json.load(f)
# USER = db_info['dbConnection']['USER']
# PASSWORD = db_info['dbConnection']['PASSWORD']
# URI = db_info['dbConnection']['URI']
# PORT = db_info['dbConnection']['PORT']
# DB = db_info['dbConnection']['DB']

# engine = create_engine('mysql+mysqlconnector://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB), echo=True)
# # engine = create_engine('mysql+mysqlconnector://{}:{}@{}/{}'.format(USER, PASSWORD, URI, DB), echo=True)
# print(engine.url)
# connection = engine.connect()
# print(connection)
# try:
#     print("success")
# except SQLAlchemyError as err:
#     print("Error: ", err.__cause__)

import sqlalchemy as sqla
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
import MySQLdb
import mysql.connector
from mysql.connector import Error
import traceback
import glob
import os
import pprint
import json
import requests
import time
from IPython.display import display
# with open('../data_collection/dbinfo.json') as f:
#     db_info = json.load(f)
# USER = db_info['dbConnection']['USER']
# PASSWORD = db_info['dbConnection']['PASSWORD']
# URI = db_info['dbConnection']['URI']
# PORT = db_info['dbConnection']['PORT']
# DB = db_info['dbConnection']['DB']

# engine = create_engine('mysql+mysqlconnector://{}:{}@{}:{}/{}'.format(USER, PASSWORD, URI, PORT, DB), echo=True)
# # engine = create_engine('mysql+mysqlconnector://{}:{}@{}/{}'.format(USER, PASSWORD, URI, DB), echo=True)
# print(engine.url)
# connection = engine.connect()
# print(connection)
# try:
#     print("success")
# except SQLAlchemyError as err:
#     print("Error: ", err.__cause__)
def connect_to_database():
    with open('../data_collection/dbinfo.json') as f:
        db_info = json.load(f)
    USER = db_info['dbConnection']['USER']
    PASSWORD = db_info['dbConnection']['PASSWORD']
    URI = db_info['dbConnection']['URI']
    PORT = db_info['dbConnection']['PORT']
    DB = db_info['dbConnection']['DB']

    try:
        connection = mysql.connector.connect(
            host=URI,
            port=PORT,
            user=USER,
            password=PASSWORD,
            database=DB
        )

        if connection.is_connected():
            db_info = connection.get_server_info()
            print(f"Successfully connected to MySQL Server version {db_info}")
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()
            print(f"You're connected to database: {db_name}")
            # You can add your database operations here.

    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")

# Run the function to connect to your database
connect_to_database()