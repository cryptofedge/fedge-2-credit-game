# FEDGE 2.O — App Store & Google Play Submission Guide
Complete step-by-step PowerShell instructions for Fellito Rodriguez

---

## PHASE 1 — One-Time Account Setup

### Step 1 — Create an Expo Account (if you don't have one)
1. Go to https://expo.dev and click "Sign Up"
2. Use email: cryptofedge@gmail.com
3. Verify your email

### Step 2 — Create an Apple Developer Account
1. Go to https://developer.apple.com/programs/
2. Click "Enroll" — costs **$99/year**
3. Sign in with your Apple ID (or create one)
4. Complete enrollment (takes 24–48 hours to approve)
5. Once approved, note your **Team ID** (10-character code like "ABCD123456")
   - Find it at: https://developer.apple.com/account → Membership → Team ID

### Step 3 — Create a Google Play Developer Account
1. Go to https://play.google.com/console
2. Click "Create Developer Account" — costs **$25 one-time fee**
3. Use email: cryptofedge@gmail.com
4. Complete identity verification
5. Accept the Developer Distribution Agreement

---

## PHASE 2 — Install EAS CLI on Your Computer

Open PowerShell as Administrator and run these commands ONE BY ONE:

```powershell
# Step 1 — Install Node.js (if not already installed)
# Download from: https://nodejs.org/en/download
# Choose the LTS version, run the installer, restart PowerShell

# Step 2 — Verify Node is installed
node --version
# Should show v18.x.x or higher

# Step 3 — Install EAS CLI globally
npm install -g eas-cli

# Step 4 — Verify EAS is installed
eas --version
# Should show 5.x.x or higher

# Step 5 — Log in to your Expo account
eas login
# Enter your Expo email and password when prompted
```

---

## PHASE 3 — Link Your App to Expo

```powershell
# Navigate to your project folder
cd "C:\Users\Fellito Rodriguez\Downloads\FEDGE 2.O Credit Game\FEDGE 2.O Credit Education Mobile Game"

# Initialize EAS for this project
# This creates a project on expo.dev and adds the projectId to app.json
eas init

# When prompted:
# - "What would you like to name your project?" → FEDGE 2.O
# - "Would you like to create a new project?" → Y

# After this runs, your app.json will be updated with a real projectId
# Commit the update:
git add app.json
git commit -m "chore: link app to EAS project"
git push
```

---

## PHASE 4 — Build for Android (Google Play)

Android is easier — start here.

```powershell
# Step 1 — Create your Android keystore (signing key)
# EAS will handle this for you automatically. Just run:
eas credentials

# Select: Android → production → Generate new keystore
# EAS stores it securely on their servers
# IMPORTANT: Save the keystore password it shows you somewhere safe

# Step 2 — Build the production Android App Bundle (.aab)
eas build --platform android --profile production

# This will:
# - Upload your code to Expo's build servers
# - Compile the React Native app
# - Sign it with your keystore
# - Takes 10-20 minutes
# - Shows a URL to track progress

# Step 3 — Download the .aab file from the URL shown
# Or find it at: https://expo.dev → Projects → FEDGE 2.O → Builds
```

### Submit to Google Play

```powershell
# Step 1 — Create your app in Google Play Console first:
# Go to https://play.google.com/console
# Click "Create app"
# Fill in:
#   App name: FEDGE 2.O - Credit Education Game
#   Default language: English (United States)
#   App or game: Game
#   Free or paid: Free
# Click "Create app"

# Step 2 — Create a Google Service Account for automated submissions
# In Google Play Console:
#   Settings → API access → Create new service account
#   Follow the Google Cloud Console link it shows
#   Create service account → Download the JSON key file
#   Save it as: google-service-account.json
#   Put it in your project folder (same folder as package.json)
#   IMPORTANT: Never commit this file to git (it's in .gitignore)

# Step 3 — Submit to internal track
eas submit --platform android --profile production
# Follow the prompts — it will upload to Google Play internal testing
```

---

## PHASE 5 — Build for iOS (App Store)

