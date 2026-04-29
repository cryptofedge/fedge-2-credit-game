# FEDGE 2.O — Credit Education Mobile Game

> **Learn it. Build it. Own it.** — A mobile game powered by FEDGE 2.O that helps users understand how to build, fix, and maintain their credit score to the highest standard.

---

## 🎯 Overview

FEDGE 2.O is an educational mobile game for iOS and Android that gamifies the journey to financial freedom through credit mastery. Players progress through levels, complete real-world credit challenges, and earn rewards — all while building genuine financial literacy.

---

## 📱 Features

- **Credit Score Simulator** — See how real actions impact your score in real time
- **Gamified Learning Modules** — Quizzes, missions, and storylines about credit fundamentals
- **FEDGE Score System** — Custom in-game scoring that mirrors real credit bureau logic
- **Credit Repair Path** — Step-by-step guided missions for users rebuilding credit
- **Progress Dashboard** — Visual tracking of in-game credit health and achievements
- **Daily Challenges** — Habit-building streaks tied to real credit best practices
- **Leaderboard** — Compete with friends on the path to perfect credit

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo) |
| Language | TypeScript |
| State Management | Zustand |
| Navigation | React Navigation v6 |
| Backend | Supabase |
| Notifications | Expo Notifications |
| Analytics | Mixpanel |
| CI/CD | GitHub Actions |

---

## 🗂️ Project Structure

```
fedge-2-credit-game/
├── src/
│   ├── screens/          # App screens (Home, Game, Profile, etc.)
│   ├── components/       # Reusable UI components
│   ├── navigation/       # Navigation config and stacks
│   ├── store/            # Zustand state stores
│   ├── services/         # API calls, Supabase client
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions, credit score logic
│   └── assets/           # Images, fonts, sounds
├── docs/                 # Game design docs, architecture notes
├── design/               # Wireframes, mockups, brand assets
├── .github/
│   ├── workflows/        # GitHub Actions CI/CD
│   └── ISSUE_TEMPLATE/   # Bug & feature request templates
└── app.json              # Expo config
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/fedge-2-credit-game.git
cd fedge-2-credit-game

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

---

## 📋 Roadmap

- [x] Project setup & architecture
- [ ] Core game engine & credit simulator
- [ ] Onboarding flow
- [ ] Module 1: Credit Score Basics
- [ ] Module 2: Credit Repair Missions
- [ ] Module 3: Building Credit from Scratch
- [ ] Leaderboard & social features
- [ ] App Store & Google Play launch

---

## 🤝 Contributing

This project is powered by FEDGE 2.O. For contribution guidelines, see [CONTRIBUTING.md](docs/CONTRIBUTING.md).

---

## 📄 License

© 2026 FEDGE 2.O. All rights reserved.

---

## License & Brand

<img src="https://raw.githubusercontent.com/cryptofedge/FEDGE2.O/main/FEDGE-2O-Logo.png" alt="FEDGE 2.O Logo" width="120" height="120">

### FEDGE 2.O | Powered by Rafael Fellito Rodriguez and Eclat Universe

**© 2026 FEDGE 2.O. All rights reserved.**

This project is part of the FEDGE 2.O ecosystem and is protected under full intellectual property rights reserved by Rafael Fellito Rodriguez and Eclat Universe.

### License Details

- **Type:** Proprietary - All Rights Reserved
- **Owner:** Rafael Fellito Rodriguez and Eclat Universe
- **Brand:** FEDGE 2.O
- **Status:** Protected and Confidential

### Key Rights

✓ **All intellectual property retained**
✓ **Reproduction prohibited without permission**
✓ **Distribution rights reserved**
✓ **Derivative works not permitted**
✓ **Commercial use requires authorization**

### Attribution

When referencing this software, please include:
- FEDGE 2.O
- Rafael Fellito Rodriguez
- Eclat Universe

### Inquiries

For licensing, partnerships, or usage permissions:
Email: **cryptofedge@gmail.com**

---

**Learn more:** [Full License](LICENSE)
