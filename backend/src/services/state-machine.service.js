import { logger } from '../utils/logger.js';

/**
 * Complaint Status States
 */
const COMPLAINT_STATES = {
  SUBMITTED: 'submitted',
  ROUTED: 'routed',
  RECEIVED: 'received',
  ASSIGNED: 'assigned',
  IN_REVIEW: 'in_review',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
  REJECTED: 'rejected',
};

/**
 * State Transitions - which states can transition to which
 */
const STATE_TRANSITIONS = {
  submitted: ['routed', 'rejected'],
  routed: ['received', 'rejected'],
  received: ['assigned', 'in_review', 'rejected'],
  assigned: ['in_review', 'in_progress'],
  in_review: ['assigned', 'in_progress', 'rejected', 'escalated'],
  in_progress: ['resolved', 'escalated'],
  resolved: ['closed'],
  closed: [],
  escalated: ['received', 'in_review', 'assigned'],
  rejected: [],
};

/**
 * State descriptions for users
 */
const STATE_DESCRIPTIONS = {
  submitted: '✅ Complaint submitted successfully',
  routed: '📋 Routed to appropriate department',
  received: '📥 Department has received your complaint',
  assigned: '👤 Assigned to an officer for review',
  in_review: '🔍 Officer is reviewing your complaint',
  in_progress: '⚙️ Action is in progress',
  resolved: '✓ Complaint has been resolved',
  closed: '🔐 Case closed',
  escalated: '⬆️ Escalated to higher authority',
  rejected: '❌ Complaint was rejected',
};

/**
 * Check if transition is valid
 */
function isValidTransition(fromState, toState) {
  const allowedStates = STATE_TRANSITIONS[fromState] || [];
  return allowedStates.includes(toState);
}

/**
 * Get next possible states from current state
 */
function getNextPossibleStates(currentState) {
  return STATE_TRANSITIONS[currentState] || [];
}

/**
 * Create state history entry
 */
function createStateEntry(newState, metadata = {}) {
  return {
    state: newState,
    timestamp: new Date().toISOString(),
    description: STATE_DESCRIPTIONS[newState],
    metadata,
  };
}

/**
 * Transition complaint to new state
 */
function transitionState(currentState, newState, metadata = {}) {
  if (!isValidTransition(currentState, newState)) {
    logger.error(`Invalid transition from ${currentState} to ${newState}`);
    return {
      success: false,
      error: `Cannot transition from ${currentState} to ${newState}`,
      validTransitions: getNextPossibleStates(currentState),
    };
  }

  const entry = createStateEntry(newState, metadata);

  logger.info(`State transition: ${currentState} → ${newState}`);
  return {
    success: true,
    newState,
    entry,
  };
}

/**
 * Get state progress percentage (for progress bar)
 */
function getStateProgress(currentState) {
  const stateOrder = [
    'submitted',
    'routed',
    'received',
    'assigned',
    'in_review',
    'in_progress',
    'resolved',
    'closed',
  ];

  const index = stateOrder.indexOf(currentState);
  if (index === -1) return 0;

  return Math.round((index / (stateOrder.length - 1)) * 100);
}

/**
 * Check if complaint is in critical state (needs attention)
 */
function isCriticalState(state) {
  const criticalStates = ['rejected', 'escalated'];
  return criticalStates.includes(state);
}

/**
 * Get SLA breach status
 */
function checkSlaBreach(submittedAt, slaInDays, currentState) {
  const now = new Date();
  const submitted = new Date(submittedAt);
  const elapsedDays = (now - submitted) / (1000 * 60 * 60 * 24);

  const isBreached = elapsedDays > slaInDays;
  const remainingDays = Math.max(0, slaInDays - elapsedDays);

  return {
    isBreached,
    elapsedDays: Math.round(elapsedDays * 100) / 100,
    remainingDays: Math.round(remainingDays * 100) / 100,
    slaInDays,
    status: isBreached ? 'breached' : 'on_track',
  };
}

/**
 * Calculate days since complaint submission
 */
function getDaysSinceSubmission(submittedAt) {
  const now = new Date();
  const submitted = new Date(submittedAt);
  return Math.floor((now - submitted) / (1000 * 60 * 60 * 24));
}

export {
  COMPLAINT_STATES,
  STATE_TRANSITIONS,
  STATE_DESCRIPTIONS,
  isValidTransition,
  getNextPossibleStates,
  createStateEntry,
  transitionState,
  getStateProgress,
  isCriticalState,
  checkSlaBreach,
  getDaysSinceSubmission,
};
