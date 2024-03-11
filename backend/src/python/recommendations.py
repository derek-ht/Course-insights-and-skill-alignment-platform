import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import regex as re
from utils import clean_text

subject = input()
corpus = input()

targets = corpus.split('___')
if len(targets) > 1:
    targets.pop()

Ids = []
target_requirements = []

for summary in targets:
    if summary:
        Ids.append(re.findall('Id:[^|]*\|', summary)[0].replace('Id:', '').replace('|', ''))
        target_requirements.append(clean_text(re.sub(r'Id:[^|]*\|','', summary)))

df = pd.DataFrame({'target': target_requirements})
vectorizer = TfidfVectorizer()

try:
    targets_vec = vectorizer.fit_transform(df['target'])
    subject_vec = vectorizer.transform([clean_text(subject)])
    cos_similarities = list(map(lambda x: cosine_similarity(subject_vec, x), targets_vec))
except:
    cos_similarities = []

matches = {}
for i, result in enumerate(cos_similarities):
    matches[Ids[i]] = result.item()

best_matches = sorted(matches.items(), key = lambda x:x[1], reverse=True)
print([match[0] for match in best_matches])