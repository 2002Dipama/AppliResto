from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


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
