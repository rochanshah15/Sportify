#!/usr/bin/env python
"""
Quick script to update box images locally
Run this from the backend/BookMyBox directory
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BookMyBox.settings')
django.setup()

from boxes.models import Box

def update_images():
    # Real cricket and football ground images from Unsplash
    real_image_urls = {
        "Cricket": [
            "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop&auto=format", # Cricket stadium
            "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop&auto=format", # Cricket ground
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format", # Cricket field
        ],
        "Football": [
            "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&auto=format", # Football stadium
            "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop&auto=format", # Football field
            "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop&auto=format", # Football ground
        ],
        "Badminton": [
            "https://images.unsplash.com/photo-1544717684-4b16c0ea8389?w=800&h=600&fit=crop&auto=format",
        ],
        "Basketball": [
            "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop&auto=format",
        ],
        "Tennis": [
            "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop&auto=format",
        ],
        "Volleyball": [
            "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop&auto=format",
        ],
    }
    
    boxes = Box.objects.all()
    updated_count = 0
    
    print("Updating box images...")
    
    for box in boxes:
        sport = box.sport
        if sport in real_image_urls:
            images_list = real_image_urls[sport]
            # Use different images for variety
            new_image_url = images_list[updated_count % len(images_list)]
            box.image = new_image_url
            box.save()
            updated_count += 1
            print(f"✓ Updated {box.name} ({sport}) with real ground image")
        else:
            # Use a default sports facility image
            default_url = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format"
            box.image = default_url
            box.save()
            updated_count += 1
            print(f"✓ Updated {box.name} with default sports facility image")
    
    print(f"\n🎉 Successfully updated {updated_count} boxes with real cricket/football ground URLs!")

if __name__ == '__main__':
    update_images()
