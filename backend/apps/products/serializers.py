# backend/apps/products/serializers.py

from rest_framework import serializers
from django.conf import settings
# 👇 IMPORT INDISPENSABLE POUR CLOUDINARY 👇
from django.core.files.storage import default_storage 

class CategorySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.StringRelatedField()
    slug = serializers.CharField()

class ProductSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    slug = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    description = serializers.CharField()
    
    # Stock (Indispensable pour le frontend)
    stock = serializers.IntegerField(default=0)

    category = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    def get_category(self, obj):
        if obj.category:
            return {
                "id": str(obj.category.id),
                "name": obj.category.name,
                "slug": obj.category.slug
            }
        return None

    def get_image(self, obj):
        request = self.context.get('request')
        
        # On récupère le chemin de l'image (ex: "products/mon_image.jpg")
        img_field = getattr(obj, 'image', None) or getattr(obj, 'image_path', None)
        
        if not img_field:
            return None
            
        image_path = str(img_field)

        # 1. Si c'est déjà une URL complète (ex: anciennes images migrées), on renvoie direct
        if image_path.startswith('http'):
            return image_path

        # 2. LA MAGIE CLOUDINARY / LOCAL
        # default_storage.url() va demander au système de stockage actuel (Disque ou Cloud)
        # quelle est la vraie URL publique du fichier.
        try:
            url = default_storage.url(image_path)
        except Exception:
            # Fallback de sécurité si le storage échoue
            url = f"{settings.MEDIA_URL}{image_path}"

        # 3. Pour le Local uniquement :
        # default_storage renvoie souvent juste "/media/..." en local.
        # On ajoute "http://localhost:8000" devant pour que React soit content.
        if request and not url.startswith('http'):
            return request.build_absolute_uri(url)

        return url