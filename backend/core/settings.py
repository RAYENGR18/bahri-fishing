"""
Django settings for core project - PRODUCTION VERCEL
"""

from pathlib import Path
import os
from dotenv import load_dotenv
import mongoengine
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Charge les variables d'environnement
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# =========================================================
# 🔐 SÉCURITÉ & CONFIGURATION VERCEL
# =========================================================

SECRET_KEY = os.environ.get('SECRET_KEY', 'change-me-in-prod')

# Sur Vercel, la variable d'environnement DEBUG est à 'False'.
# Si elle n'existe pas, on met False par sécurité.
DEBUG = os.environ.get('DEBUG') == 'True'

ALLOWED_HOSTS = ['.vercel.app', '.now.sh', '127.0.0.1', 'localhost']


# =========================================================
# 📦 APPLICATIONS
# =========================================================

INSTALLED_APPS = [
    'django.contrib.staticfiles',
    
    # ☁️ Stockage & Images
    'cloudinary_storage',
    'cloudinary',

    # API
    'rest_framework',
    'corsheaders',

    # Mes Apps
    'apps.users',
    'apps.products',
    'apps.orders',
]

# =========================================================
# 🛡️ MIDDLEWARE (L'ORDRE EST CRUCIAL)
# =========================================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',       # <--- EN PREMIER !
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',   
    'whitenoise.middleware.WhiteNoiseMiddleware',
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
# 🔒 SÉCURITÉ CORS & CSRF (C'EST ICI QUE ÇA BLOQUAIT)
# =========================================================

# On interdit tout le monde par défaut
CORS_ALLOW_ALL_ORIGINS = False 

# On autorise EXPLICITEMENT votre site Frontend
CORS_ALLOWED_ORIGINS = [
    "https://bahri-fishing.vercel.app",  # 👈 VOTRE SITE
]

# Indispensable pour que le Login et les Commandes fonctionnent
CSRF_TRUSTED_ORIGINS = [
    "https://bahri-fishing.vercel.app",
    "https://bahri-backend.vercel.app",
]

CORS_ALLOW_CREDENTIALS = True
# Autoriser les headers envoyés par Axios et Google
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]


# =========================================================
# 🗄️ BASE DE DONNÉES (MONGODB ATLAS)
# =========================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.dummy',
    }
}

MONGO_URI = os.environ.get('MONGO_URI')

if MONGO_URI:
    mongoengine.connect(
        db="bahri_fishing_db",
        host=MONGO_URI,
        alias="default"
    )
else:
    print("⚠️ ERREUR CRITIQUE : MONGO_URI MANQUANT")


# =========================================================
# ☁️ STOCKAGE CLOUDINARY (PRODUCTION)
# =========================================================

# On force l'utilisation de Cloudinary
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY':    os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

# =========================================================
# 🔧 RESTE DE LA CONFIGURATION
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

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

# 👇 On récupère les valeurs secrètes depuis Vercel
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')

DEFAULT_FROM_EMAIL = f"Bahri Fishing <{EMAIL_HOST_USER}>"
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin-allow-popups'