from django.core.management.base import BaseCommand
from boxes.models import Box

class Command(BaseCommand):
    help = 'Update box images with real cricket and football ground URLs'

    def handle(self, *args, **options):
        # Real cricket and football ground images from Unsplash (free to use)
        real_image_urls = {
            "Cricket": [
                "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop&auto=format", # Cricket stadium
                "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop&auto=format", # Cricket ground
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format", # Cricket field
                "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&h=600&fit=crop&auto=format", # Cricket pitch
            ],
            "Football": [
                "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&auto=format", # Football stadium
                "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop&auto=format", # Football field
                "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop&auto=format", # Football ground
                "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800&h=600&fit=crop&auto=format", # Soccer field
            ],
            "Futsal": [
                "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop&auto=format", # Indoor football
                "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&auto=format", # Futsal court
            ],
            "Badminton": [
                "https://images.unsplash.com/photo-1544717684-4b16c0ea8389?w=800&h=600&fit=crop&auto=format", # Badminton court
            ],
            "Basketball": [
                "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop&auto=format", # Basketball court
                "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&h=600&fit=crop&auto=format", # Basketball stadium
            ],
            "Tennis": [
                "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop&auto=format", # Tennis court
            ],
            "Volleyball": [
                "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop&auto=format", # Volleyball court
            ],
            "Table Tennis": [
                "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&h=600&fit=crop&auto=format", # Table tennis
            ],
            "Skating": [
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format", # Skating rink
            ],
            "Cycling": [
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format", # Cycling track
            ],
            "Climbing": [
                "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop&auto=format", # Climbing wall
            ],
            "Padel": [
                "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop&auto=format", # Padel court
            ],
            "Watersports": [
                "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format", # Watersports
            ],
            "Yoga": [
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format", # Yoga studio
            ],
            "Squash": [
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format", # Squash court
            ],
            "Mixed Sports": [
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format", # Multi-sport facility
            ]
        }
        
        boxes = Box.objects.all()
        updated_count = 0
        
        for box in boxes:
            # Get the appropriate image URL based on the sport
            sport = box.sport
            if sport in real_image_urls:
                images_list = real_image_urls[sport]
                # Use the first image as main image, rotate through available images
                new_image_url = images_list[updated_count % len(images_list)]
                box.image_url = new_image_url
                box.save()
                updated_count += 1
                self.stdout.write(f"Updated {box.name} ({sport}) with real ground image")
            else:
                # Use a default sports facility image
                default_url = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format"
                box.image_url = default_url
                box.save()
                updated_count += 1
                self.stdout.write(f"Updated {box.name} with default sports facility image")
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} boxes with real cricket/football ground URLs')
        )
