#!/usr/bin/env bash

# Make sure we're in the correct directory
cd /opt/render/project/src

# Start the Django application with Gunicorn using root wsgi
exec gunicorn wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
