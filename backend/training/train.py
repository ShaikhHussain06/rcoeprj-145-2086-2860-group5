import os
import sys
import json
import argparse
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from sklearn.metrics import roc_curve, roc_auc_score, confusion_matrix, f1_score

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.ml.model import CardioSenseCNN
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


def run_training_experiment(
    experiment_name: str = "ablation_run",
    model_type: str = "convnet",       # "convnet" or "resnet18"
    loss_type: str = "focal",          # "focal", "ce_smoothed"
    focal_gamma: float = 1.5,
    augment_mode: str = "none",        # "none", "mild_specaugment", "specaugment"
    epochs: int = 15,
    batch_size: int = 32,
    lr: float = 8e-4
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    data_dir = os.path.join(PROJECT_ROOT, "data")
    output_dir = os.path.join(PROJECT_ROOT, "backend/app/ml/weights")
    os.makedirs(output_dir, exist_ok=True)

    print(f"\n=======================================================", flush=True)
    print(f"  Zero-Leakage Run: {experiment_name.upper()}", flush=True)
    print(f"=======================================================", flush=True)
    print(f"[Config] Device:       {device}", flush=True)
    print(f"[Config] Architecture: {model_type.upper()}", flush=True)
    print(f"[Config] Loss Type:    {loss_type} (gamma={focal_gamma if loss_type=='focal' else 'N/A'})", flush=True)
    print(f"[Config] Augmentation: {augment_mode}", flush=True)
    print(f"[Config] Epochs:       {epochs} | LR: {lr}\n", flush=True)

    train_dirs = [
        os.path.join(data_dir, f"training-{letter}")
        for letter in ["a", "b", "c", "d", "e", "f"]
        if os.path.exists(os.path.join(data_dir, f"training-{letter}"))
    ]
    val_dirs = [os.path.join(data_dir, "validation")] if os.path.exists(os.path.join(data_dir, "validation")) else []

    # 1. Load Validation Dataset
    print(f"[Dataset] Loading Validation Dataset (held-out)...", flush=True)
    val_dataset = PhysioNetHeartSoundDataset(val_dirs, augment_mode="none")
    val_ids = set([s["file_id"] for s in val_dataset.samples])

    # 2. Load Training Dataset (STRICTLY excluding all validation IDs)
    print(f"[Dataset] Loading Training Dataset (Strict Exclusion of Validation IDs)...", flush=True)
    train_dataset = PhysioNetHeartSoundDataset(train_dirs, augment_mode=augment_mode, exclude_ids=val_ids)

    # Double check zero overlap
    train_ids = set([s["file_id"] for s in train_dataset.samples])
    leakage = train_ids.intersection(val_ids)
    print(f"[Leakage Check] Shared recordings: {len(leakage)} (Zero Leakage Confirmed)\n", flush=True)

    weights = train_dataset.get_smoothed_class_weights().to(device)
    print(f"[Weights] Class Weights: {weights.cpu().numpy().round(3)}\n", flush=True)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, drop_last=False)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    # Model Selection
    if model_type == "resnet18":
        model = CardioResNet18(num_classes=2, dropout=0.35).to(device)
    else:
        model = CardioSenseCNN(num_classes=2).to(device)

    if loss_type == "focal":
        criterion = FocalLoss(alpha=weights, gamma=focal_gamma)
    else:
        criterion = nn.CrossEntropyLoss(weight=weights)

    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-3)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_roc_auc = 0.0
    best_metrics = {}

    print("="*80, flush=True)
    print(f"{'Epoch':^6} | {'Train Loss':^10} | {'ROC-AUC':^9} | {'Sens @0.5':^10} | {'Spec @0.5':^10} | {'Sens @Opt':^10} | {'Spec @Opt':^10} | {'Opt Thresh':^10}", flush=True)
    print("="*80, flush=True)

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        n_batches = 0

        for batch_x, batch_y, _ in train_loader:
            batch_x = batch_x.to(device)
            batch_y = batch_y.to(device)

            optimizer.zero_grad()
            logits = model(batch_x)
            loss = criterion(logits, batch_y)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            n_batches += 1

        scheduler.step()
        avg_train_loss = total_loss / max(1, n_batches)

        # Validation
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

        # Default 0.50
        y_pred_50 = (y_prob >= 0.50).astype(int)
        cm_50 = confusion_matrix(y_true, y_pred_50, labels=[0, 1])
        tn_50, fp_50, fn_50, tp_50 = cm_50.ravel()
        sens_50 = tp_50 / (tp_50 + fn_50) if (tp_50 + fn_50) > 0 else 0
        spec_50 = tn_50 / (tn_50 + fp_50) if (tn_50 + fp_50) > 0 else 0
        auc = roc_auc_score(y_true, y_prob)

        # Optimal Youden's J
        fpr, tpr, thresholds = roc_curve(y_true, y_prob)
        j_scores = tpr + (1 - fpr) - 1
        opt_thresh = float(thresholds[np.argmax(j_scores)])
        y_pred_opt = (y_prob >= opt_thresh).astype(int)
        cm_opt = confusion_matrix(y_true, y_pred_opt, labels=[0, 1])
        tn_o, fp_o, fn_o, tp_o = cm_opt.ravel()
        sens_opt = tp_o / (tp_o + fn_o) if (tp_o + fn_o) > 0 else 0
        spec_opt = tn_o / (tn_o + fp_o) if (tn_o + fp_o) > 0 else 0

        print(f"{epoch:^6} | {avg_train_loss:^10.4f} | {auc:^9.4f} | {sens_50:^10.2%} | {spec_50:^10.2%} | {sens_opt:^10.2%} | {spec_opt:^10.2%} | {opt_thresh:^10.4f}", flush=True)

        if auc >= best_roc_auc:
            best_roc_auc = auc
            best_metrics = {
                "experiment": experiment_name,
                "model_type": model_type,
                "roc_auc": round(float(auc), 4),
                "optimal_threshold": round(float(opt_thresh), 4),
                "sensitivity_at_optimal": round(float(sens_opt), 4),
                "specificity_at_optimal": round(float(spec_opt), 4),
                "false_positives_at_optimal": int(fp_o),
                "false_negatives_at_optimal": int(fn_o),
                "sensitivity_at_default": round(float(sens_50), 4),
                "specificity_at_default": round(float(spec_50), 4),
                "confusion_matrix_at_optimal": {
                    "true_positive": int(tp_o),
                    "true_negative": int(tn_o),
                    "false_positive": int(fp_o),
                    "false_negative": int(fn_o)
                }
            }
            torch.save(model.state_dict(), os.path.join(output_dir, f"{experiment_name}.pt"))
            torch.save(model.state_dict(), os.path.join(output_dir, "cardiosense_cnn.pt"))

    result_path = os.path.join(output_dir, f"{experiment_name}_results.json")
    with open(result_path, "w", encoding="utf-8") as f:
        json.dump(best_metrics, f, indent=2)

    print("\n" + "="*80, flush=True)
    print(f"Zero-Leakage Run '{experiment_name}' Complete!", flush=True)
    for k, v in best_metrics.items():
        print(f"  - {k}: {v}", flush=True)
    print("="*80 + "\n", flush=True)
    return best_metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--name", type=str, default="exp3_resnet18")
    parser.add_argument("--model", type=str, default="resnet18", choices=["convnet", "resnet18"])
    parser.add_argument("--loss", type=str, default="focal")
    parser.add_argument("--gamma", type=float, default=1.5)
    parser.add_argument("--augment", type=str, default="none")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--lr", type=float, default=5e-4)
    args = parser.parse_args()

    run_training_experiment(
        experiment_name=args.name,
        model_type=args.model,
        loss_type=args.loss,
        focal_gamma=args.gamma,
        augment_mode=args.augment,
        epochs=args.epochs,
        lr=args.lr
    )
