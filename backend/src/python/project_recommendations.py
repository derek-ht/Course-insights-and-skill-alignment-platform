import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import regex as re
from utils import clean_text

subject = clean_text(input())
corpus = input()

projects = corpus.split('___')
if len(projects) > 1:
    projects.pop()

pIds = []
projects_skills = []
projects_topics = []
projects_descriptions = []

for summary in projects:
    if summary:
        summary = summary.replace('\n', ' ')
        pIds.append(re.findall('Id:[^|]*\|', summary)[0].replace('Id:', '').replace('|', ''))
        projects_skills.append(clean_text(re.findall('Skills__[^|]*\|', summary)[0].replace('Skills__', '').replace('|', '').replace('null', '')))
        projects_topics.append(clean_text(re.findall('Topics__[^|]*\|', summary)[0].replace('Topics__', '').replace('|', '').replace('null', '')))
        projects_descriptions.append(clean_text(re.findall('Description__[^|]*\|', summary)[0].replace('Description__', '').replace('|', '').replace('null', '')))

df = pd.DataFrame({'skills': projects_skills, 'topics': projects_topics, 'description': projects_descriptions})
vectorizer = TfidfVectorizer()

try :
    projects_skills_vec = vectorizer.fit_transform(df['skills'])
    subject_vec = vectorizer.transform([subject])
    skills_cos_similarities = list(map(lambda x: cosine_similarity(subject_vec, x), projects_skills_vec))
except:
    skills_cos_similarities = [0] * len(pIds)

try:
    projects_topics_vec = vectorizer.fit_transform(df['topics'])
    subject_vec = vectorizer.transform([subject])
    topics_cos_similarities = list(map(lambda x: cosine_similarity(subject_vec, x), projects_topics_vec))
except:
    topics_cos_similarities = [0] * len(pIds)

try:
    projects_descriptions_vec = vectorizer.fit_transform(df['description'])
    subject_vec = vectorizer.transform([subject])
    descriptions_cos_similarities = list(map(lambda x: cosine_similarity(subject_vec, x), projects_descriptions_vec))
except:
    descriptions_cos_similarities = [0] * len(pIds)

SKILLS_WEIGHTING = 1.0
TOPICS_WEIGHTING = 1.0
DESCRIPTIONS_WEIGHTING = 1.0
matches = {}
for i in range(0, len(pIds)):
    matches[pIds[i]] = SKILLS_WEIGHTING * skills_cos_similarities[i] + TOPICS_WEIGHTING * topics_cos_similarities[i] + DESCRIPTIONS_WEIGHTING * descriptions_cos_similarities[i]

best_matches = sorted(matches.items(), key = lambda x:x[1], reverse=True)
print([match[0] for match in best_matches])
