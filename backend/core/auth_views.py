from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils.text import slugify
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Restaurant


@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {'error': 'Identifiants incorrects'},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    login(request, user)
    return Response({'ok': True, 'username': user.username})


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'ok': True})


@api_view(['POST'])
def register_view(request):
    restaurant_name = request.data.get('restaurant_name', '').strip()
    owner_name = request.data.get('owner_name', '').strip()
    phone = request.data.get('phone', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not all([restaurant_name, owner_name, email, password]):
        return Response(
            {'error': 'Tous les champs sont requis.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(password) < 6:
        return Response(
            {'error': 'Le mot de passe doit contenir au moins 6 caractères.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Cet email est déjà utilisé.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    base_slug = slugify(restaurant_name)
    slug = base_slug
    counter = 1
    while Restaurant.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=owner_name,
    )

    restaurant = Restaurant.objects.create(
        owner=user,
        name=restaurant_name,
        slug=slug,
        phone=phone,
    )

    login(request, user)

    return Response({
        'ok': True,
        'restaurant': {
            'name': restaurant.name,
            'slug': restaurant.slug,
        },
    }, status=status.HTTP_201_CREATED)
