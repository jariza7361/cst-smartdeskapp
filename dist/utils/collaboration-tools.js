// Collaboration Tools System
class CollaborationTools {
  constructor() {
    this.activeChats = new Map();
    this.expertRequests = [];
    this.init();
  }

  init() {
    this.setupTeamChat();
    this.initExpertConsultation();
    this.setupCaseHandoff();
  }

  setupTeamChat() {
    // Simulated team chat functionality
    this.teamMembers = [
      { id: 1, name: 'Maria Rodriguez', role: 'Coach', status: 'offline' },
      { id: 2, name: 'Carlos Martinez', role: 'Senior Expert', status: 'online' },
      { id: 3, name: 'Ana Lopez', role: 'Escalation Specialist', status: 'busy' }
    ];
  }

  initExpertConsultation() {
    // Expert consultation request system
    this.expertAreas = [
      'Device Troubleshooting',
      'Policy Interpretation',
      'Billing Issues',
      'Technical Support',
      'Escalation Management'
    ];
  }

  setupCaseHandoff() {
    // Case handoff workflow
    this.handoffReasons = [
      'Language preference',
      'Technical expertise required',
      'Escalation needed',
      'Shift change',
      'Specialized knowledge required'
    ];
  }

  requestExpertConsultation(area, description) {
    const request = {
      id: Date.now(),
      area,
      description,
      requestedBy: 'Jesus Ariza',
      timestamp: new Date(),
      status: 'pending'
    };

    this.expertRequests.push(request);
    this.notifyExperts(request);
    return request;
  }

  notifyExperts(request) {
    // Simulate expert notification
    console.log(`Expert consultation requested: ${request.area}`);
    
    // Show notification in UI
    this.showNotification({
      type: 'info',
      title: 'Expert Consultation Requested',
      message: `Request sent for ${request.area}`,
      duration: 3000
    });
  }

  initiateScreenShare(targetUser) {
    // Simulated screen sharing
    return {
      sessionId: `share_${Date.now()}`,
      status: 'connecting',
      target: targetUser,
      message: 'Screen sharing session initiated'
    };
  }

  handoffCase(caseId, targetAgent, reason) {
    const handoff = {
      caseId,
      fromAgent: 'Jesus Ariza',
      toAgent: targetAgent,
      reason,
      timestamp: new Date(),
      status: 'pending'
    };

    // Simulate handoff process
    setTimeout(() => {
      handoff.status = 'completed';
      this.showNotification({
        type: 'success',
        title: 'Case Handoff Complete',
        message: `Case ${caseId} transferred to ${targetAgent}`,
        duration: 3000
      });
    }, 2000);

    return handoff;
  }

  showNotification(notification) {
    // Add notification to the notifications panel
    const event = new CustomEvent('newNotification', {
      detail: notification
    });
    document.dispatchEvent(event);
  }

  getTeamStatus() {
    return this.teamMembers.map(member => ({
      ...member,
      lastSeen: member.status === 'online' ? 'Now' : '2 hours ago'
    }));
  }
}

// Initialize collaboration tools
document.addEventListener('DOMContentLoaded', () => {
  window.collaborationTools = new CollaborationTools();
});