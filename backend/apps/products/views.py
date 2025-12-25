from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer

class CategoryListView(APIView):
    """(Public) Liste les catégories pour le menu"""
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

class ProductListView(APIView):
    """(Public) Liste les produits avec filtres"""
    permission_classes = [AllowAny]

    def get(self, request):
        category_slug = request.query_params.get('category')
        search_query = request.query_params.get('search')
        
        # On affiche uniquement les produits actifs aux clients
        products = Product.objects(is_active=True)

        if category_slug:
            cat = Category.objects(slug=category_slug).first()
            if not cat:
                return Response([], status=status.HTTP_200_OK)
            products = products.filter(category=cat)

        if search_query:
            products = products.filter(title__icontains=search_query)

        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

class ProductDetailView(APIView):
    """(Public) Détail d'un produit via slug"""
    permission_classes = [AllowAny]

    def get(self, request, slug):
        product = Product.objects(slug=slug, is_active=True).first()
        if not product:
            return Response({"error": "Produit non trouvé"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)