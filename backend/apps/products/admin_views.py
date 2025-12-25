import os
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser 
from django.core.files.storage import default_storage

from .models import Product, Category
from .serializers import ProductSerializer

# ---------------------------------------------------------
# VUE 1 : LISTE ET CRÉATION DE PRODUITS
# ---------------------------------------------------------
class AdminProductListCreateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        """Liste tous les produits"""
        products = Product.objects.all()
        # Le context={'request': request} est crucial pour que le Serializer
        # génère l'URL complète (http://.../media/...) ou l'URL Cloudinary
        serializer = ProductSerializer(
            products, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)

    def post(self, request):
        """Crée un nouveau produit"""
        print("--- CRÉATION PRODUIT (Compatible Cloudinary) ---")
        data = request.data
        
        try:
            # 1. Validation catégorie
            category_id = data.get('category')
            if not category_id:
                return Response({"error": "Catégorie requise"}, status=400)
            
            category = Category.objects(id=category_id).first()
            if not category:
                return Response({"error": "Catégorie invalide"}, status=400)

            # 2. Traitement de l'image
            path_to_store = ""
            
            if 'image' in request.FILES:
                try:
                    file = request.FILES['image']
                    
                    # a. Gestion de l'extension
                    ext = os.path.splitext(file.name)[1].lower()
                    if not ext:
                        ext = '.jpg'
                    
                    # b. Génération nom unique (UUID)
                    # Cela évite les conflits de noms sur Cloudinary
                    unique_name = f"{uuid.uuid4().hex}{ext}"
                    target_path = f"products/{unique_name}"
                    
                    # c. SAUVEGARDE VIA DEFAULT_STORAGE
                    # Si settings.DEFAULT_FILE_STORAGE est Cloudinary, ça part dans le cloud.
                    # Si c'est local, ça part sur le disque.
                    saved_path = default_storage.save(target_path, file)
                    
                    # d. Nettoyage du chemin
                    # On normalise les slashs pour la BDD
                    path_to_store = saved_path.replace('\\', '/')
                    
                    # Hack pour le Local : si Django renvoie "media/products/...", on nettoie.
                    # Cloudinary renvoie généralement juste "products/...", donc cette condition sera fausse et ignorée (ce qui est bien).
                    if path_to_store.startswith('media/'):
                        path_to_store = path_to_store.replace('media/', '', 1)

                    print(f"✅ Image sauvegardée sous : {path_to_store}")
                    
                except Exception as img_error:
                    print(f"❌ Erreur sauvegarde image : {img_error}")
                    return Response({"error": "Erreur lors de l'upload de l'image"}, status=400)

            # 3. Création du produit
            product = Product(
                title=data.get('title'),
                description=data.get('description', ''),
                price=float(data.get('price')),
                stock=int(data.get('stock', 0)),
                category=category,
                image=path_to_store, # On stocke le chemin relatif
                is_active=True # Par défaut actif
            )
            # Gestion explicite de is_active si envoyé
            if 'is_active' in data:
                 product.is_active = data['is_active'] in ['true', 'True', True, '1']

            product.save()
            
            # 4. Retour
            serializer = ProductSerializer(product, context={'request': request})
            return Response(serializer.data, status=201)
            
        except Exception as e:
            print(f"❌ Erreur création : {e}")
            return Response({"error": str(e)}, status=400)


# ---------------------------------------------------------
# VUE 2 : DÉTAIL, MODIFICATION, SUPPRESSION
# ---------------------------------------------------------
class AdminProductDetailView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = (MultiPartParser, FormParser)

    def put(self, request, product_id):
        """Modifie un produit"""
        print(f"--- MODIFICATION PRODUIT : {product_id} ---")
        
        product = Product.objects(id=product_id).first()
        if not product:
            return Response({"error": "Produit introuvable"}, status=404)
        
        data = request.data
        
        try:
            # 1. Mise à jour Image
            if 'image' in request.FILES:
                file = request.FILES['image']
                
                ext = os.path.splitext(file.name)[1].lower()
                if not ext: ext = '.jpg'
                
                unique_name = f"{uuid.uuid4().hex}{ext}"
                target_path = f"products/{unique_name}"
                
                # Sauvegarde (Cloudinary ou Local)
                saved_path = default_storage.save(target_path, file)
                
                # Nettoyage
                clean_path = saved_path.replace('\\', '/')
                if clean_path.startswith('media/'):
                     clean_path = clean_path.replace('media/', '', 1)
                
                product.image = clean_path
            
            # 2. Mise à jour des champs texte
            if 'title' in data: product.title = data['title']
            if 'description' in data: product.description = data['description']
            if 'price' in data: product.price = float(data['price'])
            if 'stock' in data: product.stock = int(data['stock'])
            
            if 'is_active' in data:
                product.is_active = data['is_active'] in ['true', 'True', True, '1']
            
            # 3. Catégorie
            if 'category' in data:
                cat_id = data['category']
                if cat_id:
                    cat = Category.objects(id=cat_id).first()
                    if cat: product.category = cat
            
            product.save()
            
            serializer = ProductSerializer(product, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            print(f"❌ Erreur modification : {e}")
            return Response({"error": str(e)}, status=400)

    def delete(self, request, product_id):
        """Supprime un produit"""
        product = Product.objects(id=product_id).first()
        if not product:
            return Response({"error": "Produit introuvable"}, status=404)
        
        try:
            # Note : On ne supprime pas forcément l'image de Cloudinary ici
            # pour éviter de supprimer une image utilisée ailleurs,
            # mais on supprime l'entrée en BDD.
            product.delete()
            return Response({"message": "Produit supprimé"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)