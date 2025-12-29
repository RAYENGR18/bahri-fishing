from rest_framework import serializers
from .models import User, PointsHistory

# =================================================================
# 1. SERIALIZERS PUBLICS (PROFIL & LOGIN)
# =================================================================

class UserSerializer(serializers.Serializer):
    """Pour l'affichage du profil utilisateur"""
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    
    # --- Modifié : IntField au lieu de DecimalField ---
    points = serializers.IntegerField(read_only=True) 
    
    # --- Nouveaux champs Google ---
    avatar = serializers.CharField(required=False, allow_blank=True)
    google_id = serializers.CharField(required=False, read_only=True)
    
    # --- Champs contact (Peuvent être vides si compte Google récent) ---
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    zip_code = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    
    is_admin = serializers.BooleanField(read_only=True)


class LoginSerializer(serializers.Serializer):
    """Connexion simple email/password"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


# =================================================================
# 2. SERIALIZERS D'INSCRIPTION & UPDATE
# =================================================================

class RegisterSerializer(serializers.Serializer):
    """Inscription complète par Email"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    
    # On garde ces champs requis pour une inscription classique par email
    phone = serializers.CharField()
    address = serializers.CharField()
    city = serializers.CharField()

    def validate_email(self, value):
        if User.objects(email=value).first():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def save(self):
        # Création de l'objet User
        user = User(
            email=self.validated_data['email'],
            first_name=self.validated_data['first_name'],
            last_name=self.validated_data['last_name'],
            phone=self.validated_data['phone'],
            address=self.validated_data['address'],
            city=self.validated_data['city'],
            auth_provider='email', # On précise l'origine
            points=0 # Démarre à 0
        )
        # Hachage du mot de passe
        user.set_password(self.validated_data['password'])
        user.save()
        return user


class UpdateProfileSerializer(serializers.Serializer):
    """Mise à jour du profil"""
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    address = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    zip_code = serializers.CharField(required=False)

    def update(self, instance, validated_data):
        # On met à jour chaque champ s'il est présent dans la requête
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.address = validated_data.get('address', instance.address)
        instance.city = validated_data.get('city', instance.city)
        instance.zip_code = validated_data.get('zip_code', instance.zip_code)
        
        instance.save()
        return instance


# =================================================================
# 3. SERIALIZERS ADMIN (POUR TON DASHBOARD) - NOUVEAU 🚨
# =================================================================

class PointsHistorySerializer(serializers.Serializer):
    """Pour afficher l'historique des points dans le tableau admin"""
    action = serializers.CharField()
    amount = serializers.IntegerField()
    reason = serializers.CharField()
    created_at = serializers.DateTimeField()
    admin_name = serializers.SerializerMethodField()

    def get_admin_name(self, obj):
        # Si un admin a fait l'action, on affiche son prénom, sinon "Système"
        return obj.admin.first_name if obj.admin else "Système"


class AdminUserSerializer(serializers.Serializer):
    """Vue simplifiée pour la liste des utilisateurs dans le Dashboard"""
    id = serializers.CharField(source="id")
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    points = serializers.IntegerField() # Le nouveau champ Int
    is_admin = serializers.BooleanField()
    date_joined = serializers.DateTimeField()