#!/usr/bin/env python3
"""Helper: ensure dataset exists, optionally create sample data, run precompute_embeddings and verify FAISS files.

Usage:
  python scripts\init_embeddings.py [--yes]

If dataset is empty the script will ask before creating a small sample dataset. Pass --yes to auto-create.
"""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

def main(auto_yes=False):
    try:
        from create_sample_dataset import create_sample_dataset
    except Exception:
        create_sample_dataset = None

    try:
        from src.utils import load_config
        from src import precompute_embeddings
    except Exception:
        # Try alternative imports when running from different CWD
        sys.path.insert(0, str(ROOT / 'src'))
        try:
            from utils import load_config
            import precompute_embeddings
        except Exception as e:
            print("Could not import project modules. Run this from the project root and ensure packages are available.")
            print(e)
            return 1

    config = load_config()
    if not config:
        print("Could not load config.yaml — aborting.")
        return 1

    dataset_dir = Path(config['PATHS'].get('DATASET_DIR', 'dataset'))
    print(f"Dataset directory: {dataset_dir}")
    dataset_exists = dataset_dir.exists() and any(dataset_dir.iterdir())

    if not dataset_exists:
        print("No dataset found or it's empty.")
        if not create_sample_dataset:
            print("Helper to create a sample dataset is missing (create_sample_dataset.py). Please add images under the dataset/ folder and re-run.")
            return 1
        if auto_yes:
            choice = 'y'
        else:
            choice = input("Create a small sample dataset (3 images) now? [y/N]: ").strip().lower()

        if choice == 'y':
            create_sample_dataset()
        else:
            print("Aborting. Populate dataset/ with per-person subfolders and images, then re-run this script.")
            return 1

    print("Running precompute_embeddings.py — this may take some time (model downloads, embedding generation)...")
    try:
        precompute_embeddings.precompute_embeddings()
    except Exception as e:
        print(f"precompute_embeddings failed: {e}")
        return 1

    emb_dir = Path(config['PATHS'].get('EMBEDDINGS_DIR', 'embeddings'))
    index_path = emb_dir / config['PATHS'].get('FAISS_INDEX_FILE', 'faiss_index.bin')
    labels_path = emb_dir / config['PATHS'].get('LABELS_FILE', 'labels.pkl')

    if index_path.exists() and labels_path.exists():
        print(f"✅ FAISS index and labels created:\n  - {index_path}\n  - {labels_path}")
        return 0
    else:
        print("⛔ FAISS files not found after running precompute. Check the precompute output for errors.")
        return 1


if __name__ == '__main__':
    auto = '--yes' in sys.argv or '-y' in sys.argv
    exit(main(auto_yes=auto))
