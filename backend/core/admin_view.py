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
        print(f"\n--- 🔍 DÉBUT DU DEBUG FIDÉLITÉ (Order: {order_id}) ---")
        try:
            new_status = request.data.get('status')
            order = Order.objects(id=order_id).first()
            
            if not order:
                return Response({"error": "Commande introuvable"}, status=404)

            print(f"1. Statut actuel: {order.status} -> Nouveau: {new_status}")

            # --- GESTION STOCK (On le garde court) ---
            if new_status == 'VALIDATED' and order.status != 'VALIDATED':
                for item in order.items:
                    if item.product:
                        Product.objects(id=item.product.id).update_one(inc__stock=-int(item.quantity))

            # --- GESTION FIDÉLITÉ (DEBUG APPROFONDI) ---
            if new_status in ['VALIDATED', 'DELIVERED'] and order.status == 'PENDING':
                
                # A. Vérifier les points
                points = getattr(order, 'points_to_earn', 0)
                if not points and order.total_amount:
                    points = int(order.total_amount)
                
                print(f"2. Points à ajouter : {points}")

                # B. Vérifier l'utilisateur
                if order.user:
                    user_id = order.user.id
                    print(f"3. Utilisateur trouvé ! ID : {user_id}")
                    print(f"4. Ancien solde (avant update) : {order.user.loyalty_points}")

                    # C. Update Atomique
                    try:
                        result = User.objects(id=user_id).update_one(inc__loyalty_points=points)
                        print(f"5. Résultat update MongoDB : {result}")
                        
                        # Vérification immédiate
                        updated_user = User.objects(id=user_id).first()
                        print(f"6. NOUVEAU SOLDE CONFIRMÉ : {updated_user.loyalty_points}")
                        
                    except Exception as e:
                        print(f"❌ ERREUR UPDATE USER : {e}")
                else:
                    print("❌ ERREUR : Cette commande n'est liée à aucun utilisateur (order.user est Vide/Null)")

            # Mise à jour statut
            Order.objects(id=order_id).update_one(set__status=new_status)
            
            print("--- ✅ FIN DU DEBUG ---\n")
            return Response({"message": f"Statut mis à jour : {new_status}"})

        except Exception as e:
            print(f"❌ CRASH TOTAL : {e}")
            return Response({"error": str(e)}, status=500)

class AdminDeleteOrder(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, order_id):
        order = Order.objects(id=order_id).first()
        if order:
            order.delete()
            return Response({"message": "Commande supprimée"})
        return Response({"error": "Non trouvé"}, status=404)