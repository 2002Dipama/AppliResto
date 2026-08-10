from django.urls import path

from . import views
from .auth_views import login_view

urlpatterns = [
    path('auth/login/', login_view, name='login'),
    path('orders/<str:code>/', views.track_order, name='track-order'),
    path('dashboard/orders/', views.dashboard_orders, name='dashboard-orders'),
    path('dashboard/orders/<int:pk>/', views.update_order, name='update-order'),
    path('<slug:slug>/menu/', views.menu, name='menu'),
    path('<slug:slug>/orders/', views.create_order, name='create-order'),
]
