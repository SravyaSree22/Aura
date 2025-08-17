from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction

class Command(BaseCommand):
    help = 'Create test users for the Aura LMS system'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Create teacher user
            teacher, created = User.objects.get_or_create(
                email='teacher1@example.com',
                defaults={
                    'username': 'teacher1',
                    'first_name': 'Test',
                    'last_name': 'Teacher',
                    'is_staff': True,
                    'is_superuser': False,
                }
            )
            if created:
                teacher.set_password('password123')
                teacher.save()
                self.stdout.write(self.style.SUCCESS('✅ Teacher user created'))
            else:
                # Ensure teacher has proper permissions
                teacher.is_staff = True
                teacher.save()
                self.stdout.write(self.style.SUCCESS('✅ Teacher user updated'))

            # Create student user
            student, created = User.objects.get_or_create(
                email='student1@example.com',
                defaults={
                    'username': 'student1',
                    'first_name': 'Test',
                    'last_name': 'Student',
                    'is_staff': False,
                    'is_superuser': False,
                }
            )
            if created:
                student.set_password('password123')
                student.save()
                self.stdout.write(self.style.SUCCESS('✅ Student user created'))
            else:
                # Ensure student doesn't have staff permissions
                student.is_staff = False
                student.save()
                self.stdout.write(self.style.SUCCESS('✅ Student user updated'))

        self.stdout.write(self.style.SUCCESS('🎉 Test users ready!'))
