from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    ProfileView, 
    ProfileUpdateView, 
    ForgotPasswordView, 
    ResetPasswordView,
    VerifyCodeView   # <--- 1. N'oublie pas d'importer la vue ici !
)

urlpatterns = [
    # Authentification
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    
    # Gestion du profil
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),

    # Réinitialisation de mot de passe
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-code/', VerifyCodeView.as_view(), name='verify-code'), # <--- 2. Ajoute cette ligne indispensable
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]