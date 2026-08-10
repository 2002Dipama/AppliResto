from rest_framework import serializers

from .models import MenuItem, Order, OrderItem


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'category', 'image', 'is_available']


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'quantity', 'unit_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'pickup_code', 'customer_name', 'customer_phone',
            'status', 'estimated_minutes', 'total', 'items',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['pickup_code', 'total', 'created_at', 'updated_at']


class CreateOrderItemSerializer(serializers.Serializer):
    menu_item = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CreateOrderSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=200)
    customer_phone = serializers.CharField(max_length=20)
    items = CreateOrderItemSerializer(many=True, min_length=1)


class UpdateOrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)
    estimated_minutes = serializers.IntegerField(min_value=1, required=False)
