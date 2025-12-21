# CST SmartDesk App - Project Manifest

## Summary Statistics
- **Total Files**: 222
- **Total Directories**: 45
- **Project Size**: ~45MB (excluding node_modules, .git, dist)

## Top Directories by Content
1. **assets-png/** - PNG image assets (carriers, corporate logos, icons, products)
2. **public/** - Static assets and configuration files
3. **src/** - Source code and utilities
4. **infra/** - AWS CDK infrastructure code
5. **e2e/** - End-to-end test specifications
6. **scripts/** - Build and deployment automation scripts
7. **cdk/** - Legacy CDK configuration
8. **libs/** - Third-party libraries (Tesseract OCR)

## File Type Distribution (Top 20)
| Extension | Count | Purpose |
|-----------|-------|---------|
| .json | 45 | Configuration, data, and manifest files |
| .js | 26 | JavaScript source code |
| .svg | 25 | Vector graphics (carrier/product logos) |
| .mjs | 22 | ES6 modules and scripts |
| .png | 18 | Raster images (logos, icons) |
| .md | 11 | Documentation files |
| .css | 11 | Stylesheets |
| .ts | 10 | TypeScript source files |
| .sh | 6 | Shell scripts |
| .jpg | 6 | JPEG images |
| .html | 6 | HTML test and template files |
| .DS_Store | 6 | macOS system files |
| .txt | 4 | Text documentation |
| .wasm | 2 | WebAssembly binaries (Tesseract) |
| .jpeg | 2 | JPEG images |
| .code-workspace | 2 | VS Code workspace files |
| .webp | 1 | WebP image format |
| .ico | 1 | Favicon |
| .b64 | 1 | Base64 encoded file |
| .axelint | 1 | Linting configuration |

## Key Components
### Core Application
- **index.html** - Main application entry point
- **assets/app.css** - Primary stylesheet
- **public/app.js** - Main JavaScript application
- **src/app.js** - Source application logic

### Infrastructure & Deployment
- **infra/** - AWS CDK infrastructure as code
- **scripts/** - Automated deployment and build scripts
- **package.json** - Node.js dependencies and scripts

### Assets & Resources
- **assets-png/** - Complete PNG asset library (carriers, corporate, icons, products)
- **public/assets/** - SVG vector assets
- **libs/tesseract/** - OCR processing library

### Testing & Quality
- **e2e/** - Playwright end-to-end tests
- **tests/** - Unit tests and smoke tests
- **eslint.config.js** - Code quality configuration

### Documentation
- **README.md** - Project overview and setup
- **COMPLETION-CHECKLIST.md** - Deployment readiness guide
- **DEVELOPMENT-MASTER-PLAN.md** - Implementation strategy
- **DEPLOYMENT-GUIDE.md** - AWS deployment instructions

## Largest Files/Directories
- **cst-smartdesk-react/** (19MB) - React version (legacy)
- **assets-png/** (16MB) - PNG image assets
- **README.md** (8KB) - Main documentation

## Project Status
- **Phase 1**: Foundation Stability - IN PROGRESS
- **Current Focus**: Splash screen and setup wizard fixes
- **Deployment**: AWS S3 + CloudFront
- **Live URL**: http://cst-smartdesk-app-1756806160.s3-website-us-east-1.amazonaws.com/

Generated: $(date)