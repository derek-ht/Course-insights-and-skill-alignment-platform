import sys
from utils import clean_text

subject = input()
project = input()

subject_skills = subject.split('___')
if len(subject_skills) > 1:
   subject_skills.pop()

cleaned_subject_skills = [clean_text(skill) for skill in subject_skills]

project_requirements = project.split('___')
if len(project_requirements) > 1:
    project_requirements.pop()

def calculate_score(phrase, subject):
    score = 0
    terms = phrase.split(' ')
    subject = subject.replace(' ', '')
    for term in terms:
        if term in subject:
            score += 1
    return score / len(terms)

missing_skills = []

for requirement in project_requirements:
    cleaned_requirement = clean_text(requirement)
    score = max([calculate_score(cleaned_requirement, skill) for skill in cleaned_subject_skills])
    if score < 1:
        missing_skills.append(requirement)
    
print(missing_skills)
