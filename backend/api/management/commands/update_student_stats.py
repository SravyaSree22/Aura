from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import StudentStats
from api.signals import update_student_stats

class Command(BaseCommand):
    help = 'Update student statistics for all students based on current data'

    def handle(self, *args, **options):
        # Get all students (non-staff users)
        students = User.objects.filter(is_staff=False)
        
        self.stdout.write(f'Found {students.count()} students to update...')
        
        updated_count = 0
        created_count = 0
        
        for student in students:
            try:
                # Check if stats exist
                stats_existed = StudentStats.objects.filter(student=student).exists()
                
                # Update stats
                update_student_stats(student)
                
                if stats_existed:
                    updated_count += 1
                    self.stdout.write(f'Updated stats for {student.username}')
                else:
                    created_count += 1
                    self.stdout.write(f'Created stats for {student.username}')
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error updating stats for {student.username}: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed {students.count()} students:\n'
                f'  - Created: {created_count}\n'
                f'  - Updated: {updated_count}'
            )
        )
