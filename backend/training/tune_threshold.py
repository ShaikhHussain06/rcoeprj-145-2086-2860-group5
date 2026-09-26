import os
import sys
import numpy as np
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
from sklearn.metrics import roc_curve, roc_auc_score, confusion_matrix, precision_score, recall_score, f1_score, accuracy_score

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.ml.model import CardioSenseCNN
from backend.training.dataset import PhysioNetHeartSoundDataset


def tune_threshold_analysis():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    weights_path = os.path.join(PROJECT_ROOT, "backend/app/ml/weights/cardiosense_cnn.pt")
    val_dir = [os.path.join(PROJECT_ROOT, "data/validation")]

    print(f"\n=======================================================")
    print(f"  Step 1: Threshold Calibration via Youden's J Statistic")
    print(f"=======================================================")
    print(f"Compute Device: {device}")
    print(f"Evaluating Model Weights: {weights_path}")

    # Load validation dataset
    val_dataset = PhysioNetHeartSoundDataset(val_dir, augment=False)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)

    # Load model
    model = CardioSenseCNN(num_classes=2).to(device)
    model.load_state_dict(torch.load(weights_path, map_location=device))
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

    # Baseline with default 0.50 threshold
    y_pred_default = (y_prob >= 0.50).astype(int)
    cm_def = confusion_matrix(y_true, y_pred_default, labels=[0, 1])
    tn_d, fp_d, fn_d, tp_d = cm_def.ravel()
    sens_d = tp_d / (tp_d + fn_d)
    spec_d = tn_d / (tn_d + fp_d)
    f1_d = f1_score(y_true, y_pred_default, zero_division=0)
    auc = roc_auc_score(y_true, y_prob)

    print(f"\n--- Baseline (Default Threshold = 0.50) ---")
    print(f"  Sensitivity:  {sens_d:^6.2%} (TP: {tp_d} / {tp_d+fn_d})")
    print(f"  Specificity:  {spec_d:^6.2%} (TN: {tn_d} / {tn_d+fp_d}, FP: {fp_d})")
    print(f"  F1-Score:     {f1_d:.4f}")
    print(f"  ROC-AUC:      {auc:.4f}")

    # Compute ROC Curve & Youden's J Statistic (J = Sensitivity + Specificity - 1)
    fpr, tpr, thresholds = roc_curve(y_true, y_prob)
    # Specificity = 1 - FPR, Sensitivity = TPR
    j_scores = tpr + (1 - fpr) - 1
    best_idx = np.argmax(j_scores)
    optimal_threshold = thresholds[best_idx]

    # Evaluate at optimal threshold
    y_pred_opt = (y_prob >= optimal_threshold).astype(int)
    cm_opt = confusion_matrix(y_true, y_pred_opt, labels=[0, 1])
    tn_o, fp_o, fn_o, tp_o = cm_opt.ravel()
    sens_o = tp_o / (tp_o + fn_o)
    spec_o = tn_o / (tn_o + fp_o)
    f1_o = f1_score(y_true, y_pred_opt, zero_division=0)

    print(f"\n--- Calibrated via Youden's J (Optimal Threshold = {optimal_threshold:.4f}) ---")
    print(f"  Sensitivity:  {sens_o:^6.2%} (TP: {tp_o} / {tp_o+fn_o})")
    print(f"  Specificity:  {spec_o:^6.2%} (TN: {tn_o} / {tn_o+fp_o}, FP: {fp_o})")
    print(f"  F1-Score:     {f1_o:.4f}")
    print(f"  ROC-AUC:      {auc:.4f}")
    print(f"  False Positives dropped from {fp_d} down to {fp_o} (saved {fp_d - fp_o} false alarms!)")
    print(f"=======================================================\n")


if __name__ == "__main__":
    tune_threshold_analysis()
