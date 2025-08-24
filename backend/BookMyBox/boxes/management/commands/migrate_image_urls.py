from django.core.management.base import BaseCommand
from boxes.models import Box

class Command(BaseCommand):
    help = 'Migrate external image URLs from image field to image_url field'

    def handle(self, *args, **options):
        boxes = Box.objects.all()
        updated_count = 0
        
        for box in boxes:
            if box.image:
                image_str = str(box.image)
                # If the image field contains a URL, move it to image_url
                if image_str.startswith('http'):
                    box.image_url = image_str
                    box.image = None  # Clear the image field
                    box.save()
                    updated_count += 1
                    self.stdout.write(f"Migrated URL for {box.name}: {image_str}")
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully migrated {updated_count} image URLs')
        )
