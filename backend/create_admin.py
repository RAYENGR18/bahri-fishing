import os
import django

# 1. Configuration de l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User

def create_super_admin():
    # Données de l'admin
    EMAIL = "rayengragba18@gmail.com"
    PASSWORD = "RAYstam1502*"  # ⚠️ À changer en prod !
    
    # Vérification si l'admin existe déjà
    if User.objects(email=EMAIL).first():
        print(f"⚠️ L'utilisateur {EMAIL} existe déjà.")
        return

    # Création
    try:
        admin = User(
            email=EMAIL,
            first_name="Super",
            last_name="Admin",
            is_admin=True,          # Le flag important
            is_active=True,
            loyalty_points=1000.00  # Bonus admin
        )
        
        # Hachage du mot de passe (via notre méthode custom)
        admin.set_password(PASSWORD)
        admin.save()
        
        print("✅ ===========================================")
        print(f"✅ Administrateur créé avec succès !")
        print(f"📧 Email    : {EMAIL}")
        print(f"🔑 Password : {PASSWORD}")
        print("✅ ===========================================")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création : {e}")

if __name__ == "__main__":
    create_super_admin()