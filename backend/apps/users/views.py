import os
import random
import secrets
import string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Imports locaux
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UpdateProfileSerializer
from .models import User, PasswordResetCode
from .authentication import generate_tokens, JWTAuthentication

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
# 2. GOOGLE LOGIN (C'est ici que ça se joue)
# =================================================================

@method_decorator(csrf_exempt, name="dispatch")
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response(
                {"error": "Token Google manquant"},
                status=status.HTTP_400_BAD_REQUEST
            )

        CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
        if not CLIENT_ID:
            return Response(
                {"error": "GOOGLE_CLIENT_ID non configuré"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            id_info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                CLIENT_ID
            )

            email = id_info["email"]
            first_name = id_info.get("given_name", "")
            last_name = id_info.get("family_name", "")

            user = User.objects(email=email).first()

            if not user:
                random_password = secrets.token_urlsafe(16)
                user = User(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    phone="Non renseigné",
                    address="Non renseigné",
                    city="Non renseigné",
                    is_active=True
                )
                user.set_password(random_password)
                user.save()

            tokens = generate_tokens(user)

            return Response({
                "user": UserSerializer(user).data,
                "tokens": tokens
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response(
                {"error": "Token Google invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =================================================================
# 3. GESTION DU PROFIL & PASSWORD (Reste inchangé)
# =================================================================
# ... Garde tes classes ProfileView, ForgotPasswordView, etc. ici ...
# Je ne les recopie pas pour ne pas surcharger, elles étaient correctes.
# =================================================================
# 2. GESTION DU PROFIL
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
    # IMPORTANT : Ajout de l'authentification pour identifier l'utilisateur
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
# 3. MOT DE PASSE OUBLIÉ (NOUVEAU)
# =================================================================

class ForgotPasswordView(APIView):
    """Étape 1 : Générer et envoyer le code par email"""
    def post(self, request):
        email = request.data.get('email')
        
        # Vérif utilisateur (MongoEngine)
        user = User.objects(email=email).first()
        if not user:
            # On renvoie 404 ou 200 selon la politique de sécurité
            return Response({"error": "Aucun utilisateur trouvé"}, status=status.HTTP_404_NOT_FOUND)

        # Générer un code à 6 chiffres
        code = str(random.randint(100000, 999999))

        # Supprimer les anciens codes pour cet utilisateur (Nettoyage)
        PasswordResetCode.objects(user=user).delete()

        # Sauvegarder le nouveau code
        PasswordResetCode(user=user, code=code).save()

        # Envoyer l'email
        try:
            send_mail(
                subject="Réinitialisation mot de passe - Bahri Fishing",
                message=f"Votre code de confirmation est : {code}",
                from_email=getattr(settings, 'EMAIL_HOST_USER', 'noreply@bahrifishing.com'),
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            # En dev, affiche l'erreur. En prod, logguer l'erreur.
            return Response({"error": f"Erreur d'envoi d'email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Code envoyé à votre adresse email"}, status=status.HTTP_200_OK)
class VerifyCodeView(APIView):
    """Vérifie seulement si le code est valide (avant de changer le mot de passe)"""
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({"error": "Email et code requis"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects(email=email).first()
        if not user:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        # Vérification MongoEngine
        reset_entry = PasswordResetCode.objects(user=user, code=code).first()

        if not reset_entry:
            return Response({"error": "Code invalide ou expiré"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Code valide"}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """Étape 2 : Vérifier le code et changer le mot de passe"""
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not email or not code or not new_password:
            return Response({"error": "Email, code et nouveau mot de passe requis"}, status=status.HTTP_400_BAD_REQUEST)

        # Retrouver l'utilisateur
        user = User.objects(email=email).first()
        if not user:
            return Response({"error": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        # Vérifier le code (MongoEngine)
        reset_entry = PasswordResetCode.objects(user=user, code=code).first()

        if not reset_entry:
            return Response({"error": "Code invalide ou expiré"}, status=status.HTTP_400_BAD_REQUEST)

        # Changer le mot de passe (via ta méthode set_password + bcrypt)
        user.set_password(new_password)
        user.save()

        # Supprimer le code utilisé
        reset_entry.delete()

        return Response({"message": "Mot de passe modifié avec succès"}, status=status.HTTP_200_OK)