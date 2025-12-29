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
    """
    Statistiques globales pour le dashboard admin
    """
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
    """
    Liste toutes les commandes pour l'admin
    """
    permission_classes = [AllowAny]

    def get(self, request):
        orders = Order.objects.order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class AdminUpdateOrderStatus(APIView):
    """
    Met à jour le statut d'une commande (Gestion stock + Points fidélité)
    """
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
        # Si la commande passe à VALIDATED pour la première fois, on décrémente le stock
        if new_status == 'VALIDATED' and previous_status != 'VALIDATED':
            print(f"📦 Validation commande {order_id} : Mise à jour des stocks...")
            if order.items:
                for item in order.items:
                    try:
                        # Gestion de la référence produit (ID ou Objet selon MongoEngine)
                        p_id = item.product.id if hasattr(item.product, 'id') else item.product
                        product = Product.objects(id=p_id).first()
                        
                        if product:
                            current_stock = int(product.stock)
                            qty_bought = int(item.quantity)
                            
                            # On s'assure que le stock ne devient pas négatif
                            new_stock = max(0, current_stock - qty_bought)
                            
                            product.stock = new_stock
                            product.save()
                            print(f"   - {product.title}: Stock {current_stock} -> {new_stock}")
                    except Exception as e:
                        print(f"   ! Erreur mise à jour stock produit : {e}")

        # --- 2. GESTION FIDÉLITÉ (Utilisation de points_to_earn) ---
        # Si la commande est validée ou livrée (et ne l'était pas avant)
        if new_status in ['VALIDATED', 'DELIVERED'] and previous_status == 'PENDING':
            # On récupère les points en attente stockés dans la commande
            points_pending = getattr(order, 'points_to_earn', 0)
            
            # Si l'utilisateur existe et qu'il y a des points à gagner
            if order.user and points_pending > 0:
                try:
                    # On s'assure de travailler avec des Decimal ou float
                    points_pending_decimal = Decimal(str(points_pending))
                    
                    # On récupère le solde actuel (loyalty_points)
                    current_points = getattr(order.user, 'points', Decimal('0.00'))
                    if current_points is None: current_points = Decimal('0.00')
                    
                    # Mise à jour du solde utilisateur
                    new_balance = Decimal(str(current_points)) + points_pending_decimal
                    
                    order.user.points = new_balance
                    order.user.save()
                    
                    print(f"⭐ Points crédités au client {order.user.email} : +{points_pending} (Nouveau solde: {new_balance})")
                    
                    # Optionnel : On peut remettre points_to_earn à 0 pour éviter de créditer deux fois
                    # order.points_to_earn = Decimal('0.00') 
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
    """
    Suppression d'une commande
    """
    permission_classes = [AllowAny]

    def delete(self, request, order_id):
        order = Order.objects(id=order_id).first()
        if order:
            order.delete()
            return Response({"message": "Commande supprimée"}, status=status.HTTP_200_OK)
        return Response({"error": "Non trouvé"}, status=status.HTTP_404_NOT_FOUND)