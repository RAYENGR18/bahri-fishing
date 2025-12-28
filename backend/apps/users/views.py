import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import secrets
import string

# Imports locaux
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UpdateProfileSerializer
from .models import User, PasswordResetCode  # <-- On importe le nouveau modèle ici
from .authentication import generate_tokens, JWTAuthentication

# =================================================================
# 1. INSCRIPTION & CONNEXION
# =================================================================

class RegisterView(APIView):
    """Inscription utilisateur public"""
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
    """Connexion et récupération JWT"""
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # MongoEngine: Syntaxe avec parenthèses sans .filter
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
class GoogleLoginView(APIView):
    """Gère l'inscription ET la connexion via Google"""
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Token manquant"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Vérif Google
            # Remplace par ton CLIENT_ID
            CLIENT_ID = "TON_CLIENT_ID.apps.googleusercontent.com" 
            id_info = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)

            email = id_info['email']
            first_name = id_info.get('given_name', 'Utilisateur')
            last_name = id_info.get('family_name', '')

            # 2. On cherche si l'utilisateur existe déjà
            user = User.objects(email=email).first()

            if user:
                # --- CAS : CONNEXION (L'utilisateur existe déjà) ---
                tokens = generate_tokens(user)
                return Response({
                    "message": "Connexion réussie",
                    "user": UserSerializer(user).data,
                    "tokens": tokens
                }, status=status.HTTP_200_OK)
            
            else:
                # --- CAS : INSCRIPTION (On crée le compte) ---
                
                # On génère un mot de passe complexe aléatoire (car il est requis)
                alphabet = string.ascii_letters + string.digits
                random_password = ''.join(secrets.choice(alphabet) for i in range(20))

                # ATTENTION : On remplit les champs obligatoires de ton modèle
                # avec des valeurs par défaut pour que MongoEngine ne bloque pas.
                new_user = User(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    password=random_password, # Sera haché par set_password
                    
                    # Champs obligatoires que Google ne donne pas :
                    phone="Non renseigné",
                    address="Non renseigné",
                    city="Non renseigné",
                    
                    is_active=True
                )
                
                # Hachage du mot de passe
                new_user.set_password(random_password)
                new_user.save()

                tokens = generate_tokens(new_user)
                return Response({
                    "message": "Inscription Google réussie. Pensez à compléter votre profil !",
                    "user": UserSerializer(new_user).data,
                    "tokens": tokens
                }, status=status.HTTP_201_CREATED)

        except ValueError:
            return Response({"error": "Token Google invalide"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)