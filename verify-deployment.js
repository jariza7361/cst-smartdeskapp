// Verification script for CST SmartDesk deployment
console.log('🧪 Starting CST SmartDesk verification...');

// Test 1: Check if splash screen exists
const splash = document.getElementById('splash-screen');
console.log('✅ Splash screen element:', splash ? 'Found' : '❌ Missing');

// Test 2: Check if setup wizard exists
const wizard = document.getElementById('setup-wizard');
console.log('✅ Setup wizard element:', wizard ? 'Found' : '❌ Missing');

// Test 3: Check if premium setup wizard class exists
const premiumWizard = document.querySelector('.premium-setup-wizard');
console.log('✅ Premium wizard styling:', premiumWizard ? 'Found' : '❌ Missing');

// Test 4: Check if all wizard steps exist
const steps = document.querySelectorAll('.wizard-step');
console.log('✅ Wizard steps found:', steps.length, '(Expected: 3)');

// Test 5: Check if progress bar exists
const progressBar = document.getElementById('wizardProgress');
console.log('✅ Progress bar:', progressBar ? 'Found' : '❌ Missing');

// Test 6: Check if theme selector exists
const themeSelector = document.querySelector('.theme-selector');
console.log('✅ Theme selector:', themeSelector ? 'Found' : '❌ Missing');

// Test 7: Check if save button exists
const saveBtn = document.getElementById('wizardSave');
console.log('✅ Save button:', saveBtn ? 'Found' : '❌ Missing');

// Test 8: Check if main dashboard exists
const dashboard = document.querySelector('.dashboard');
console.log('✅ Main dashboard:', dashboard ? 'Found' : '❌ Missing');

// Test 9: Check if all navigation tabs exist
const tabs = document.querySelectorAll('[role="tab"]');
console.log('✅ Navigation tabs found:', tabs.length, '(Expected: 4)');

// Test 10: Check if all dashboard cards exist
const cards = document.querySelectorAll('.dashboard-card');
console.log('✅ Dashboard cards found:', cards.length, '(Expected: 12)');

console.log('🎯 Verification complete! Check results above.');