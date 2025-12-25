"""
Django settings for core project.
"""

from pathlib import Path
import os
from dotenv import load_dotenv
import mongoengine
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Charge les variables du fichier .env (pour le local)
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# =========================================================
# 🔐 SÉCURITÉ & CONFIGURATION PRINCIPALE
# =========================================================

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key-change-me-in-prod')

# ⚠️ CORRECTION IMPORTANTE ICI :
# On compare avec la chaîne 'True'. Si .env contient 'False', ceci deviendra le booléen False.
DEBUG = False

ALLOWED_HOSTS = ['.vercel.app', '.now.sh', '127.0.0.1', 'localhost']


# =========================================================
# 📦 APPLICATIONS INSTALLÉES
# =========================================================

INSTALLED_APPS = [
    'django.contrib.staticfiles',
    
    # ☁️ Stockage
    'cloudinary_storage',
    'cloudinary',

    # API & Utilitaires
    'rest_framework',
    'corsheaders',

    # Mes Applications
    'apps.users',
    'apps.products',
    'apps.orders',
]

# =========================================================
# 🛡️ MIDDLEWARE
# =========================================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# =========================================================
# 🗄️ BASE DE DONNÉES
# =========================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.dummy',
    }
}

MONGO_URI = os.environ.get('MONGO_URI')
MONGODB_NAME = "bahri_fishing_db"

if MONGO_URI:
    mongoengine.connect(
        db=MONGODB_NAME,
        host=MONGO_URI,
        alias="default"
    )
    print("✅ MongoDB connecté via MongoEngine")
else:
    print("⚠️  ATTENTION : MONGO_URI non trouvé")


# =========================================================
# ☁️ CLOUDINARY vs LOCAL (La correction est ici)
# =========================================================

# On configure les chemins médias de base
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

print(f"🔍 DEBUG est sur : {DEBUG}")

if not DEBUG:
    print("🚀 PASSAGE EN MODE PRODUCTION (CLOUDINARY)")
    # En Prod (DEBUG=False), on utilise Cloudinary
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'), # J'ai remis ton cloud name par sécurité
        'API_KEY':    os.environ.get('CLOUDINARY_API_KEY'),
        'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
    }
else:
    print("💻 PASSAGE EN MODE LOCAL (DISQUE DUR)")
    # En Local (DEBUG=True), on n'active PAS Cloudinary.
    # Django utilisera par défaut FileSystemStorage (le disque dur).
    pass

# 🛑 J'AI SUPPRIMÉ LA LIGNE QUI FORÇAIT CLOUDINARY ICI


# =========================================================
# 🔒 AUTHENTIFICATION
# =========================================================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.users.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "UNAUTHENTICATED_USER": None,
}


# =========================================================
# 🌍 INTERNATIONALISATION & STATIC
# =========================================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True