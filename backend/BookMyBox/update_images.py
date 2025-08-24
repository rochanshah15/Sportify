# Script to update box data with real image URLs

# Real sports facility images from Unsplash (free to use)
real_image_urls = {
    "Cricket": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop",
    "Football": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop", 
    "Badminton": "https://images.unsplash.com/photo-1544717684-4b16c0ea8389?w=800&h=600&fit=crop",
    "Basketball": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
    "Tennis": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop",
    "Squash": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    "Volleyball": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop",
    "Table Tennis": "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&h=600&fit=crop",
    "Skating": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    "Cycling": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    "Climbing": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop",
    "Padel": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
    "Futsal": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
    "Watersports": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    "Yoga": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    "Archery": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    "Skateboarding": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    "Mixed Sports": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"
}

# Alternative images for variety
alternative_images = {
    "Cricket": [
        "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
    ],
    "Football": [
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop"
    ],
    "Basketball": [
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&h=600&fit=crop"
    ]
}

def get_image_url_for_sport(sport):
    """Get a real image URL for a sport"""
    return real_image_urls.get(sport, "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop")

def get_additional_images(sport, count=2):
    """Get additional images for a sport"""
    base_images = alternative_images.get(sport, [real_image_urls.get(sport, "")])
    return base_images[:count]

print("Real image URLs ready for updating the database!")
