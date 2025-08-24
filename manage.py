#!/usr/bin/env python
"""Django's command-line utility for administrative tasks from root directory."""
import os
import sys
from pathlib import Path

if __name__ == '__main__':
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
        # Fallback if directory structure is different
        print(f"Backend directory not found at {backend_dir}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Root directory contents: {list(root_dir.iterdir())}")
    
    # Set Django settings module
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
