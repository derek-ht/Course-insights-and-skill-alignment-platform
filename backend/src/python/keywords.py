import sys
import yake
import re
from nltk.corpus import stopwords
import string

stop_words = set(stopwords.words('english'))

top_n = int(input())
text = input()

partitions = text.split('|')
if len(partitions) > 1:
    partitions.pop()
total_keywords = []

for text in partitions:
    x = re.findall('[A-Z]{4}[0-9]{4}', text)
    source = "work experience"
    if x:
        source = x[0]
    text = text.replace('[A-Z]{4}[0-9]{4}', '', 1)
    text = text.replace('\'', '')
    text = text.replace('\"', '')
    language = "en"
    max_ngram_size = 3
    deduplication_threshold = 0.3
    window_size = 2
    kw_extractor = yake.KeywordExtractor(lan=language, n=max_ngram_size, dedupLim=deduplication_threshold,top=top_n,windowsSize=window_size)
    keywords = kw_extractor.extract_keywords(text.lower())
    keywords_list = []
    existing_keywords = []

    for kw in keywords:
        words = kw[0].split()
        for word in words:
            word = word.translate(str.maketrans('', '', string.punctuation))
            if not word.lower() in stop_words and not word.lower() in existing_keywords:
                keywords_list.append({
                    "phrase": word,
                    "score": round(((1/kw[1])) ** 0.2 * 100),
                    "source": source
                })
                existing_keywords.append(word)

    total_keywords += keywords_list

print(total_keywords)
