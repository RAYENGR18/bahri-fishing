import mongoengine as me
import bcrypt
from datetime import datetime

# =================================================================
# MODÈLE UTILISATEUR (FUSIONNÉ)
# =================================================================
class User(me.Document):
    # --- 1. Identité de base ---
    email = me.EmailField(required=True, unique=True)
    first_name = me.StringField(required=True, max_length=50)
    last_name = me.StringField(required=True, max_length=50)
    
    # Mot de passe : n'est plus "required=True" car un user Google n'en a pas forcément
    password = me.StringField() 

    # --- 2. Infos Contact & Livraison ---
    # J'ai mis "required=False" par défaut pour éviter les bugs si Google ne donne pas l'info
    phone = me.StringField(default="")
    address = me.StringField(default="")
    city = me.StringField(default="")
    zip_code = me.StringField(default="")
    country = me.StringField(default="Tunisie")

    # --- 3. Authentification Google (NOUVEAU) ---
    google_id = me.StringField()       # ID unique Google
    auth_provider = me.StringField(default="email") # "google" ou "email"
    avatar = me.StringField()          # Photo de profil

    # --- 4. Rôles & Fidélité ---
    # On utilise 'points' (Int) au lieu de 'loyalty_points' (Decimal) pour simplifier le calcul
    points= me.IntField(default=0)
    
    is_admin = me.BooleanField(default=False)
    is_active = me.BooleanField(default=True)
    
    # --- 5. Dates ---
    date_joined = me.DateTimeField(default=datetime.utcnow)
    last_login = me.DateTimeField()

    meta = {
        'collection': 'users',
        'indexes': [
            'email',
            'google_id',
            ('first_name', 'last_name')
        ],
        'ordering': ['-date_joined']
    }

    # =================================================================
    # PROPRIÉTÉS DE SÉCURITÉ DJANGO (Vital pour ton Admin et JWT)
    # =================================================================
    @property
    def is_staff(self):
        return self.is_admin

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    # =================================================================
    # GESTION MOT DE PASSE (BCRYPT)
    # =================================================================
    def set_password(self, raw_password):
        """Hache le mot de passe avant de le stocker"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(raw_password.encode('utf-8'), salt)
        self.password = hashed.decode('utf-8')

    def check_password(self, raw_password):
        """Vérifie le mot de passe haché"""
        if not self.password:
            return False
        return bcrypt.checkpw(raw_password.encode('utf-8'), self.password.encode('utf-8'))

    def __str__(self):
        return self.email


# =================================================================
# NOUVEAU MODÈLE : HISTORIQUE DES POINTS (Pour le Dashboard Admin)
# =================================================================
class PointsHistory(me.Document):
    # 'reverse_delete_rule=me.CASCADE' signifie que si l'user est supprimé, son historique l'est aussi
    user = me.ReferenceField(User, required=True, reverse_delete_rule=me.CASCADE)
    
    # L'admin qui a fait l'action (peut être null si c'est un achat automatique)
    admin = me.ReferenceField(User, reverse_delete_rule=me.NULLIFY)
    
    action = me.StringField(required=True)  # ex: "Correction Admin", "Achat Produit"
    amount = me.IntField(required=True)     # ex: +50 ou -20
    reason = me.StringField()               # ex: "Erreur de commande"
    
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'points_history',
        'ordering': ['-created_at']
    }
    
    def __str__(self):
        return f"{self.user.email} : {self.amount} ({self.action})"


# =================================================================
# MODÈLE CODE DE RÉINITIALISATION (Inchangé)
# =================================================================
class PasswordResetCode(me.Document):
    user = me.ReferenceField(User, required=True)
    code = me.StringField(required=True, max_length=6)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'password_reset_codes',
        'indexes': [
            {'fields': ['created_at'], 'expireAfterSeconds': 3600}
        ]
    }