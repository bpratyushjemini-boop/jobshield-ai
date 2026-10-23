#!/usr/bin/env python3
"""
Dataset Downloader for JOBSHIELD AI
Downloads the Employment Scam Aegean Dataset (EMSCAD / fake_job_postings.csv)
from verified open-source mirrors.
"""

import os
import sys
import urllib.request
import hashlib

DATASET_URL = "https://huggingface.co/datasets/victor/real-or-fake-fake-jobposting-prediction/resolve/main/fake_job_postings.csv"
BACKUP_URLS = [
    "https://raw.githubusercontent.com/shivp/Fake-Job-Posting-Prediction/master/fake_job_postings.csv",
    "https://raw.githubusercontent.com/diego-v-g/fake-job-detection/main/fake_job_postings.csv",
]

DEST_DIR = os.path.dirname(os.path.abspath(__file__))
DEST_FILE = os.path.join(DEST_DIR, "fake_job_postings.csv")


def download_file(url: str, dest_path: str) -> bool:
    print(f"[*] Attempting download from: {url}")
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"
            },
        )
        with urllib.request.urlopen(req, timeout=60) as response, open(
            dest_path, "wb"
        ) as out_file:
            total_size = response.getheader("Content-Length")
            total_size = int(total_size) if total_size else None
            downloaded = 0
            chunk_size = 1024 * 1024  # 1MB chunks

            while True:
                chunk = response.read(chunk_size)
                if not chunk:
                    break
                out_file.write(chunk)
                downloaded += len(chunk)
                if total_size:
                    percent = (downloaded / total_size) * 100
                    print(
                        f"\r    Downloaded {downloaded / (1024*1024):.2f}MB / {total_size / (1024*1024):.2f}MB ({percent:.1f}%)",
                        end="",
                    )
                else:
                    print(
                        f"\r    Downloaded {downloaded / (1024*1024):.2f}MB", end=""
                    )
            print("\n[+] Download completed successfully!")
            return True
    except Exception as e:
        print(f"\n[-] Failed downloading from {url}: {e}")
        if os.path.exists(dest_path):
            os.remove(dest_path)
        return False


def verify_file(file_path: str) -> bool:
    if not os.path.exists(file_path):
        return False
    size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if size_mb < 5.0:
        print(f"[-] File size ({size_mb:.2f} MB) is too small to be the full dataset.")
        return False
    print(f"[+] Dataset verified: {file_path} ({size_mb:.2f} MB)")
    return True


def main():
    if verify_file(DEST_FILE):
        print("[+] fake_job_postings.csv is already downloaded and verified.")
        return

    urls = [DATASET_URL] + BACKUP_URLS
    for url in urls:
        if download_file(url, DEST_FILE):
            if verify_file(DEST_FILE):
                return

    print("[-] All download sources failed. Please manually place 'fake_job_postings.csv' into backend/data/")
    sys.exit(1)


if __name__ == "__main__":
    main()
