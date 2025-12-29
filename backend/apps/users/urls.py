from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    ProfileView, 
    ProfileUpdateView, 
    ForgotPasswordView, 
    ResetPasswordView,
    VerifyCodeView,
    GoogleLoginView,
    # 👇 NOUVEAUX IMPORTS POUR L'ADMIN 👇
    AdminUserListView,
    AdminUserDetailView
)

urlpatterns = [
    # ====================================================
    # 🔐 AUTHENTIFICATION & SÉCURITÉ
    # ====================================================
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),

    # ====================================================
    # 👤 GESTION DU PROFIL
    # ====================================================
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),

    # ====================================================
    # 🔑 MOT DE PASSE OUBLIÉ
    # ====================================================
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-code/', VerifyCodeView.as_view(), name='verify-code'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # ====================================================
    # 👑 ADMINISTRATION (DASHBOARD) - NOUVEAU
    # ====================================================
    # Liste tous les utilisateurs (pour le tableau admin)
    path('admin/users/', AdminUserListView.as_view(), name='admin-users-list'),
    
    # Détails, Historique et Modification des points d'un utilisateur précis
    path('admin/users/<str:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]