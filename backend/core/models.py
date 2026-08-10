import random
import string

from django.conf import settings
from django.db import models


class Restaurant(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='restaurants')
    name = models.CharField('Nom', max_length=200)
    slug = models.SlugField(unique=True)
    phone = models.CharField('Téléphone', max_length=20, blank=True)
    address = models.CharField('Adresse', max_length=300, blank=True)
    is_open = models.BooleanField('Ouvert', default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Restaurant'

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField('Nom du plat', max_length=200)
    description = models.TextField('Description', blank=True)
    price = models.PositiveIntegerField('Prix (FCFA)')
    category = models.CharField('Catégorie', max_length=100, blank=True)
    image = models.ImageField('Photo', upload_to='menu/', blank=True)
    is_available = models.BooleanField('Disponible', default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Plat'
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} — {self.price} FCFA"


def generate_pickup_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente'
        ACCEPTED = 'accepted', 'Acceptée'
        PREPARING = 'preparing', 'En préparation'
        READY = 'ready', 'Prête'
        PICKED_UP = 'picked_up', 'Récupérée'

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    pickup_code = models.CharField('Code de retrait', max_length=6, default=generate_pickup_code, unique=True)
    customer_name = models.CharField('Nom du client', max_length=200)
    customer_phone = models.CharField('Téléphone', max_length=20)
    status = models.CharField('Statut', max_length=20, choices=Status.choices, default=Status.PENDING)
    estimated_minutes = models.PositiveIntegerField('Temps estimé (min)', null=True, blank=True)
    total = models.PositiveIntegerField('Total (FCFA)', default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Commande'
        ordering = ['-created_at']

    def __str__(self):
        return f"#{self.pickup_code} — {self.customer_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField('Quantité', default=1)
    unit_price = models.PositiveIntegerField('Prix unitaire (FCFA)')

    class Meta:
        verbose_name = 'Ligne de commande'

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"
