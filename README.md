# CST SmartDesk App

![Build Status](https://img.shields.io/badge/build-private-blue?style=flat-square)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=flat-square)
![License](https://img.shields.io/badge/license-Internal%20Use%20Only-red?style=flat-square)

## 🎯 Purpose

A centralized productivity toolkit designed to support Asurion CST (Customer Support Technology) Experts by organizing:

- **Scripting Resources**: Automated workflows and templates for common support scenarios
- **Escalation Workflows**: Streamlined processes for complex case management
- **Bilingual Tools**: Spanish/English translation assistance and templates
- **Productivity Documentation**: Best practices, troubleshooting guides, and reference materials
- **AI-Powered Assistance**: Copilot integration for intelligent content generation

## 🔒 Data Privacy & Security

**Important**: This application contains **no sensitive customer data** or proprietary information. All tools and resources are designed to enhance productivity while maintaining strict data privacy standards.

- No customer PII (Personal Identifiable Information) is stored
- No internal credentials or access tokens
- No proprietary Asurion documentation or screenshots
- Only public resources and general workflow templates

## 🚀 Features

- **Modern Dashboard Interface**: Card-based layout for easy navigation
- **Copilot Workspace**: AI-powered content generation and assistance
- **Multi-language Support**: English and Spanish interface options
- **Carrier Integration**: Support templates for major carriers (Verizon, AT&T, etc.)
- **Script Library**: Pre-built templates for common scenarios
- **Performance Analytics**: Basic usage tracking and optimization tools

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Build Tool**: Vite
- **Testing**: Vitest (Unit), Playwright (E2E)
- **CI/CD**: GitHub Actions with comprehensive validation
- **Deployment**: Vercel (Private)

## 📋 Getting Started

### Prerequisites

- Node.js 20.x
- npm (latest)

### Installation

```bash
git clone [repository-url]
cd cst-smartdeskapp
npm install
```

### Development

```bash
npm run dev          # Start development server
npm run test         # Run unit tests
npm run build        # Build for production
npm run preview      # Preview production build
```

### Quality Assurance

```bash
npm run lint         # ESLint validation
npm run format       # Prettier formatting
npm run e2e          # End-to-end tests
npm run doctor       # Health check
```

## 🔄 Development Workflow

This project includes comprehensive CI/CD pipeline with:

- Pre-commit hooks for validation
- Pre-push hooks for comprehensive testing
- PR preparation scripts for draft and final reviews
- Automated corruption detection and prevention

```bash
npm run pr-prep:draft    # Prepare draft PR
npm run pr-prep          # Prepare final PR
npm run pr-setup         # GitHub CLI setup
```

## 🔀 Creating a separate copy or new repository

If you want this project to live in its own repository (or keep it isolated from your current clone), you can duplicate it without
losing history in the original remote.

### Option A: Clone into a fresh folder with a new remote
1. Clone the current repo into a new directory:
   ```bash
   git clone <existing-repo-url> my-new-smartdeskapp
   cd my-new-smartdeskapp
   ```
2. Point the new clone at a different remote (e.g., GitHub or S3-backed Git):
   ```bash
   git remote remove origin
   git remote add origin <new-repo-url>
   git push -u origin main
   ```

### Option B: Reinitialize only selected folders
1. Copy the folders you want to reuse (for example `public/`, `src/`, `api/`, `vercel.json`, `package.json`, and `package-lock.json`)
   into an empty directory.
2. Initialize a new Git history there and push to your preferred remote:
   ```bash
   git init
   git add .
   git commit -m "Initial import from SmartDesk"
   git remote add origin <new-repo-url>
   git push -u origin main
   ```

Either path keeps this project separate while preserving the same structure expected by the build (frontend in `/public`, assets in
`/src/public/assets`, and serverless endpoints in `/api`).

## 📖 Documentation

- **[CI/CD Improvements](./CI-IMPROVEMENTS.md)**: Complete pipeline documentation
- **[Agent Guidelines](./AGENTS.md)**: AI assistant integration guide
- **API Documentation**: Available in `/api` directory
- **E2E Test Specs**: Available in `/e2e` directory

## 🏢 Internal Use Only

This project is designed exclusively for internal Asurion CST Expert use. It is not intended for external distribution or public use.

## 👤 Maintainer

**Jesus Ariza**  
CST Expert, Asurion  
📧 Email: [your-email@asurion.com]  
📱 Phone: [your-phone-number]

---

_Last Updated: August 2025_  
_Version: 1.0.0_  
_License: Internal Use Only_
