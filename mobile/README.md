# 📱 CardioSense Mobile — Android / iOS App

CardioSense Mobile is the official cross-platform mobile client for the CardioSense AI Phonocardiogram (PCG) auscultation platform. Built with **React Native**, **Expo**, and **TypeScript strict mode**, it communicates with the existing FastAPI backend over your local network or a deployed cloud endpoint.

---

## ⚡ Prerequisites

1. **Windows PC**:
   - Node.js (v20.x or v22.x LTS): [https://nodejs.org/](https://nodejs.org/)
   - Python 3.12+ (or `uv` package manager)
2. **Physical Mobile Device (Android or iOS)**:
   - Install **Expo Go** from the Google Play Store or Apple App Store.
   - Connect your phone and PC to the **same Wi-Fi network**.

---

## 🚀 Running the App (Step-by-Step)

### Step 1: Start the Backend Server (Terminal 1)
Open a terminal in the repository root:
```powershell
cd "c:\Users\Mohammed Hussain\cardiosense-ai"
uv run uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*(The `--host 0.0.0.0` is required so your phone can reach port 8000 over Wi-Fi).*

### Step 2: Configure Environment IP
The `.env` file in `mobile/` is pre-configured with your PC's Wi-Fi IP (`192.168.1.106`):
```ini
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.106:8000
```
*(If your IP changes in the future, run `ipconfig` and update this line).*

### Step 3: Start the Expo Development Server (Terminal 2)
Open a second terminal:
```powershell
cd "c:\Users\Mohammed Hussain\cardiosense-ai\mobile"
npm install
npx expo start
```

### Step 4: Open on Your Phone
1. A **QR code** will appear in your terminal.
2. Open the **Expo Go** app on your Android phone and tap **"Scan QR code"**.
   *(On iPhone, open the default Camera app and tap the Expo link)*.
3. The app will bundle and load immediately!

---

## 🧪 Acceptance Checks

1. **Home Screen**:
   - Look at the top status pill: It should show **"Backend Online (CPU)"** with a green dot.
2. **Benchmark Auscultation**:
   - Tap **"Start Auscultation"** or switch to the **Studio** tab.
   - Select **"Normal Heart Sound (Sample a0007)"** -> tap **"Run Auscultation Analysis"**.
   - Result: Shows **Normal** (~34.1% abnormal, 65.9% confidence).
   - Select **"Severe Pathological Murmur (Sample a0006)"** -> tap **"Run Auscultation Analysis"**.
   - Result: Shows **Marked Pathology** (~92.1% abnormal).
3. **Patient Records Tab**:
   - Pull-to-refresh to see records persisted in SQLite database.
4. **Model QA Tab**:
   - Displays ROC-AUC (0.8041), Sensitivity (82.78%), Specificity (63.33%), and confusion matrix.

---

## 🏗️ Building a Standalone Android APK (via EAS Build)

To generate an installable `.apk` file that runs without Expo Go:

1. Install EAS CLI globally:
   ```powershell
   npm install -g eas-cli
   ```
2. Log in with your free Expo account:
   ```powershell
   eas login
   ```
3. Run the cloud build for an APK:
   ```powershell
   cd mobile
   eas build -p android --profile preview
   ```
4. EAS will provide a direct download link to install the `.apk` on your Android phone.

---

## ⚖️ Clinical Disclaimer
CardioSense is an automated acoustic screening and investigational decision-support platform. It does NOT provide a definitive diagnosis and must be clinically correlated with physical examination, stethoscope auscultation, and echocardiography by a licensed healthcare clinician.
