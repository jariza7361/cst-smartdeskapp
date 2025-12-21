// Test script to clear localStorage and verify setup wizard
console.log('Clearing localStorage to test setup wizard...');
localStorage.removeItem('cst-setup-complete');
localStorage.removeItem('cst_setup_completed');
localStorage.removeItem('cst_setup_data');
console.log('localStorage cleared. Refresh the page to see setup wizard.');