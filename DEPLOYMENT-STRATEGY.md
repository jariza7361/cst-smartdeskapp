# 🎯 EXCLUSIVE DEPLOYMENT STRATEGY

## SINGLE SOURCE OF TRUTH RULE

**ONLY WORK IN:** `dist/` folder
**DEPLOY FROM:** `dist/` folder  
**IGNORE:** Everything else

## FILE STRUCTURE (SIMPLIFIED)

```
cst-smartdeskapp/
├── dist/                    ← ONLY THIS MATTERS
│   ├── index.html          ← Main deployment file
│   ├── assets/app.css      ← Styles
│   ├── utils/smart-panels.js ← Functionality
│   └── libs/tesseract/     ← OCR library
└── [everything else]       ← IGNORE FOR DEPLOYMENT
```

## WORKFLOW

1. **Edit ONLY:** `dist/index.html`
2. **Test LOCALLY:** Open `dist/index.html` in browser
3. **Deploy:** Upload `dist/` folder to AWS S3
4. **Never touch:** src/, public/, root files

## AWS DEPLOYMENT COMMAND

```bash
aws s3 sync dist/ s3://cst-smartdesk-app-1756806160 --delete
```

## RULES

- ❌ Never edit root `index.html`
- ❌ Never edit `src/` files  
- ❌ Never edit `public/` files
- ✅ Only edit `dist/` files
- ✅ Test in `dist/` folder
- ✅ Deploy from `dist/` folder
