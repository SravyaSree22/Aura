from django.core.management.base import BaseCommand
from api.models import FAQ


class Command(BaseCommand):
    help = 'Populate FAQ database with initial data'

    def handle(self, *args, **options):
        faqs_data = [
            {
                'question': "How does the emotion detection feature work?",
                'answer': "Our emotion detection feature uses your device's camera to analyze facial expressions and determine your emotional state during learning sessions. This helps us provide tailored recommendations based on your engagement level. Your privacy is important to us - all processing is done locally on your device, and no images are stored or transmitted to our servers.",
                'category': 'features',
                'order': 1
            },
            {
                'question': "Can I change my account email address?",
                'answer': "Yes, you can change your email address in the settings section. Go to Settings > General > Account Information, and you'll find an option to update your email. After changing, you'll need to verify your new email address by clicking on the verification link sent to that address.",
                'category': 'account',
                'order': 2
            },
            {
                'question': "How do I submit assignments?",
                'answer': "To submit an assignment, navigate to your Dashboard or Courses section, find the assignment card, and click on 'Submit Assignment'. You'll be prompted to upload your work or enter your response depending on the assignment type. Make sure to review your submission before finalizing it.",
                'category': 'assignments',
                'order': 3
            },
            {
                'question': "What happens if I submit an assignment late?",
                'answer': "Late assignment policies are set by individual instructors. Some may accept late submissions with a penalty, while others might not accept them at all. Check your course syllabus or ask your instructor directly about their specific late submission policy.",
                'category': 'assignments',
                'order': 4
            },
            {
                'question': "How do I ask anonymous questions?",
                'answer': "You can ask anonymous questions through the Doubts section. Select the relevant course, type your question, and submit it. Your identity will not be revealed to the instructor or other students, allowing you to ask questions freely without concerns about being identified.",
                'category': 'doubts',
                'order': 5
            },
            {
                'question': "Can I download my course materials for offline access?",
                'answer': "Yes, most course materials can be downloaded for offline access. Look for the download icon next to course materials in your course pages. Downloaded materials will be available in your device's downloads folder or in the app's offline section depending on your device.",
                'category': 'materials',
                'order': 6
            },
            {
                'question': "How do I earn badges and achievements?",
                'answer': "Badges and achievements are earned by completing specific milestones in your courses. These may include maintaining perfect attendance, achieving high grades, completing assignments early, participating actively in discussions, or helping fellow students. Each badge has specific criteria that you can view by clicking on the badge.",
                'category': 'achievements',
                'order': 7
            },
        ]

        created_count = 0
        for faq_data in faqs_data:
            faq, created = FAQ.objects.get_or_create(
                question=faq_data['question'],
                defaults=faq_data
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created FAQ: {faq_data['question'][:50]}...")
            else:
                self.stdout.write(f"FAQ already exists: {faq_data['question'][:50]}...")

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new FAQs')
        )


