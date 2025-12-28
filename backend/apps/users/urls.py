from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    ProfileView, 
    ProfileUpdateView, 
    ForgotPasswordView, # <-- Nouvelle vue importée
    ResetPasswordView   # <-- Nouvelle vue importée
)

urlpatterns = [
    # Authentification
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    
    # Gestion du profil
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),

    # Réinitialisation de mot de passe (Nouveau)
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]