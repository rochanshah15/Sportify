"""
WSGI config for BookMyBox project from root directory.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
import sys
from pathlib import Path

from django.core.wsgi import get_wsgi_application

# Add the Django project directory to Python path
django_project_path = Path(__file__).resolve().parent / 'backend' / 'BookMyBox'
sys.path.insert(0, str(django_project_path))

# Change working directory to Django project
os.chdir(str(django_project_path))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BookMyBox.settings')

application = get_wsgi_application()
