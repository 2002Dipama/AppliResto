from django.contrib import admin

from .models import MenuItem, Order, OrderItem, Restaurant


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'phone', 'is_open']
    prepopulated_fields = {'slug': ('name',)}


class MenuItemInline(admin.TabularInline):
    model = MenuItem
    extra = 1


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'category', 'is_available', 'restaurant']
    list_filter = ['restaurant', 'category', 'is_available']
    list_editable = ['price', 'is_available']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['menu_item', 'quantity', 'unit_price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['pickup_code', 'customer_name', 'status', 'total', 'restaurant', 'created_at']
    list_filter = ['status', 'restaurant']
    list_editable = ['status']
    inlines = [OrderItemInline]
    readonly_fields = ['pickup_code', 'total', 'created_at', 'updated_at']
