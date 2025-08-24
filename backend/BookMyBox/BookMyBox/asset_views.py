from django.http import HttpResponse, Http404
from django.conf import settings
import os
import mimetypes

def serve_asset(request, path):
    """
    Custom view to serve React assets with proper MIME types
    """
    asset_path = os.path.join(settings.BASE_DIR, 'static', 'assets', path)
    
    if not os.path.exists(asset_path):
        raise Http404(f"Asset not found: {path}")
    
    # Get the MIME type
    content_type, _ = mimetypes.guess_type(asset_path)
    if content_type is None:
        if path.endswith('.js'):
            content_type = 'application/javascript'
        elif path.endswith('.css'):
            content_type = 'text/css'
        else:
            content_type = 'application/octet-stream'
    
    try:
        with open(asset_path, 'rb') as f:
            content = f.read()
        return HttpResponse(content, content_type=content_type)
    except Exception as e:
        raise Http404(f"Error reading asset: {e}")

def debug_assets(request):
    """
    Debug view to check asset files
    """
    assets_dir = os.path.join(settings.BASE_DIR, 'static', 'assets')
    
    html = "<h1>Asset Debug</h1>"
    html += f"<p>Assets directory: {assets_dir}</p>"
    html += f"<p>Directory exists: {os.path.exists(assets_dir)}</p>"
    
    if os.path.exists(assets_dir):
        html += "<h2>Files in assets directory:</h2><ul>"
        for file in os.listdir(assets_dir):
            file_path = os.path.join(assets_dir, file)
            file_size = os.path.getsize(file_path)
            html += f"<li>{file} ({file_size} bytes)</li>"
        html += "</ul>"
    
    return HttpResponse(html)
