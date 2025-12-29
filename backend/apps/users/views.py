import os
import random
import secrets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Imports locaux
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UpdateProfileSerializer
from .models import User, PasswordResetCode
from .authentication import generate_tokens, JWTAuthentication

@method_decorator(csrf_exempt, name='dispatch')
class GoogleLoginView(APIView):
    """
    Gère l'inscription ET la connexion via Google
    CSRF exempt car Google Identity Services utilise son propre système de sécurité
    """
    permission_classes = [AllowAny]

    def post(self, request):
        # 🔥 CORRECTION : Google envoie 'credential', pas 'token'
        token = request.data.get('credential')
        
        if not token:
            return Response(
                {"error": "Token Google manquant"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Récupération du CLIENT_ID depuis les variables d'environnement
            CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
            
            if not CLIENT_ID:
                return Response(
                    {"error": "Configuration Google OAuth manquante"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Vérification du token Google
            id_info = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                CLIENT_ID
            )

            # Extraction des informations utilisateur
            email = id_info.get('email')
            first_name = id_info.get('given_name', 'Utilisateur')
            last_name = id_info.get('family_name', '')
            
            if not email:
                return Response(
                    {"error": "Email non fourni par Google"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Recherche de l'utilisateur existant
            user = User.objects(email=email).first()

            if user:
                # CAS 1 : CONNEXION (utilisateur existe déjà)
                tokens = generate_tokens(user)
                return Response({
                    "user": UserSerializer(user).data,
                    "tokens": tokens
                }, status=status.HTTP_200_OK)
            
            else:
                # CAS 2 : INSCRIPTION (nouvel utilisateur)
                # Génération d'un mot de passe aléatoire sécurisé
                random_password = secrets.token_urlsafe(16)

                # Création du nouvel utilisateur
                new_user = User(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    phone="Non renseigné",
                    address="Non renseigné",
                    city="Non renseigné",
                    is_active=True
                )
                
                new_user.set_password(random_password)
                new_user.save()

                # Génération des tokens
                tokens = generate_tokens(new_user)
                
                return Response({
                    "user": UserSerializer(new_user).data,
                    "tokens": tokens
                }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            # Token invalide ou expiré
            print(f"❌ Erreur validation token Google : {e}")
            return Response(
                {"error": "Token Google invalide ou expiré"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            # Erreur inattendue
            print(f"❌ Erreur Google Login : {e}")
            return Response(
                {"error": f"Erreur serveur : {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# =================================================================
# 1. INSCRIPTION & CONNEXION CLASSIQUE
# =================================================================

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = generate_tokens(user)
            return Response({
                "message": "Inscription réussie",
                "user": UserSerializer(user).data,
                "tokens": tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            user = User.objects(email=email).first()
            
            if user and user.check_password(password):
                tokens = generate_tokens(user)
                return Response({
                    "user": UserSerializer(user).data,
                    "tokens": tokens
                }, status=status.HTTP_200_OK)
            
            return Response({"error": "Identifiants invalides"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =================================================================
# 3. GESTION DU PROFIL
# =================================================================

class ProfileView(APIView):
    """Profil utilisateur (Protégé)"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ProfileUpdateView(APIView):
    """Mise à jour des infos utilisateur"""
    authentication_classes = [JWTAuthentication] 
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = UpdateProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response({
                "message": "Profil mis à jour",
                "user": UserSerializer(updated_user).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =================================================================
# 4. MOT DE PASSE OUBLIÉ
# =================================================================

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        user = User.objects(email=email).first()
        if not user:
            return Response({"error": "Aucun utilisateur trouvé"}, status=status.HTTP_404_NOT_FOUND)

        code = str(random.randint(100000, 999999))
        PasswordResetCode.objects(user=user).delete()
        PasswordResetCode(user=user, code=code).save()

        try:
            send_mail(
                subject="Réinitialisation mot de passe - Bahri Fishing",
                message=f"Votre code de confirmation est : {code}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"error": f"Erreur d'envoi d'email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Code envoyé à votre adresse email"}, status=status.HTTP_200_OK)


class VerifyCodeView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({"error": "Email et code requis"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects(email=email).first()
        if not user:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        reset_entry = PasswordResetCode.objects(user=user, code=code).first()

        if not reset_entry:
            return Response({"error": "Code invalide ou expiré"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Code valide"}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not email or not code or not new_password:
            return Response({"error": "Email, code et nouveau mot de passe requis"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects(email=email).first()
        if not user:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        reset_entry = PasswordResetCode.objects(user=user, code=code).first()

        if not reset_entry:
            return Response({"error": "Code invalide ou expiré"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        reset_entry.delete()

        return Response({"message": "Mot de passe modifié avec succès"}, status=status.HTTP_200_OK)