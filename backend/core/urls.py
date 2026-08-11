from django.urls import path

from . import views
from .auth_views import login_view, logout_view, register_view

urlpatterns = [
    path('auth/login/', login_view, name='login'),
    path('auth/register/', register_view, name='register'),
    path('auth/logout/', logout_view, name='logout'),
    path('restaurants/', views.restaurant_list, name='restaurant-list'),
    path('orders/<str:code>/', views.track_order, name='track-order'),
    path('dashboard/orders/', views.dashboard_orders, name='dashboard-orders'),
    path('dashboard/toggle/', views.toggle_restaurant, name='toggle-restaurant'),
    path('dashboard/orders/<int:pk>/', views.update_order, name='update-order'),
    path('dashboard/menu/', views.dashboard_menu, name='dashboard-menu'),
    path('dashboard/menu/create/', views.dashboard_menu_create, name='dashboard-menu-create'),
    path('dashboard/menu/<int:pk>/', views.dashboard_menu_detail, name='dashboard-menu-detail'),
    path('<slug:slug>/menu/', views.menu, name='menu'),
    path('<slug:slug>/orders/', views.create_order, name='create-order'),
]
