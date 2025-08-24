"""
WSGI config for BookMyBox project from root directory.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
import sys
from pathlib import Path

# Get the absolute path to the root directory
root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / 'backend' / 'BookMyBox'

# Add both directories to Python path
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(backend_dir))

# Change working directory to Django project
if backend_dir.exists():
    os.chdir(str(backend_dir))
else:
    # Fallback if directory structure is different in deployment
    print(f"Backend directory not found at {backend_dir}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Root directory contents: {list(root_dir.iterdir())}")

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BookMyBox.settings')

# Import Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
