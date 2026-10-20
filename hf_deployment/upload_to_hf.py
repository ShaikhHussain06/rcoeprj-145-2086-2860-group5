"""
CardioSense — Hugging Face Hub Deployment Script
=================================================
Steps:
  1. Log in: run `huggingface-cli login` in your terminal and paste your HF token
     OR set env var:  set HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
  2. Set your HF username below (REPO_OWNER)
  3. Run:  python hf_deployment/upload_to_hf.py

The script creates/updates the repo and uploads all required files.
"""

import os
import sys
import shutil
from pathlib import Path

# ===========================================================================
# CONFIGURATION — EDIT THESE
# ===========================================================================
REPO_OWNER = "maviya25"             # Your Hugging Face username
REPO_NAME  = "cardiosense-resnet18-pcg"  # The model repository name
REPO_ID    = f"{REPO_OWNER}/{REPO_NAME}"
PRIVATE    = False                  # Set True to keep the model private
# ===========================================================================

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
DEPLOY_DIR   = Path(__file__).parent
WEIGHTS_SRC  = PROJECT_ROOT / "backend" / "app" / "ml" / "weights"

FILES_TO_UPLOAD = {
    # (source_path, filename_on_HF)
    WEIGHTS_SRC  / "cardiosense_cnn.pt"         : "cardiosense_resnet18.pt",
    WEIGHTS_SRC  / "eval_metrics.json"           : "eval_metrics.json",
    WEIGHTS_SRC  / "confusion_matrix.png"        : "confusion_matrix.png",
    DEPLOY_DIR   / "cardio_resnet.py"            : "cardio_resnet.py",
    DEPLOY_DIR   / "README.md"                   : "README.md",
}



def main():
    try:
        from huggingface_hub import HfApi, login, create_repo
    except ImportError:
        print("❌ huggingface_hub not installed. Run: pip install huggingface_hub")
        sys.exit(1)

    # Load token from .env file or environment variable
    token = os.environ.get("HF_TOKEN")
    if not token:
        env_path = PROJECT_ROOT / ".env"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                line = line.strip()
                if line.startswith("HF_TOKEN="):
                    token = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break

    if not token:
        print("[ERROR] No HF_TOKEN found. Add it to .env as:  HF_TOKEN=hf_xxx")
        sys.exit(1)

    # Force override any stale system env var
    os.environ["HF_TOKEN"] = token
    login(token=token, add_to_git_credential=False)
    print("[OK] Logged in successfully")

    api = HfApi()

    # Create or verify repo exists
    print(f"\n📦 Creating/verifying repo: {REPO_ID}")
    try:
        create_repo(
            repo_id=REPO_ID,
            repo_type="model",
            private=PRIVATE,
            exist_ok=True
        )
        print(f"[OK] Repo ready: https://huggingface.co/{REPO_ID}")
    except Exception as e:
        print(f"[ERROR] Repo creation failed: {e}")
        sys.exit(1)

    # Upload all files
    print(f"\n[INFO] Uploading {len(FILES_TO_UPLOAD)} files...\n")
    for src_path, hf_filename in FILES_TO_UPLOAD.items():
        if not src_path.exists():
            print(f"  [SKIP] Not found: {src_path}")
            continue
        size_mb = src_path.stat().st_size / 1024 / 1024
        print(f"  -> Uploading {hf_filename} ({size_mb:.1f} MB)...", end=" ", flush=True)
        try:
            api.upload_file(
                path_or_fileobj=str(src_path),
                path_in_repo=hf_filename,
                repo_id=REPO_ID,
                repo_type="model",
                commit_message=f"Upload {hf_filename}"
            )
            print("OK")
        except Exception as e:
            print(f"\n  [ERROR] Failed to upload {hf_filename}: {e}")

    print(f"\n[DONE] Deployment complete!")
    print(f"   Model page: https://huggingface.co/{REPO_ID}")
    print(f"\n   Users can load model:")
    print(f"   hf_hub_download(repo_id='{REPO_ID}', filename='cardiosense_resnet18.pt')")


if __name__ == "__main__":
    main()
