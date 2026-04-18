#!/bin/bash
# ============================================================
#  FEDGE 2.O — GitHub Repo Setup Script
#  Run this once in your terminal to create the GitHub repo
#  and push your first commit.
# ============================================================

set -e

REPO_NAME="fedge-2-credit-game"
GITHUB_USER=""   # <-- Fill in your GitHub username

# ── 1. Make sure we're in the right folder ──────────────────
echo "📁 Setting up git in current directory..."
git init -b main
git config user.email "cryptofedge@gmail.com"
git config user.name "Fellito"

# ── 2. Stage everything ─────────────────────────────────────
echo "📦 Staging files..."
git add .
git status

# ── 3. First commit ─────────────────────────────────────────
echo "✅ Creating initial commit..."
git commit -m "🚀 Initial commit — FEDGE 2.O Credit Education Mobile Game

- React Native (Expo) project scaffold
- TypeScript + Zustand state management
- Credit score engine (FICO-style simulator)
- Game store with XP, levels, FEDGE Coins
- Navigation structure
- GitHub Actions CI workflow
- Game Design Document
- Full .gitignore for React Native"

# ── 4. Create GitHub repo & push ────────────────────────────
echo "🌐 Creating GitHub repo..."
gh repo create "$REPO_NAME" \
  --public \
  --description "FEDGE 2.O Credit Education Mobile Game — Learn, build, and master your credit score" \
  --push \
  --source=.

echo ""
echo "============================================"
echo "✅ Done! Your repo is live at:"
echo "   https://github.com/$GITHUB_USER/$REPO_NAME"
echo "============================================"
