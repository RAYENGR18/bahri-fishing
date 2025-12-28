import mongoengine as me
import bcrypt
from datetime import datetime

class User(me.Document):
    email = me.EmailField(required=True, unique=True)
    first_name = me.StringField(required=True)
    last_name = me.StringField(required=True)
    password = me.StringField(required=True)
    
    # --- Vos champs existants ---
    phone = me.StringField(required=True)
    address = me.StringField(required=True)
    city = me.StringField(required=True)
    
    is_admin = me.BooleanField(default=False)
    is_active = me.BooleanField(default=True)
    loyalty_points = me.DecimalField(default=0.0, precision=2)
    created_at = me.DateTimeField(default=datetime.utcnow)

    # =================================================================
    # 👇 AJOUTEZ CES 3 PROPRIÉTÉS OBLIGATOIRES POUR LA SÉCURITÉ 👇
    # =================================================================
    
    @property
    def is_staff(self):
        """Django vérifie 'is_staff' pour la permission IsAdminUser."""
        return self.is_admin

    @property
    def is_authenticated(self):
        """Indique que l'utilisateur est connecté."""
        return True

    @property
    def is_anonymous(self):
        """Indique que ce n'est pas un visiteur anonyme."""
        return False
    # =================================================================

    def set_password(self, raw_password):
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(raw_password.encode('utf-8'), salt)
        self.password = hashed.decode('utf-8')

    def check_password(self, raw_password):
        return bcrypt.checkpw(raw_password.encode('utf-8'), self.password.encode('utf-8'))

    def __str__(self):
        return self.email
class PasswordResetCode(me.Document):
    # ReferenceField fait le lien avec ton modèle User
    user = me.ReferenceField(User, required=True)
    code = me.StringField(required=True, max_length=6)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'password_reset_codes',  # Nom de la collection dans MongoDB
        'indexes': [
            {'fields': ['created_at'], 'expireAfterSeconds': 3600} # Optionnel : le code s'efface seul après 1h
        ]
    }