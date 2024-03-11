import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import regex as re
from utils import clean_text

user = input()
corpus = input()

user_degree = clean_text(re.findall('user degree:[^|]*\|', user)[0].replace('user degree:', '').replace('|', '').replace('null', ''))
user_workexp = clean_text(re.findall('user workexperience:[^|]*\|', user)[0].replace('user workexperience:', '').replace('|', '').replace('null', ''))
user_courses = clean_text(re.findall('user courses:.*', user)[0].replace('user courses:', '').replace('|', '').replace('null', ''))

users = corpus.split('___')
if len(users) > 1:
    users.pop()

uIds = []
users_degrees = []
users_workexp = []
users_courses = []

for summary in users:
    if summary:
        summary = summary.replace('\n', ' ')
        uIds.append(re.findall('Id:[^|]*\|', summary)[0].replace('Id:', '').replace('|', ''))
        users_degrees.append(clean_text(re.findall('user degree:[^|]*\|', summary)[0].replace('user degree:', '').replace('|', '').replace('null', '')))
        users_workexp.append(clean_text(re.findall('user workexperience:[^|]*\|', summary)[0].replace('user workexperience:', '').replace('|', '').replace('null', '')))
        users_courses.append(clean_text(re.findall('user courses:.*', summary)[0].replace('user courses:', '').replace('|', '').replace('null', '')))

df = pd.DataFrame({'degrees': users_degrees, 'workexp': users_workexp, 'courses': users_courses})
vectorizer = TfidfVectorizer()

try :
    users_degrees_vec = vectorizer.fit_transform(df['degrees'])
    user_degree_vec = vectorizer.transform([user_degree])
    degrees_cos_similarities = list(map(lambda x: cosine_similarity(user_degree_vec, x), users_degrees_vec))
except:
    degrees_cos_similarities = [0] * len(uIds)

try:
    users_workexp_vec = vectorizer.fit_transform(df['workexp'])
    user_workexp_vec = vectorizer.transform([user_workexp])
    workexp_cos_similarities = list(map(lambda x: cosine_similarity(user_workexp_vec, x), users_workexp_vec))
except:
    workexp_cos_similarities = [0] * len(uIds)

try:
    users_courses_vec = vectorizer.fit_transform(df['courses'])
    user_courses_vec = vectorizer.transform([user_courses])
    courses_cos_similarities = list(map(lambda x: cosine_similarity(user_courses_vec, x), users_courses_vec))
except:
    courses_cos_similarities = [0] * len(uIds)

DEGREE_WEIGHTING = 1.0
WORK_EXPERIENCE_WEIGHTING = 1.0
COURSES_WEIGHTING = 2.0
matches = {}
for i in range(0, len(uIds)):
    matches[uIds[i]] = DEGREE_WEIGHTING * degrees_cos_similarities[i] + WORK_EXPERIENCE_WEIGHTING * workexp_cos_similarities[i] + COURSES_WEIGHTING * courses_cos_similarities[i]

best_matches = sorted(matches.items(), key = lambda x:x[1], reverse=True)
print([match[0] for match in best_matches])
