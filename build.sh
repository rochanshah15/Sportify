#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Starting build process..."
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Build React frontend
echo "Building React frontend..."
if [ -d "project" ]; then
    cd project
    npm ci
    npm run build
    
    # Copy React build to Django static directory
    echo "Copying React build to Django static directory..."
    mkdir -p ../backend/BookMyBox/static
    cp -r dist/* ../backend/BookMyBox/static/
    cd ..
else
    echo "Warning: project directory not found, skipping frontend build"
fi

echo "Running Django management commands..."
# Use root manage.py for Django commands
python manage.py collectstatic --noinput
python manage.py migrate

# Create superuser if it doesn't exist
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@bookmybox.com', 'admin123')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
"

# Make scripts executable
chmod +x start.sh

echo "Build completed successfully!"
