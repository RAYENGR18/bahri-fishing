import os
import django

# 1. Configuration de l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User

def create_or_update_admin():
    # Données de l'admin
    EMAIL = "rayengragba18@gmail.com"
    PASSWORD = "RAYstam1502*" 
    
    print(f"🔄 Traitement de l'utilisateur : {EMAIL}...")

    # 2. On cherche si l'utilisateur existe déjà
    user = User.objects(email=EMAIL).first()

    if user:
        # --- CAS 1 : MISE À JOUR (Ton compte Google existant) ---
        print(f"⚠️ L'utilisateur existe déjà. Mise à jour des droits Admin...")
        
        user.is_admin = True
        user.first_name = user.first_name or "Super"
        user.last_name = user.last_name or "Admin"
        
        # On lui donne 1000 points si c'est pas déjà fait
        if user.points < 1000:
            user.points = 1000
            
        # On définit le mot de passe (pour que tu puisses te connecter sans Google aussi)
        user.set_password(PASSWORD)
        
        # On met à jour le provider pour dire qu'il a maintenant les deux accès
        if user.auth_provider == 'google':
            user.auth_provider = 'email_and_google'
            
        user.save()
        print("✅ Compte existant promu Administrateur avec succès !")

    else:
        # --- CAS 2 : CRÉATION (Nouveau compte) ---
        print(f"✨ Création d'un nouvel Administrateur...")
        
        try:
            user = User(
                email=EMAIL,
                first_name="Super",
                last_name="Admin",
                is_admin=True,      # Le flag important
                is_active=True,
                points=1000,        # Attention: c'est 'points' (Int), pas loyalty_points
                auth_provider='email'
            )
            
            user.set_password(PASSWORD)
            user.save()
            print("✅ Nouvel Administrateur créé avec succès !")
            
        except Exception as e:
            print(f"❌ Erreur lors de la création : {e}")
            return

    # Résumé
    print("✅ ===========================================")
    print(f"📧 Email    : {EMAIL}")
    print(f"🔑 Password : {PASSWORD}")
    print(f"👑 Rôle     : ADMIN (is_admin=True)")
    print("✅ ===========================================")

if __name__ == "__main__":
    create_or_update_admin()