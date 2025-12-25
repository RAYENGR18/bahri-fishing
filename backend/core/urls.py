# backend/core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Import depuis le fichier que nous venons de créer juste à côté
from .admin_view import AdminDashboardStats, AdminDeleteOrder, AdminOrderListView, AdminUpdateOrderStatus

urlpatterns = [
    # Auth & Users
    path('api/users/', include('apps.users.urls')),
    
    # Produits
    path('api/products/', include('apps.products.urls')),
    
    # Commandes
    path('api/orders/', include('apps.orders.urls')),
    path('api/admin/orders/<str:order_id>/delete/', AdminDeleteOrder.as_view()),
    # --- ADMIN DASHBOARD ---
    path('api/admin/stats/', AdminDashboardStats.as_view()),
    path('api/admin/orders/', AdminOrderListView.as_view()),
    path('api/admin/orders/<str:order_id>/update/', AdminUpdateOrderStatus.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)