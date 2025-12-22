// Premium Setup Wizard - single source for setup flow
class PremiumSetupWizard {
  // Storage keys (LOCK)
  static KEY_COMPLETE = 'cst-setup-complete';
  static KEY_DATA = 'cst_setup_data';

  constructor() {
    this.wizard = document.getElementById('setup-wizard');
    this.form = document.getElementById('wizardForm');
    this.saveBtn = document.getElementById('wizardSave');
    this.setupBtn = document.getElementById('openSettingsTop');
    this.init();
  }

  init() {
    this.migrateLegacyProfile();
    this.bindEvents();
    this.loadSavedData();
    this.handleBoot();
  }

  bindEvents() {
    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => this.saveSettings());
    }

    if (this.setupBtn) {
      this.setupBtn.addEventListener('click', () => {
        this.openWizard();
      });
    }

    if (this.wizard) {
      this.wizard.addEventListener('close', () => this.restoreWizardStyles());
      this.wizard.addEventListener('cancel', () => this.restoreWizardStyles());
    }
  }

  migrateLegacyProfile() {
    const legacy = localStorage.getItem('expertProfile');
    const existing = localStorage.getItem('cst_setup_data');
    if (!legacy || existing) return;

    try {
      const profile = JSON.parse(legacy);
      const firstName = profile?.firstName || '';
      const lastName = profile?.lastName || '';
      const expertType = profile?.expertType || 'english';
      const fullName = `${firstName} ${lastName}`.trim();
      const migrated = {
        wName: fullName,
        wCoach: '',
        wEmpId: '',
        wExt: '',
        wTheme: 'light',
        wExpertType: expertType,
        dontShow: false
      };
      localStorage.setItem('cst_setup_data', JSON.stringify(migrated));
      localStorage.removeItem('expertProfile');
    } catch (error) {
      console.error('Legacy profile migration failed:', error);
    }
  }

  loadSavedData() {
    const saved = localStorage.getItem('cst_setup_data');
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      this.setFieldValue('wName', data.wName);
      this.setFieldValue('wCoach', data.wCoach);
      this.setFieldValue('wEmpId', data.wEmpId);
      this.setFieldValue('wExt', data.wExt);
      this.setFieldValue('wTheme', data.wTheme);
      this.setFieldValue('wExpertType', data.wExpertType);
      const dontShow = document.getElementById('dontShow');
      if (dontShow) {
        dontShow.checked = Boolean(data.dontShow);
      }
    } catch (error) {
      console.error('Failed to load setup data:', error);
    }
  }

  getFormData() {
    return {
      wName: this.getFieldValue('wName'),
      wCoach: this.getFieldValue('wCoach'),
      wEmpId: this.getFieldValue('wEmpId'),
      wExt: this.getFieldValue('wExt'),
      wTheme: this.getFieldValue('wTheme'),
      wExpertType: this.getFieldValue('wExpertType'),
      dontShow: this.getCheckboxValue('dontShow')
    };
  }

  saveSettings() {
    const data = this.getFormData();

    try {
      localStorage.setItem(PremiumSetupWizard.KEY_DATA, JSON.stringify(data));

      // ✅ If user checks "Don't show", mark setup complete as well
      // so future boots never show wizard.
      localStorage.setItem(PremiumSetupWizard.KEY_COMPLETE, 'true');

      if (this.wizard) this.wizard.close();

      if (typeof window.cstInitApp === 'function') window.cstInitApp();
    } catch (error) {
      console.error('Error saving setup data:', error);
    }
  }

  getFieldValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  setFieldValue(id, value) {
    const el = document.getElementById(id);
    if (el && typeof value === 'string') {
      el.value = value;
    }
  }

  getCheckboxValue(id) {
    const el = document.getElementById(id);
    return el ? Boolean(el.checked) : false;
  }

  handleBoot() {
    const raw = localStorage.getItem(PremiumSetupWizard.KEY_DATA);
    const setupComplete = localStorage.getItem(PremiumSetupWizard.KEY_COMPLETE) === 'true';

    let dontShow = false;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        dontShow = Boolean(parsed?.dontShow);
      } catch {}
    }

    // ✅ RULE:
    // - If complete OR dontShow => do NOT open wizard; just init app.
    // - Otherwise => open wizard.
    if (setupComplete || dontShow) {
      if (typeof window.cstInitApp === 'function') window.cstInitApp();
      return;
    }

    this.openWizard();
  }

  openWizard() {
    if (!this.wizard) return;
    this.applyWizardStyles();
    try {
      this.wizard.showModal();
    } catch (error) {
      console.error('Wizard open failed:', error);
    }
  }

  applyWizardStyles() {
    if (!this.wizard) return;
    if (this._wizardPrevDisplay === undefined) {
      this._wizardPrevDisplay = this.wizard.style.display || '';
    }
    if (this._wizardPrevZIndex === undefined) {
      this._wizardPrevZIndex = this.wizard.style.zIndex || '';
    }
    this.wizard.removeAttribute('hidden');
    this.wizard.hidden = false;
    this.wizard.style.display = 'block';
    this.wizard.style.zIndex = '9999';
    document.body.classList.add('wizard-mode');
  }

  restoreWizardStyles() {
    if (!this.wizard) return;
    if (this._wizardPrevDisplay !== undefined) {
      this.wizard.style.display = this._wizardPrevDisplay;
    }
    if (this._wizardPrevZIndex !== undefined) {
      this.wizard.style.zIndex = this._wizardPrevZIndex;
    }
    document.body.classList.remove('wizard-mode');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.premiumSetupWizard = new PremiumSetupWizard();
});
