import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# La variable standard de Django
application = get_wsgi_application()

# 👇 AJOUTEZ CETTE LIGNE POUR VERCEL 👇
app = application