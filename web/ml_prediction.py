from db_config import Base
from Database import Station, Availability, Weather
from sqlalchemy import create_engine, func, Column, String, Integer, Double, Boolean
from sqlalchemy.orm import sessionmaker
import json
import sys
import requests
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import pickle
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.model_selection import train_test_split


def make_prediction_for_times(station_id, weather_df, max_bikes):
    print(station_id, file=sys.stdout)

    days = ['Friday', 'Monday', 'Saturday', 'Sunday', 'Thursday', 'Tuesday',
            'Wednesday']
    # One hot encode day of the week
    weather_df['weekday'] = weather_df['time_updated'].dt.day_name(
    )
    weather_df['hour'] = weather_df['time_updated'].dt.hour
    for day in days:
        weather_df[day] = weather_df['weekday'] == day

    weather_df['rain'] = weather_df['type'] == 'Rain'

    weather_df.drop('time_updated', axis=1, inplace=True)
    weather_df.drop('weekday', axis=1, inplace=True)
    weather_df.drop('type', axis=1, inplace=True)

    # Get the columns in the right order
    weather_df = weather_df[['temperature', 'wind_speed', 'humidity', 'hour', 'rain', 'Friday',
                             'Monday', 'Saturday', 'Sunday', 'Thursday', 'Tuesday', 'Wednesday']]

    with open(f'./se-group27-project/ML_models/station_{station_id}.pkl', 'rb') as file:
        # Load the model from the file
        poly_reg_model = pickle.load(file)

    poly = PolynomialFeatures(degree=3, include_bias=False)
    poly_features = poly.fit_transform(weather_df)

    weather_df['predicted_available'] = poly_reg_model.predict(
        poly_features)

    weather_df.loc[:, 'predicted_available'] = np.clip(
        weather_df['predicted_available'], 0, max_bikes)

    return weather_df[['hour', 'predicted_available']]
