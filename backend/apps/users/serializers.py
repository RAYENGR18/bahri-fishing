from rest_framework import serializers
from .models import User

class UserSerializer(serializers.Serializer):
    """Pour l'affichage du profil et la pré-commande"""
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone = serializers.CharField()      # <-- Ajout
    address = serializers.CharField()    # <-- Ajout
    city = serializers.CharField()       # <-- Ajout
    loyalty_points = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_admin = serializers.BooleanField(read_only=True)

class RegisterSerializer(serializers.Serializer):
    """Inscription complète"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone = serializers.CharField()      # <-- Ajout
    address = serializers.CharField()    # <-- Ajout
    city = serializers.CharField()       # <-- Ajout

    def validate_email(self, value):
        if User.objects(email=value).first():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data['phone'],       # <-- Ajout
            address=validated_data['address'],   # <-- Ajout
            city=validated_data['city']          # <-- Ajout
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UpdateProfileSerializer(serializers.Serializer):
    """Mise à jour du profil (sans password pour l'instant)"""
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    address = serializers.CharField(required=False)
    city = serializers.CharField(required=False)

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.address = validated_data.get('address', instance.address)
        instance.city = validated_data.get('city', instance.city)
        instance.save()
        return instance
    
# Gardez LoginSerializer inchangé
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)