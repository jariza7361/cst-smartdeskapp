import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('GUI Integrity Tests', () => {
  it('should have all required HTML IDs present', () => {
    const htmlPath = join(process.cwd(), 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    const requiredIds = [
      'system-status',
      'panels', 
      'ingest',
      'setup-wizard',
      'tests-modal',
      'btn-fetch-verizon'
    ];
    
    const missingIds = requiredIds.filter(id => {
      const pattern = new RegExp(`id=["']${id}["']`);
      return !pattern.test(htmlContent);
    });
    
    if (missingIds.length > 0) {
      throw new Error(`Missing required IDs: ${missingIds.join(', ')}`);
    }
    
    expect(missingIds).toHaveLength(0);
  });
  
  it('should have proper script tag structure', () => {
    const htmlPath = join(process.cwd(), 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    
    // Should NOT have inline scripts with src
    const hasInlineScriptWithSrc = /<script[^>]+src[^>]*>[^<]+<\/script>/.test(htmlContent);
    expect(hasInlineScriptWithSrc).toBe(false);
    
    // Should have embedded script OR external script, not both problematically
    const hasEmbeddedScript = /<script(?![^>]*src)[^>]*>/.test(htmlContent);
    const hasExternalScript = /<script[^>]+src=["'][^"']*["'][^>]*><\/script>/.test(htmlContent);
    
    // At least one should be present
    expect(hasEmbeddedScript || hasExternalScript).toBe(true);
  });
});