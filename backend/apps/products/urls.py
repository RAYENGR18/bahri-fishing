from django.urls import path

# 1. Imports des vues PUBLIQUES (views.py)
# Note : On a retiré ProductCreateView car c'est une action admin maintenant
from .views import ProductListView, ProductDetailView, CategoryListView

# 2. Imports des vues ADMIN (admin_views.py)
from .admin_views import AdminProductListCreateView, AdminProductDetailView

urlpatterns = [
    # ============================================
    # ROUTES ADMIN (Accessibles via le Dashboard)
    # ============================================
    
    # Création de produit (POST) - C'est ici que votre formulaire React envoie les données
    path('create/', AdminProductListCreateView.as_view(), name='product-create'),

    # Liste complète pour l'admin (GET) - Affiche aussi les produits inactifs
    path('admin/all/', AdminProductListCreateView.as_view(), name='admin-product-list'),

    # Modification (PUT) et Suppression (DELETE) par ID
    path('admin/<str:product_id>/', AdminProductDetailView.as_view(), name='admin-product-detail'),


    # ============================================
    # ROUTES PUBLIQUES (Accessibles aux Clients)
    # ============================================

    # Liste publique (filtre uniquement les produits actifs)
    path('', ProductListView.as_view(), name='product-list'),
    
    # Liste des catégories pour le menu
    path('categories/', CategoryListView.as_view(), name='category-list'),
    
    # Détail produit (Slug) - À METTRE TOUJOURS EN DERNIER
    # car <slug:slug> peut "manger" les autres URLs si placé avant
    path('<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
]


