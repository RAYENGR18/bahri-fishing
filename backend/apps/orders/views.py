from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from decimal import Decimal
from apps.products.models import Product
from .models import Order, OrderItem
from .serializers import OrderItemInputSerializer, OrderSerializer

# --- VUE DE CRÉATION DE COMMANDE (Invité + Fidélité) ---
class CreateOrderView(APIView):
    permission_classes = [AllowAny] # Autoriser tout le monde (invités inclus)

    def post(self, request):
        data = request.data
        
        # 1. Validation des champs obligatoires (Livraison)
        required_fields = ['full_name', 'email', 'phone', 'address', 'city']
        for field in required_fields:
            if not data.get(field):
                return Response({"error": f"Le champ {field} est obligatoire"}, status=400)

        # 2. Validation du panier
        serializer = OrderItemInputSerializer(data=data.get('items', []), many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        
        items_data = serializer.validated_data
        if not items_data:
            return Response({"error": "Panier vide"}, status=400)

        order_items = []
        items_total = Decimal('0.00')

        # 3. Construction des lignes de commande
        for item in items_data:
            product = Product.objects(id=item['product_id']).first()
            if product:
                line_total = product.price * item['quantity']
                items_total += line_total
                
                order_items.append(OrderItem(
                    product=product,
                    product_title=product.title,
                    quantity=item['quantity'],
                    price_at_purchase=product.price
                ))

        if not order_items:
             return Response({"error": "Produits introuvables"}, status=400)

        # 4. Gestion Logged In vs Invité & Fidélité
        user = None
        points_used = Decimal('0.00')
        discount = Decimal('0.00')
        points_to_earn = Decimal('0.00')
        
        # Si l'utilisateur est authentifié via le Token
        if request.user and request.user.is_authenticated:
            user = request.user
            
            # A. Gagner des points (5% du total produits)
            points_to_earn = items_total * Decimal('0.05')
            
            # B. Utiliser des points (si demandé par le front : use_loyalty=True)
            if data.get('use_loyalty') is True and user.loyalty_points > 0:
                # 1 Point = 1 TND
                max_usable = min(user.loyalty_points, items_total)
                points_used = max_usable
                discount = max_usable

        # 5. Calcul Final
        shipping = Decimal('7.00')
        final_total = items_total + shipping - discount
        
        if final_total < 0: final_total = Decimal('0.00')

        try:
            # 6. Création de la commande
            order = Order(
                user=user,
                full_name=data.get('full_name'),
                email=data.get('email'),
                phone=data.get('phone'),
                address=data.get('address'),
                city=data.get('city'),
                items=order_items,
                items_total=items_total,
                shipping_cost=shipping,
                loyalty_points_used=points_used,
                loyalty_discount_amount=discount,
                final_total=final_total,
                points_to_earn=points_to_earn,
                status='PENDING'
            )
            order.save()
            
            # 7. Débit immédiat des points utilisés
            if user and points_used > 0:
                user.loyalty_points = Decimal(user.loyalty_points) - points_used
                user.save()

            return Response({
                "message": "Commande créée", 
                "order_id": str(order.id),
                "total": str(final_total),
                "points_earned_pending": str(points_to_earn)
            }, status=201)
            
        except Exception as e:
            # En cas d'erreur, on log pour le débug
            print(f"Erreur commande: {e}")
            return Response({"error": "Erreur serveur lors de la commande"}, status=500)


class UserOrderListView(APIView):
    permission_classes = [IsAuthenticated] # Sécurité : il faut être connecté

    def get(self, request):
        # Récupère les commandes de l'utilisateur connecté uniquement
        orders = Order.objects(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # --- LA CORRECTION EST ICI ---
        # Ajoutez ".id" après request.user
        orders = Order.objects(user=request.user.id).order_by('-created_at')
        
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)