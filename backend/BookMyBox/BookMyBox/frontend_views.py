from django.http import HttpResponse
from django.conf import settings
from django.template.loader import get_template
import os

def serve_react_app(request):
    """
    Serve the React app's index.html for all non-API routes
    """
    try:
        # Path to the React build index.html
        index_path = os.path.join(settings.BASE_DIR, 'static', 'index.html')
        
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return HttpResponse(content, content_type='text/html')
        else:
            # Fallback HTML if index.html is not found
            fallback_html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>BookMyBox</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
                <div id="root">
                    <h1>BookMyBox Frontend Loading...</h1>
                    <p>Please wait while the application loads.</p>
                </div>
            </body>
            </html>
            """
            return HttpResponse(fallback_html, content_type='text/html')
    except Exception as e:
        # Error fallback
        error_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>BookMyBox - Error</title>
        </head>
        <body>
            <h1>Application Error</h1>
            <p>Unable to load the frontend application.</p>
            <p>Error: {str(e)}</p>
        </body>
        </html>
        """
        return HttpResponse(error_html, content_type='text/html', status=500)
