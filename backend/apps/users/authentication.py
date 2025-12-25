import jwt
import time
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import User

class JWTAuthentication(authentication.BaseAuthentication):
    """
    Authentification middleware pour DRF.
    Vérifie le header 'Authorization: Bearer <token>'
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None # Pas de token, on laisse passer (pour les routes publiques)

        try:
            # Format attendu : "Bearer <token>"
            prefix, token = auth_header.split(' ')
            if prefix != 'Bearer':
                raise exceptions.AuthenticationFailed('Token prefix must be Bearer')
            
            # Décodage du token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Vérification de l'expiration
            if payload['exp'] < time.time():
                raise exceptions.AuthenticationFailed('Token expired')

            # Récupération de l'utilisateur MongoEngine
            user = User.objects(id=payload['user_id']).first()
            if not user:
                raise exceptions.AuthenticationFailed('User not found')

            if not user.is_active:
                raise exceptions.AuthenticationFailed('User is inactive')

            return (user, token)

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.DecodeError:
            raise exceptions.AuthenticationFailed('Error decoding token')
        except ValueError:
            raise exceptions.AuthenticationFailed('Invalid token header')
        except Exception as e:
            raise exceptions.AuthenticationFailed(str(e))

# Utilitaires pour générer les tokens
def generate_tokens(user):
    """Génère une paire Access + Refresh Token"""
    now = time.time()
    
    # Access Token (courte durée : ex 1 heure)
    access_payload = {
        'user_id': str(user.id),
        'email': user.email,
        'is_admin': user.is_admin,
        'exp': now + 3600, # 1 heure
        'iat': now,
        'type': 'access'
    }
    
    # Refresh Token (longue durée : ex 7 jours)
    refresh_payload = {
        'user_id': str(user.id),
        'exp': now + (7 * 24 * 3600),
        'iat': now,
        'type': 'refresh'
    }
    
    return {
        'access': jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256'),
        'refresh': jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')
    }