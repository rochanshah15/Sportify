#!/usr/bin/env python
"""Django's command-line utility for administrative tasks from root directory."""
import os
import sys
from pathlib import Path

if __name__ == '__main__':
    # Add the Django project directory to Python path
    django_project_path = Path(__file__).resolve().parent / 'backend' / 'BookMyBox'
    sys.path.insert(0, str(django_project_path))
    
    # Change working directory to Django project
    os.chdir(str(django_project_path))
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BookMyBox.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
