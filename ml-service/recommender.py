import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Global variables to hold data and similarity matrix in memory
_books_df = None
_cosine_sim = None
_indices = None

def load_data_and_train():
    global _books_df, _cosine_sim, _indices
    
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'books.csv')
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}. Please run ingest_data.py first.")
        
    print("Loading dataset...")
    df = pd.read_csv(data_path)
    
    # Handle missing values in relevant columns
    df['authors'] = df['authors'].fillna('')
    df['original_title'] = df['original_title'].fillna('')
    df['title'] = df['title'].fillna('')
    
    # If original_title is empty, fall back to title
    df['combined_title'] = df.apply(lambda row: row['original_title'] if row['original_title'] else row['title'], axis=1)
    
    # Create the 'content' string
    df['content'] = df['authors'] + " " + df['combined_title']
    
    print("Vectorizing content...")
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['content'])
    
    print("Computing cosine similarity matrix...")
    # Compute the cosine similarity matrix
    _cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    _books_df = df
    # Map book_id to index in the DataFrame
    _indices = pd.Series(df.index, index=df['book_id']).drop_duplicates()
    print("Recommendation engine initialized.")

def get_recommendations(book_id: int, top_n: int = 5):
    global _books_df, _cosine_sim, _indices
    
    if _books_df is None or _cosine_sim is None:
        load_data_and_train()
        
    if book_id not in _indices:
        return []
        
    # Get the index of the book that matches the book_id
    idx = _indices[book_id]
    
    # Get the pairwise similarity scores of all books with that book
    sim_scores = list(enumerate(_cosine_sim[idx]))
    
    # Sort the books based on the similarity scores (descending)
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # Get the scores of the top_n most similar books (ignoring the book itself)
    # We take top_n + 1 and slice [1:] to exclude the target book itself which is always the most similar (score 1)
    sim_scores = sim_scores[1:top_n+1]
    
    # Get the book indices
    book_indices = [i[0] for i in sim_scores]
    
    # Return the top top_n most similar books
    recommendations = _books_df.iloc[book_indices][['book_id', 'title', 'authors', 'image_url', 'average_rating']]
    return recommendations.to_dict('records')

# Initialize eagerly if desired, or let the first request handle it
# load_data_and_train() 
