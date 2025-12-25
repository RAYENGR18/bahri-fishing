import mongoengine as me
from datetime import datetime
# 👇 1. IMPORT NÉCESSAIRE pour transformer "Canne à pêche" en "canne-a-peche"
from django.utils.text import slugify 

class Category(me.Document):
    name = me.StringField(required=True, unique=True)
    slug = me.StringField(required=True, unique=True)
    
    def __str__(self):
        return self.name

class Product(me.Document):
    title = me.StringField(required=True)
    
    # 👇 2. CHANGEMENT ICI : On met required=False 
    # car on va le remplir nous-même automatiquement.
    slug = me.StringField(required=False, unique=True)
    
    # Stockage sous forme décimale pour la précision monétaire
    price = me.DecimalField(required=True, precision=2)
    
    stock = me.IntField(default=0)
    
    description = me.StringField()
    
    # Référence vers la Catégorie
    category = me.ReferenceField(Category, reverse_delete_rule=me.NULLIFY)
    
    # GESTION IMAGES
    image_path = me.StringField() # Pour les anciens produits
    image = me.StringField()      # Pour les nouveaux produits (Cloudinary)
    
    # Pour le suivi
    source_url = me.StringField()
    is_active = me.BooleanField(default=True)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'indexes': ['slug', 'category', 'price']
    }

    def __str__(self):
        return self.title

    # 👇 3. AJOUT DE LA MÉTHODE SAVE AUTOMATIQUE
    def save(self, *args, **kwargs):
        # Si le slug n'existe pas encore, on le crée à partir du titre
        if not self.slug:
            self.slug = slugify(self.title)
        
        # On appelle la méthode de sauvegarde normale de MongoEngine
        return super(Product, self).save(*args, **kwargs)