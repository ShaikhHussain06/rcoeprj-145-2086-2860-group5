import os
import sys
import json
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from sklearn.metrics import roc_curve, roc_auc_score, confusion_matrix

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.ml.resnet import CardioResNet18
from backend.training.dataset import PhysioNetHeartSoundDataset


class FocalLoss(nn.Module):
    def __init__(self, alpha: torch.Tensor = None, gamma: float = 1.5):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma

    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        ce_loss = F.cross_entropy(inputs, targets, reduction="none", weight=self.alpha)
        pt = torch.exp(-ce_loss)
        focal_loss = ((1.0 - pt) ** self.gamma) * ce_loss
        return focal_loss.mean()


def set_seed(seed: int):
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    np.random.seed(seed)


def train_and_eval_seed(seed: int, augment_mode: str = "none", epochs: int = 14, lr: float = 5e-4):
    set_seed(seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    data_dir = os.path.join(PROJECT_ROOT, "data")

    train_dirs = [os.path.join(data_dir, f"training-{l}") for l in ["a","b","c","d","e","f"] if os.path.exists(os.path.join(data_dir, f"training-{l}"))]
    val_dirs = [os.path.join(data_dir, "validation")]

    val_dataset = PhysioNetHeartSoundDataset(val_dirs, augment_mode="none")
    val_ids = set([s["file_id"] for s in val_dataset.samples])
    train_dataset = PhysioNetHeartSoundDataset(train_dirs, augment_mode=augment_mode, exclude_ids=val_ids)

    weights = train_dataset.get_smoothed_class_weights().to(device)

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, drop_last=False)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)

    model = CardioResNet18(num_classes=2, dropout=0.35).to(device)
    criterion = FocalLoss(alpha=weights, gamma=1.5)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-3)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_auc = 0.0
    best_results = {}
    best_probs = None

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        n_batches = 0

        for batch_x, batch_y, _ in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            logits = model(batch_x)
            loss = criterion(logits, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            n_batches += 1

        scheduler.step()

        # Eval
        model.eval()
        all_targets = []
        all_probs = []

        with torch.no_grad():
            for batch_x, batch_y, _ in val_loader:
                batch_x = batch_x.to(device)
                logits = model(batch_x)
                probs = F.softmax(logits, dim=1)
                all_probs.extend(probs[:, 1].cpu().numpy())
                all_targets.extend(batch_y.numpy())

        y_true = np.array(all_targets)
        y_prob = np.array(all_probs)
        auc = roc_auc_score(y_true, y_prob)

        fpr, tpr, thresholds = roc_curve(y_true, y_prob)
        j_scores = tpr + (1 - fpr) - 1
        opt_thresh = float(thresholds[np.argmax(j_scores)])

        y_pred_opt = (y_prob >= opt_thresh).astype(int)
        cm = confusion_matrix(y_true, y_pred_opt, labels=[0, 1])
        tn, fp, fn, tp = cm.ravel()
        sens = tp / (tp + fn)
        spec = tn / (tn + fp)

        if auc >= best_auc:
            best_auc = auc
            best_probs = (y_true, y_prob)
            best_results = {
                "seed": seed,
                "augment": augment_mode,
                "roc_auc": round(float(auc), 4),
                "optimal_threshold": round(float(opt_thresh), 4),
                "sensitivity": round(float(sens), 4),
                "specificity": round(float(spec), 4),
                "false_positives": int(fp),
                "false_negatives": int(fn)
            }

    # Probability separation sanity check
    y_true, y_prob = best_probs
    norm_probs = y_prob[y_true == 0]
    abnorm_probs = y_prob[y_true == 1]

    best_results["prob_stats"] = {
        "normal_cases_mean_p_abnormal": round(float(np.mean(norm_probs)), 4),
        "normal_cases_median_p_abnormal": round(float(np.median(norm_probs)), 4),
        "abnormal_cases_mean_p_abnormal": round(float(np.mean(abnorm_probs)), 4),
        "abnormal_cases_median_p_abnormal": round(float(np.median(abnorm_probs)), 4),
    }

    return best_results


def run_multi_seed_benchmark():
    print(f"\n=======================================================", flush=True)
    print(f"  Multi-Seed Stability & Probability Separation Audit", flush=True)
    print(f"=======================================================\n", flush=True)

    seeds = [42, 1337, 2026]
    results_no_aug = []
    results_mild_aug = []

    print("--- 1. CardioResNet-18 (No Augmentation across 3 Seeds) ---", flush=True)
    for s in seeds:
        res = train_and_eval_seed(seed=s, augment_mode="none")
        results_no_aug.append(res)
        print(f"  Seed {s:4d} -> ROC-AUC: {res['roc_auc']:.4f} | Sens: {res['sensitivity']:.2%} | Spec: {res['specificity']:.2%} | Opt tau: {res['optimal_threshold']:.4f}", flush=True)
        print(f"             Prob Separation: Normal Mean P(abn)={res['prob_stats']['normal_cases_mean_p_abnormal']:.3f} vs Abnormal Mean P(abn)={res['prob_stats']['abnormal_cases_mean_p_abnormal']:.3f}", flush=True)

    print("\n--- 2. CardioResNet-18 (Mild SpecAugment across 3 Seeds) ---", flush=True)
    for s in seeds:
        res = train_and_eval_seed(seed=s, augment_mode="mild_specaugment")
        results_mild_aug.append(res)
        print(f"  Seed {s:4d} -> ROC-AUC: {res['roc_auc']:.4f} | Sens: {res['sensitivity']:.2%} | Spec: {res['specificity']:.2%} | Opt tau: {res['optimal_threshold']:.4f}", flush=True)
        print(f"             Prob Separation: Normal Mean P(abn)={res['prob_stats']['normal_cases_mean_p_abnormal']:.3f} vs Abnormal Mean P(abn)={res['prob_stats']['abnormal_cases_mean_p_abnormal']:.3f}", flush=True)

    # Statistical Summary
    aucs_no_aug = [r["roc_auc"] for r in results_no_aug]
    sens_no_aug = [r["sensitivity"] for r in results_no_aug]
    spec_no_aug = [r["specificity"] for r in results_no_aug]

    aucs_aug = [r["roc_auc"] for r in results_mild_aug]
    sens_aug = [r["sensitivity"] for r in results_mild_aug]
    spec_aug = [r["specificity"] for r in results_mild_aug]

    print("\n=======================================================", flush=True)
    print("  FINAL STABILITY BENCHMARK (Mean ± Std)", flush=True)
    print("=======================================================", flush=True)
    print(f"ResNet-18 (No Aug):        ROC-AUC = {np.mean(aucs_no_aug):.4f} ± {np.std(aucs_no_aug):.4f} | Sens = {np.mean(sens_no_aug):.2%} ± {np.std(sens_no_aug):.2%} | Spec = {np.mean(spec_no_aug):.2%} ± {np.std(spec_no_aug):.2%}", flush=True)
    print(f"ResNet-18 (Mild SpecAug):  ROC-AUC = {np.mean(aucs_aug):.4f} ± {np.std(aucs_aug):.4f} | Sens = {np.mean(sens_aug):.2%} ± {np.std(sens_aug):.2%} | Spec = {np.mean(spec_aug):.2%} ± {np.std(spec_aug):.2%}", flush=True)
    print("=======================================================\n", flush=True)


if __name__ == "__main__":
    run_multi_seed_benchmark()
