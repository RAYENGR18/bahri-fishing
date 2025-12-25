from django.urls import path
from .views import CreateOrderView, OrderListView,UserOrderListView

urlpatterns = [
    path('create/', CreateOrderView.as_view(), name='create-order'),
    path('my-order/', UserOrderListView.as_view(), name='my-order'),
    path('my-orders/', OrderListView.as_view(), name='my-orders'),
]