import os
import zipfile
import pandas as pd
from kaggle.api.kaggle_api_extended import KaggleApi

DATASET = "zygmunt/goodbooks-10k"
DATA_DIR = "data"

def download_and_load_data():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    api = KaggleApi()
    try:
        api.authenticate()
    except OSError as e:
        print("Error authenticating with Kaggle API. Please ensure your kaggle.json is present in ~/.kaggle/ or KAGGLE_USERNAME and KAGGLE_KEY environment variables are set.")
        print(f"Details: {e}")
        return

    print(f"Downloading dataset {DATASET} to {DATA_DIR}...")
    try:
        api.dataset_download_files(DATASET, path=DATA_DIR, unzip=True)
        print("Download and unzip complete.")
    except Exception as e:
        print(f"Failed to download dataset: {e}")
        return

    # Check for a specific CSV, like books.csv
    books_csv = os.path.join(DATA_DIR, "books.csv")
    if os.path.exists(books_csv):
        print(f"Loading {books_csv}...")
        df = pd.read_csv(books_csv)
        print("\nDataset Head:")
        print(df.head())
    else:
        print("books.csv not found in the downloaded files.")
        print("Files present:", os.listdir(DATA_DIR))

if __name__ == "__main__":
    download_and_load_data()
