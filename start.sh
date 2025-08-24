#!/usr/bin/env bash

# Navigate to Django project directory
cd backend/BookMyBox

# Start the Django application with Gunicorn
gunicorn BookMyBox.wsgi:application --bind 0.0.0.0:$PORT
