from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny 
from rest_framework import status
from decimal import Decimal

# Import des modèles
from apps.orders.models import Order
from apps.users.models import User
from apps.products.models import Product
from apps.orders.serializers import OrderSerializer

# =========================================================
# 1. STATISTIQUES DASHBOARD
# =========================================================
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

# =========================================================
# 2. LISTE DES UTILISATEURS (CORRIGÉE POUR ÉVITER ERREUR 500)
# =========================================================
class AdminUserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            users = User.objects.all().order_by('-date_joined')
            users_data = []
            
            # On fait la sérialisation manuellement ici pour être sûr que ça ne plante pas
            for user in users:
                users_data.append({
                    "id": str(user.id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "date_joined": user.date_joined,
                    "points": user.points, # On utilise bien le champ 'points'
                    "is_admin": user.is_admin
                })
                
            return Response(users_data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"ERREUR LISTE UTILISATEURS : {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =========================================================
# 3. LISTE DES COMMANDES
# =========================================================
class AdminOrderListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        orders = Order.objects.order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

# =========================================================
# 4. MISE A JOUR STATUT (CORRIGÉE : POST ACCEPTÉ)
# =========================================================
class AdminUpdateOrderStatus(APIView):
    permission_classes = [AllowAny]

    # J'ai mis 'post' ici car ton frontend envoie un POST (voir ta console d'erreur)
    def post(self, request, order_id):
        new_status = request.data.get('status')
        
        order = Order.objects(id=order_id).first()
        
        if not order:
            return Response({"error": "Commande introuvable"}, status=status.HTTP_404_NOT_FOUND)

        if not new_status:
             return Response({"error": "Aucun statut fourni"}, status=status.HTTP_400_BAD_REQUEST)

        previous_status = order.status

        # --- GESTION DU STOCK ---
        if new_status == 'VALIDATED' and previous_status != 'VALIDATED':
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
                        print(f"Erreur stock: {e}")

        # --- GESTION FIDÉLITÉ (Champ 'points') ---
        if new_status in ['VALIDATED', 'DELIVERED'] and previous_status == 'PENDING':
            points_pending = getattr(order, 'points_to_earn', 0)
            
            if order.user and points_pending > 0:
                try:
                    points_to_add = int(points_pending)
                    current_points = order.user.points or 0
                    
                    order.user.points = current_points + points_to_add
                    order.user.save()
                except Exception as e:
                    print(f"Erreur fidélité: {e}")

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