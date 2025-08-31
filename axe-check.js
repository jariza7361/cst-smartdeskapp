import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const axe = require('axe-core');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const { window } = new JSDOM(html, {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = window;
global.document = window.document;
global.navigator = window.navigator;

// Load axe-core into the JSDOM environment
const axeScript = fs.readFileSync(require.resolve('axe-core'), 'utf8');
window.eval(axeScript);

axe.run(window.document, {
  rules: {
    'color-contrast': { enabled: true },
    'label': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'input-image-alt': { enabled: true },
    'area-alt': { enabled: true },
    'link-name': { enabled: true },
    'heading-order': { enabled: true },
    'empty-heading': { enabled: true },
    'p-as-heading': { enabled: true },
    'duplicate-id': { enabled: true },
    'unique-landmark': { enabled: true },
    'landmark': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'definition-list': { enabled: true },
    'dlitem': { enabled: true },
    'contentinfo': { enabled: true },
    'banner': { enabled: true },
    'main': { enabled: true },
    'complementary': { enabled: true },
    'navigation': { enabled: true },
    'search': { enabled: true },
    'form': { enabled: true },
    'region': { enabled: true },
    'tabindex': { enabled: true },
    'accesskeys': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'focusable-no-name': { enabled: true },
    'focusable-has-alt': { enabled: true },
    'focusable-role': { enabled: true },
    'focusable-content': { enabled: true },
    'frame-focusable-content': { enabled: true },
    'aria-label': { enabled: true },
    'aria-labelledby': { enabled: true },
    'aria-describedby': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'aria-hidden-body': { enabled: true },
    'aria-dpub-role-fallback': { enabled: true },
    'aria-level': { enabled: true },
    'aria-prohibited-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roledescription': { enabled: true },
    'aria-unsupported-elements': { enabled: true },
    'aria-valid-role': { enabled: true },
    'presentation-role-conflict': { enabled: true },
    'role-none': { enabled: true },
    'role-img-alt': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-toggle-field-name': { enabled: true },
    'fallback-role': { enabled: true },
    'redundant-role': { enabled: true },
    'implicit-role-fallback': { enabled: true },
    'aria-errormessage': { enabled: true },
    'aria-expanded': { enabled: true },
    'aria-haspopup': { enabled: true },
    'aria-modal': { enabled: true },
    'aria-orientation': { enabled: true },
    'aria-valuemax': { enabled: true },
    'aria-valuemin': { enabled: true },
    'aria-valuenow': { enabled: true },
    'aria-valuetext': { enabled: true },
    'autocomplete-valid': { enabled: true },
    'avoid-inline-spacing': { enabled: true },
    'bypass': { enabled: true },
    'color-contrast-enhanced': { enabled: true },
    'css-orientation-lock': { enabled: true },
    'experimental': { enabled: true },
    'frame-tested': { enabled: true },
    'frame-title-unique': { enabled: true },
    'frame-title': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'html-xml-lang-mismatch': { enabled: true },
    'identical-links-same-purpose': { enabled: true },
    'image-redundant-alt': { enabled: true },
    'input-button-name': { enabled: true },
    'input-has-label': { enabled: true },
    'label-content-name-mismatch': { enabled: true },
    'label-title-only': { enabled: true },
    'landmark-banner-is-top-level': { enabled: true },
    'landmark-complementary-is-top-level': { enabled: true },
    'landmark-contentinfo-is-top-level': { enabled: true },
    'landmark-main-is-top-level': { enabled: true },
    'landmark-no-duplicate-banner': { enabled: true },
    'landmark-no-duplicate-contentinfo': { enabled: true },
    'landmark-no-duplicate-main': { enabled: true },
    'landmark-one-main': { enabled: true },
    'landmark-unique': { enabled: true },
    'link-in-text-block': { enabled: true },
    'meta-viewport-large': { enabled: true },
    'meta-viewport': { enabled: true },
    'nested-interactive': { enabled: true },
    'no-autoplay-audio': { enabled: true },
    'object-alt': { enabled: true },
    'scrollable-region-focusable': { enabled: true },
    'select-name': { enabled: true },
    'server-side-image-map': { enabled: true },
    'svg-img-alt': { enabled: true },
    'table-duplicate-name': { enabled: true },
    'table-fake-caption': { enabled: true },
    'table-pseudo-caption': { enabled: true },
    'target-size': { enabled: true },
    'td-has-header': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    'valid-lang': { enabled: true },
    'video-caption': { enabled: true }
  }
}, (err, results) => {
  if (err) {
    console.error('Error running axe-core:', err);
    return;
  }

  console.log('=== AXE ACCESSIBILITY RESULTS ===');
  console.log(`Total violations: ${results.violations.length}`);
  console.log('');

  results.violations.forEach((violation, index) => {
    console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
    console.log(`   Impact: ${violation.impact}`);
    console.log(`   Help: ${violation.help}`);
    console.log(`   Help URL: ${violation.helpUrl}`);
    console.log(`   Elements affected: ${violation.nodes.length}`);

    violation.nodes.forEach((node, nodeIndex) => {
      console.log(`     ${nodeIndex + 1}. ${node.target.join(' ')}`);
      if (node.failureSummary) {
        console.log(`        ${node.failureSummary}`);
      }
    });
    console.log('');
  });

  if (results.violations.length === 0) {
    console.log('✅ No accessibility violations found!');
  }
});
