# backend/core/admin_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny # Sécurité désactivée pour test
from apps.orders.models import Order
from apps.users.models import User
from apps.products.models import Product
from apps.orders.serializers import OrderSerializer

class AdminDashboardStats(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Calcul du revenu (somme des commandes validées/livrées/expédiées)
        orders = Order.objects(status__in=['VALIDATED', 'DELIVERED', 'SHIPPED'])
        revenue = sum(o.final_total for o in orders)
        
        return Response({
            "total_orders": Order.objects.count(),
            "pending_orders": Order.objects(status='PENDING').count(),
            "total_users": User.objects.count(),
            "total_products": Product.objects.count(),
            "revenue": revenue
        })

class AdminOrderListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        orders = Order.objects.order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class AdminUpdateOrderStatus(APIView):
    permission_classes = [AllowAny]

    def post(self, request, order_id):
        new_status = request.data.get('status')
        order = Order.objects(id=order_id).first()
        
        if not order:
            return Response({"error": "Commande introuvable"}, status=404)

        previous_status = order.status

        # --- 1. GESTION DU STOCK (NOUVEAU) ---
        # Si on valide la commande, on décrémente le stock
        if new_status == 'VALIDATED' and previous_status != 'VALIDATED':
            print(f"📦 Validation commande {order_id} : Mise à jour des stocks...")
            for item in order.items:
                try:
                    # On récupère le produit
                    product = Product.objects(id=item.product_id).first()
                    if product:
                        current_stock = int(product.stock)
                        qty_bought = int(item.quantity)

                        # Calcul du nouveau stock (ne descend pas sous 0)
                        new_stock = max(0, current_stock - qty_bought)
                        
                        product.stock = new_stock
                        product.save()
                        print(f"   - {product.title}: Stock {current_stock} -> {new_stock}")
                except Exception as e:
                    print(f"   ! Erreur mise à jour stock pour produit {item.product_id}: {e}")

        # --- 2. GESTION FIDÉLITÉ (EXISTANT) ---
        # Créditer les points si on valide ou livre
        if new_status in ['VALIDATED', 'DELIVERED'] and previous_status == 'PENDING':
            points = getattr(order, 'points_to_earn', 0)
            if order.user and points > 0:
                current_points = float(order.user.points)
                to_add = float(points)
                order.user.points = current_points + to_add
                order.user.save()

        # Sauvegarde du statut final
        order.status = new_status
        order.save()

        return Response({"message": f"Statut mis à jour : {new_status}"})

class AdminDeleteOrder(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, order_id):
        order = Order.objects(id=order_id).first()
        if order:
            order.delete()
            return Response({"message": "Commande supprimée"})
        return Response({"error": "Non trouvé"}, status=404)