iOS requires more setup but EAS handles most of it.

```powershell
# Step 1 — Set up iOS credentials
# EAS can automatically create your provisioning profile and certificate
eas credentials

# Select: iOS → production
# When asked: "Generate new certificate" → Y
# EAS will log into your Apple account to create the certificate
# You'll need to enter your Apple ID and password

# Step 2 — Build the production iOS app (.ipa)
eas build --platform ios --profile production

# First time it will ask for:
#   Apple ID: cryptofedge@gmail.com
#   Team ID: (your 10-char Apple Team ID from Phase 1)
# Takes 15-25 minutes

# Step 3 — Create your app in App Store Connect first:
# Go to https://appstoreconnect.apple.com
# Click "+" → New App
# Fill in:
#   Platform: iOS
#   Name: FEDGE 2.O - Credit Education Game
#   Primary Language: English (U.S.)
#   Bundle ID: com.fedge2.creditgame (select from dropdown)
#   SKU: fedge2creditgame
# Click "Create"
# Note the App Store Connect App ID (number in the URL)

# Step 4 — Update eas.json with your real IDs
# Open eas.json and replace:
#   "YOUR_APP_STORE_CONNECT_APP_ID" → the number from App Store Connect URL
#   "YOUR_APPLE_TEAM_ID" → your 10-char Team ID

# Step 5 — Submit to TestFlight
eas submit --platform ios --profile production
# This uploads to TestFlight for internal testing
```

---

## PHASE 6 — Build Both Platforms at Once

Once you've done Phases 4 and 5 once, future builds are one command:

```powershell
cd "C:\Users\Fellito Rodriguez\Downloads\FEDGE 2.O Credit Game\FEDGE 2.O Credit Education Mobile Game"

# Build both platforms simultaneously
eas build --platform all --profile production

# Submit both after builds complete
eas submit --platform all --profile production
```

---

## PHASE 7 — App Store Listing Content

When filling out your App Store / Google Play listing, use this content:

**App Name:** FEDGE 2.O - Credit Education Game

**Short Description (80 chars):**
Master your credit score with real-life scenarios and expert lessons.

**Full Description:**
FEDGE 2.O turns credit education into an addictive game. Learn how to build, fix, and maintain an 800+ credit score through:

• 5+ mission-based lessons covering every FICO factor
• Real-life credit scenarios — see exactly what happens when you miss a payment or max out a card
• Live credit score simulator — adjust any factor and watch your score move in real time
• Animated score gauge with instant visual feedback
• Achievement system, XP rewards, and leaderboard
• Ghost Mode — learn anonymously without connecting real accounts

Whether you're building credit from scratch, recovering from past mistakes, or optimizing an already-good score, FEDGE 2.O gives you the knowledge to take control.

**Keywords:** credit score, FICO, credit education, credit repair, financial literacy, credit builder

**Category:** Education / Finance

**Age Rating:** 4+ (no objectionable content)

**Price:** Free

---

## PHASE 8 — After You're Live

```powershell
# Check build status anytime
eas build:list

# View submission status
eas submit:list

# Trigger a new build after code changes
eas build --platform all --profile production
```

---

## Quick Reference — Most Used Commands

| What you want to do | Command |
|---|---|
| Log in to EAS | `eas login` |
| Build Android only | `eas build --platform android --profile production` |
| Build iOS only | `eas build --platform ios --profile production` |
| Build both | `eas build --platform all --profile production` |
| Submit Android | `eas submit --platform android --profile production` |
| Submit iOS | `eas submit --platform ios --profile production` |
| See all builds | `eas build:list` |
| Manage credentials | `eas credentials` |
| Check EAS version | `eas --version` |

---

## Costs Summary

| Service | Cost |
|---|---|
| Apple Developer Program | $99/year |
| Google Play Developer | $25 one-time |
| Expo EAS Build (Free tier) | 30 builds/month free |
| Expo EAS Build (Production tier) | $29/month (unlimited) |

Start with the free tier — 30 builds/month is more than enough while developing.
