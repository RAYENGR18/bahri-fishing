import os
import random
import secrets
import datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests 

# Imports locaux
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, 
    UpdateProfileSerializer, AdminUserSerializer, PointsHistorySerializer
)
from .models import User, PasswordResetCode, PointsHistory
from .authentication import generate_tokens, JWTAuthentication


# =================================================================
# 1. GOOGLE LOGIN (Mise à jour pour Avatar & Google ID)
# =================================================================

@method_decorator(csrf_exempt, name='dispatch')
class GoogleLoginView(APIView):
    """
    Gère l'inscription ET la connexion via Google avec FUSION DE COMPTES.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('credential')
        if not token:
            return Response({"error": "Token Google manquant"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Vérifier le token Google
            CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
            id_info = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)

            # 2. Extraire les infos
            email = id_info.get('email')
            google_id = id_info.get('sub')
            avatar = id_info.get('picture', '')
            first_name = id_info.get('given_name', 'Utilisateur')
            last_name = id_info.get('family_name', '')
            
            # 3. RECHERCHE INTELLIGENTE
            user = User.objects(email=email).first()

            if user:
                # --- SCÉNARIO FUSION ---
                print(f"🔄 Fusion de compte pour : {email}")
                updated = False
                
                if not user.google_id:
                    user.google_id = google_id
                    if user.auth_provider == 'email':
                        user.auth_provider = 'email_and_google' 
                    updated = True
                
                if not user.avatar:
                    user.avatar = avatar
                    updated = True
                
                if updated:
                    user.save()

                tokens = generate_tokens(user)
                return Response({
                    "message": "Connexion réussie (Comptes liés)",
                    "user": UserSerializer(user).data,
                    "tokens": tokens
                }, status=status.HTTP_200_OK)
            
            else:
                # --- SCÉNARIO INSCRIPTION ---
                print(f"✨ Création nouveau compte Google pour : {email}")
                random_password = secrets.token_urlsafe(16)

                new_user = User(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    google_id=google_id,
                    avatar=avatar,
                    auth_provider="google",
                    points=0,
                    is_active=True
                )
                
                new_user.set_password(random_password)
                new_user.save()

                tokens = generate_tokens(new_user)
                return Response({
                    "message": "Inscription Google réussie",
                    "user": UserSerializer(new_user).data,
                    "tokens": tokens
                }, status=status.HTTP_201_CREATED)

        except ValueError:
            return Response({"error": "Token Google invalide"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Erreur Login: {str(e)}")
            return Response({"error": "Erreur serveur lors de la connexion"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =================================================================
# 2. ADMINISTRATION (POUR TON DASHBOARD)
# =================================================================

class AdminUserListView(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        if User.objects(email=data.get('email')).first():
            return Response({"error": "Cet email existe déjà"}, status=400)

        try:
            user = User(
                email=data['email'],
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                phone=data.get('phone', ''),
                address=data.get('address', ''),
                city=data.get('city', ''),
                points=int(data.get('points', 0)),
                auth_provider='email',
                is_active=True
            )
            if not data.get('password'):
                return Response({"error": "Mot de passe requis"}, status=400)
                
            user.set_password(data['password'])
            user.save()
            
            return Response({"message": "Utilisateur créé avec succès"}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class AdminUserDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"error": "Utilisateur introuvable"}, status=404)
        
        history = PointsHistory.objects(user=user).order_by('-created_at')
        serializer = PointsHistorySerializer(history, many=True)
        return Response(serializer.data)

    def patch(self, request, user_id):
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"error": "Utilisateur introuvable"}, status=404)

        try:
            new_points = int(request.data.get('points'))
            reason = request.data.get('reason', 'Modification Admin')
            
            old_points = user.points
            diff = new_points - old_points
            
            if diff == 0:
                return Response({"message": "Aucun changement de points détecté"}, status=200)

            user.points = new_points
            user.save()

            PointsHistory(
                user=user,
                action="Correction Admin",
                amount=diff,
                reason=reason
            ).save()

            return Response({
                "message": "Points mis à jour avec succès", 
                "points": user.points
            })

        except ValueError:
            return Response({"error": "La valeur des points doit être un nombre entier"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# =================================================================
# 3. AUTHENTIFICATION CLASSIQUE (Email/Password)
# =================================================================

# 👇👇👇 ICI, J'AI AJOUTÉ LE DÉCORATEUR IMPORTANT 👇👇👇
@method_decorator(csrf_exempt, name='dispatch') 
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

# 👇👇👇 ET SURTOUT ICI POUR LE LOGIN 👇👇👇
@method_decorator(csrf_exempt, name='dispatch')
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
# 4. GESTION DU PROFIL
# =================================================================

class ProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ProfileUpdateView(APIView):
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
# 5. MOT DE PASSE OUBLIÉ
# =================================================================

@method_decorator(csrf_exempt, name='dispatch') # Ajouté aussi ici par sécurité
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
                from_email=getattr(settings, 'EMAIL_HOST_USER', 'noreply@bahrifishing.com'),
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"error": f"Erreur d'envoi d'email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Code envoyé à votre adresse email"}, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
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

@method_decorator(csrf_exempt, name='dispatch')
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not email or not code or not new_password:
            return Response({"error": "Données incomplètes"}, status=status.HTTP_400_BAD_REQUEST)

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