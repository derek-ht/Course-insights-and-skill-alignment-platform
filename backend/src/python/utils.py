from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import regex as re

stop_words = set(stopwords.words('english'))
wn = WordNetLemmatizer()

def clean_text(text):
    text = re.sub("'", "", text)
    text = re.sub("(\\d|\\W)+", " ", text)
    # converts the words in word_tokens to lower case and then checks whether 
    #they are present in stop_words or not
    return " ".join([wn.lemmatize(word, pos="v") for word in word_tokenize(text.lower()) if not word in stop_words])