from rest_framework import serializers
from .models import Order
from django.conf import settings
from django.core.files.storage import default_storage

class OrderItemInputSerializer(serializers.Serializer):
    """Format attendu depuis le React pour la création"""
    product_id = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)

class OrderSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    total_amount = serializers.DecimalField(source='final_total', max_digits=10, decimal_places=2)
    client_name = serializers.CharField(source='full_name', default="Invité")
    status = serializers.CharField()
    created_at = serializers.DateTimeField()
    
    # Infos Contact
    email = serializers.EmailField(default="")
    phone = serializers.CharField(default="")
    address = serializers.CharField(default="")
    city = serializers.CharField(default="")
    
    # 👇 LE CHANGEMENT EST ICI : On envoie la liste complète 👇
    items = serializers.SerializerMethodField()

    def get_items(self, obj):
        details = []
        try:
            # On vérifie si la commande a des items
            items_list = getattr(obj, 'items', [])
            
            for item in items_list:
                product = item.product 
                
                # --- INITIALISATION DES VARIABLES ---
                title = "Produit Inconnu"
                unit_price = 0.0
                img_url = None
                
                if product:
                    title = product.title
                    # 👇 LA CORRECTION EST ICI 👇
                    # On prend le prix du PRODUIT, car l'item ne l'a pas stocké
                    unit_price = float(product.price) if product.price else 0.0
                    
                    # Gestion Image
                    if product.image:
                        try:
                            if str(product.image).startswith('http'):
                                img_url = str(product.image)
                            else:
                                img_url = default_storage.url(str(product.image))
                        except:
                            img_url = f"{settings.MEDIA_URL}{product.image}"

                # Calcul du total pour cette ligne
                total_line = unit_price * item.quantity

                details.append({
                    "title": title,
                    "quantity": item.quantity,
                    "price": unit_price,    # Prix unitaire
                    "total": total_line,    # Total ligne
                    "image": img_url
                })
                
        except Exception as e:
            print(f"❌ Erreur lecture items: {e}")
            
        return details