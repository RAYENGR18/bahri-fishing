import mongoengine as me
from datetime import datetime
from apps.users.models import User
from apps.products.models import Product

class OrderItem(me.EmbeddedDocument):
    product = me.ReferenceField(Product, required=True)
    product_title = me.StringField()
    quantity = me.IntField(default=1)
    price_at_purchase = me.DecimalField(precision=2)

class Order(me.Document):
    STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('VALIDATED', 'Validée'), # C'est à ce statut qu'on crédite les points
        ('SHIPPED', 'Expédiée'),
        ('DELIVERED', 'Livrée'),
        ('CANCELLED', 'Annulée')
    )
    
    # --- Utilisateur ou Invité ---
    # 👇 LA MODIFICATION EST ICI (reverse_delete_rule=me.CASCADE) 👇
    user = me.ReferenceField(User, required=False, reverse_delete_rule=me.CASCADE) 
    
    # Infos Contact & Livraison (Obligatoires pour tous)
    full_name = me.StringField(required=True)
    email = me.EmailField(required=True)
    phone = me.StringField(required=True)
    address = me.StringField(required=True)
    city = me.StringField(required=True)
    
    items = me.ListField(me.EmbeddedDocumentField(OrderItem))
    
    # --- Financier ---
    items_total = me.DecimalField(precision=2, default=0.0) # Total produits
    shipping_cost = me.DecimalField(precision=2, default=7.0) # Frais fixes
    
    loyalty_points_used = me.DecimalField(precision=2, default=0.0) # Points dépensés
    loyalty_discount_amount = me.DecimalField(precision=2, default=0.0) # Réduction obtenue grâce aux points
    
    final_total = me.DecimalField(precision=2, default=0.0) # Ce que le client paie (Total - Points + Livraison)
    
    points_to_earn = me.DecimalField(precision=2, default=0.0) # Les 5% à gagner (en attente)
    
    status = me.StringField(choices=STATUS_CHOICES, default='PENDING')
    created_at = me.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'orders'
    }

    def __str__(self):
        return f"CMD {str(self.id)[-6:]} - {self.full_name}"