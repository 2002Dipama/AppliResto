from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MenuItem, Order, OrderItem, Restaurant
from .serializers import (
    CreateOrderSerializer,
    MenuItemSerializer,
    OrderSerializer,
    UpdateOrderStatusSerializer,
)


@api_view(['GET'])
def menu(request, slug):
    restaurant = get_object_or_404(Restaurant, slug=slug, is_open=True)
    items = restaurant.menu_items.filter(is_available=True)
    serializer = MenuItemSerializer(items, many=True, context={'request': request})
    return Response({
        'restaurant': {'name': restaurant.name, 'phone': restaurant.phone, 'address': restaurant.address},
        'items': serializer.data,
    })


@api_view(['POST'])
def create_order(request, slug):
    restaurant = get_object_or_404(Restaurant, slug=slug, is_open=True)
    serializer = CreateOrderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    menu_item_ids = [item['menu_item'] for item in serializer.validated_data['items']]
    menu_items = {
        mi.id: mi for mi in MenuItem.objects.filter(
            id__in=menu_item_ids, restaurant=restaurant, is_available=True,
        )
    }

    missing = set(menu_item_ids) - set(menu_items.keys())
    if missing:
        return Response(
            {'error': f"Plats introuvables ou indisponibles : {missing}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    total = sum(
        menu_items[item['menu_item']].price * item['quantity']
        for item in serializer.validated_data['items']
    )

    order = Order.objects.create(
        restaurant=restaurant,
        customer_name=serializer.validated_data['customer_name'],
        customer_phone=serializer.validated_data['customer_phone'],
        total=total,
    )

    order_items = [
        OrderItem(
            order=order,
            menu_item=menu_items[item['menu_item']],
            quantity=item['quantity'],
            unit_price=menu_items[item['menu_item']].price,
        )
        for item in serializer.validated_data['items']
    ]
    OrderItem.objects.bulk_create(order_items)

    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def track_order(request, code):
    order = get_object_or_404(Order, pickup_code=code.upper())
    return Response(OrderSerializer(order).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_orders(request):
    restaurants = Restaurant.objects.filter(owner=request.user)
    orders = Order.objects.filter(restaurant__in=restaurants).select_related('restaurant')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_order(request, pk):
    order = get_object_or_404(
        Order,
        pk=pk,
        restaurant__owner=request.user,
    )
    serializer = UpdateOrderStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    order.status = serializer.validated_data['status']
    if 'estimated_minutes' in serializer.validated_data:
        order.estimated_minutes = serializer.validated_data['estimated_minutes']
    order.save()

    return Response(OrderSerializer(order).data)
