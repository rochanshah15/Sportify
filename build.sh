#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

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

echo "Build completed successfully!"
