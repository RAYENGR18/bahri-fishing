# backend/core/admin_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny 
from rest_framework import status
from decimal import Decimal

# Import des modèles et serializers
from apps.orders.models import Order
from apps.users.models import User
from apps.products.models import Product
from apps.orders.serializers import OrderSerializer

class AdminDashboardStats(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
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

    def patch(self, request, order_id):
        new_status = request.data.get('status')
        
        # Récupération de la commande
        order = Order.objects(id=order_id).first()
        
        if not order:
            return Response({"error": "Commande introuvable"}, status=status.HTTP_404_NOT_FOUND)

        if not new_status:
             return Response({"error": "Aucun statut fourni"}, status=status.HTTP_400_BAD_REQUEST)

        previous_status = order.status

        # --- 1. GESTION DU STOCK ---
        if new_status == 'VALIDATED' and previous_status != 'VALIDATED':
            print(f"📦 Validation commande {order_id} : Mise à jour des stocks...")
            if order.items:
                for item in order.items:
                    try:
                        p_id = item.product.id if hasattr(item.product, 'id') else item.product
                        product = Product.objects(id=p_id).first()
                        
                        if product:
                            current_stock = int(product.stock)
                            qty_bought = int(item.quantity)
                            new_stock = max(0, current_stock - qty_bought)
                            
                            product.stock = new_stock
                            product.save()
                    except Exception as e:
                        print(f"   ! Erreur mise à jour stock : {e}")

        # --- 2. GESTION FIDÉLITÉ (Correction : Champ 'points' en Int) ---
        if new_status in ['VALIDATED', 'DELIVERED'] and previous_status == 'PENDING':
            # On récupère les points en attente (probablement Decimal dans Order)
            points_pending = getattr(order, 'points_to_earn', 0)
            
            if order.user and points_pending > 0:
                try:
                    # ⚠️ Conversion en ENTIER car User.points est un IntField
                    points_to_add = int(points_pending)
                    
                    # On récupère le solde actuel (ou 0 si vide)
                    current_points = order.user.points or 0
                    
                    # Mise à jour
                    order.user.points = current_points + points_to_add
                    order.user.save()
                    
                    print(f"⭐ Points crédités (Int) : +{points_to_add} -> Nouveau solde : {order.user.points}")
                except Exception as e:
                    print(f"❌ Erreur crédit points fidélité : {e}")

        # Sauvegarde du statut final
        order.status = new_status
        order.save()

        return Response({
            "message": f"Statut mis à jour : {new_status}",
            "order": OrderSerializer(order).data
        }, status=status.HTTP_200_OK)

class AdminDeleteOrder(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, order_id):
        order = Order.objects(id=order_id).first()
        if order:
            order.delete()
            return Response({"message": "Commande supprimée"}, status=status.HTTP_200_OK)
        return Response({"error": "Non trouvé"}, status=status.HTTP_404_NOT_FOUND)