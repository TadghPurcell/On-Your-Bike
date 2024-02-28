from db_config import Base
import pandas as pd
import json
import requests
from sqlalchemy import create_engine, Column, String, Integer, Double, Boolean
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    'mysql+pymysql://{}:{}@{}:{}/{}'.format("root", "password", "localhost", "3306", "new_schema"), echo=True)

# Define your table class


class YourTable(Base):
    __tablename__ = 'new_table'
    idnew_table = Column(Integer, primary_key=True)
    col2 = Column(Integer)
    # Define other columns as needed


# Bind the engine to the base class
Base.metadata.bind = engine

# Create a session
DBSession = sessionmaker(bind=engine)
session = DBSession()


query = session.query(YourTable)
row = query.first()  # Execute the query to fetch the first row

# You can access attributes of the row like this:
if row:
    print(row.idnew_table, row.col2)
else:
    print("Row not found")


# Don't forget to close the session when you're done
session.close()
print("Done")