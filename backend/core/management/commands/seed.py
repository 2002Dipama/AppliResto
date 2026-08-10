from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from core.models import MenuItem, Restaurant


class Command(BaseCommand):
    help = 'Crée des données de démonstration'

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={'is_staff': True, 'is_superuser': True},
        )
        if created:
            user.set_password('admin')
            user.save()
            self.stdout.write(self.style.SUCCESS('Utilisateur admin créé (admin/admin)'))

        resto, _ = Restaurant.objects.get_or_create(
            slug='chez-ali',
            defaults={
                'owner': user,
                'name': 'Chez Ali',
                'phone': '70 12 34 56',
                'address': 'Avenue Kwame Nkrumah, Ouagadougou',
            },
        )

        plats = [
            ('Riz gras', 'Riz au gras avec viande', 1500, 'Plats principaux'),
            ('Tô sauce gombo', 'Tô traditionnel avec sauce gombo', 1000, 'Plats principaux'),
            ('Poulet braisé', 'Poulet braisé avec alloco', 2500, 'Plats principaux'),
            ('Attiéké poisson', 'Attiéké avec poisson braisé', 2000, 'Plats principaux'),
            ('Brochettes de bœuf', '5 brochettes de bœuf grillé', 1500, 'Grillades'),
            ('Brochettes de mouton', '5 brochettes de mouton grillé', 2000, 'Grillades'),
            ('Salade composée', 'Salade fraîche de saison', 800, 'Entrées'),
            ('Soupe de légumes', 'Soupe maison aux légumes', 500, 'Entrées'),
            ('Bissap', 'Jus de bissap frais (33cl)', 300, 'Boissons'),
            ('Gingembre', 'Jus de gingembre frais (33cl)', 300, 'Boissons'),
            ('Eau minérale', 'Bouteille 50cl', 200, 'Boissons'),
            ('Dêguê', 'Dêguê au lait caillé', 500, 'Desserts'),
        ]

        for name, desc, price, cat in plats:
            MenuItem.objects.get_or_create(
                restaurant=resto,
                name=name,
                defaults={
                    'description': desc,
                    'price': price,
                    'category': cat,
                },
            )

        self.stdout.write(self.style.SUCCESS(
            f'Restaurant "{resto.name}" créé avec {len(plats)} plats'
        ))
