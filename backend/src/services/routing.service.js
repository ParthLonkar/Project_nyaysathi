import { logger } from '../utils/logger.js';

/**
 * Department Routing Configuration
 * IMPORTANT: Only these 6 departments exist in the database with admin/staff setup
 * All complaints must be routed to ONE of these departments only
 * Database departments: MC, WSD, EB, PWD, PD, CA
 */
const DEPARTMENTS = {
  water: {
    name: 'Water Supply Department',
    code: 'WSD',
    email: 'wsd@govt.in',
    sla: 20,
  },
  electricity: {
    name: 'Electricity Board',
    code: 'EB',
    email: 'eb@govt.in',
    sla: 15,
  },
  sanitation: {
    name: 'Municipal Corporation',
    code: 'MC',
    email: 'mc@govt.in',
    sla: 30,
  },
  garbage: {
    name: 'Municipal Corporation',
    code: 'MC',
    email: 'mc@govt.in',
    sla: 30,
  },
  roads: {
    name: 'Public Works Department',
    code: 'PWD',
    email: 'pwd@govt.in',
    sla: 25,
  },
  police: {
    name: 'Police Department',
    code: 'PD',
    email: 'pd@govt.in',
    sla: 7,
  },
  harassment: {
    name: 'Police Department',
    code: 'PD',
    email: 'pd@govt.in',
    sla: 7,
  },
  corruption: {
    name: 'Police Department',
    code: 'PD',
    email: 'pd@govt.in',
    sla: 7,
  },
  consumer: {
    name: 'Consumer Affairs',
    code: 'CA',
    email: 'ca@govt.in',
    sla: 30,
  },
  // All other categories default to Municipal Corporation (general civic issues)
  education: {
    name: 'Municipal Corporation',
    code: 'MC',
    email: 'mc@govt.in',
    sla: 30,
  },
  revenue: {
    name: 'Municipal Corporation',
    code: 'MC',
    email: 'mc@govt.in',
    sla: 30,
  },
  social_welfare: {
    name: 'Municipal Corporation',
    code: 'MC',
    email: 'mc@govt.in',
    sla: 30,
  },
  employment: {
    name: 'Municipal Corporation',
    code: 'MC',
    email: 'mc@govt.in',
    sla: 30,
  },
  property: {
    name: 'Municipal Corporation',
    code: 'MC',
    email: 'mc@govt.in',
    sla: 30,
  },
  family: {
    name: 'Police Department',
    code: 'PD',
    email: 'pd@govt.in',
    sla: 7,
  },
  general: {
    name: 'Municipal Corporation',
    code: 'MC',
    email: 'mc@govt.in',
    sla: 30,
  },
};

/**
 * Priority Levels
 */
const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Calculate priority based on content and keywords
 */
function calculatePriority(complaintData) {
  const { description = '', title = '' } = complaintData;
  const text = `${title} ${description}`.toLowerCase();

  const highPriorityKeywords = [
    'dangerous',
    'accident',
    'injury',
    'emergency',
    'urgent',
    'life threat',
    'child',
    'rape',
    'murder',
    'assault',
    'critical',
  ];

  const hasCriticalKeyword = highPriorityKeywords.some(keyword => text.includes(keyword));

  if (hasCriticalKeyword) {
    return {
      level: PRIORITY_LEVELS.HIGH,
      score: 90,
      reason: 'Critical keywords detected',
    };
  }

  if (text.includes('recurring') || text.includes('repeated') || text.length > 500) {
    return {
      level: PRIORITY_LEVELS.MEDIUM,
      score: 60,
      reason: 'Detailed / recurring complaint',
    };
  }

  return {
    level: PRIORITY_LEVELS.LOW,
    score: 30,
    reason: 'Standard complaint',
  };
}

/**
 * Route complaint to appropriate department
 */
function routeComplaint(complaintData) {
  const { category = 'general', location = 'India' } = complaintData;
  const normalizedCategory = String(category || 'general').toLowerCase();

  const categoryAliases = {
    public_works: 'roads',
    public_works_roads: 'roads',
    road: 'roads',
    garbage: 'sanitation',
    welfare: 'social_welfare',
  };
  const resolvedCategory = categoryAliases[normalizedCategory] || normalizedCategory;

  // Get department from category
  const department = DEPARTMENTS[resolvedCategory] || DEPARTMENTS.general;

  // Calculate priority
  const priority = calculatePriority(complaintData);

  // Generate routing decision
  const routing = {
    departmentCode: department.code,
    departmentName: department.name,
    departmentEmail: department.email,
    category: resolvedCategory,
    location,
    priority: priority.level,
    priorityScore: priority.score,
    priorityReason: priority.reason,
    sla: department.sla,
    routedAt: new Date().toISOString(),
    estimatedResolutionDate: new Date(Date.now() + department.sla * 24 * 60 * 60 * 1000).toISOString(),
  };

  logger.info(`Complaint routed to ${department.name} [${resolvedCategory}] (Priority: ${priority.level})`);
  return routing;
}

/**
 * Generate routing recommendations based on complaint details
 */
function generateRoutingRecommendations(complaintData) {
  const { category, description = '' } = complaintData;
  const recommendations = [];

  // Category-specific recommendations
  if (category === 'consumer') {
    recommendations.push('Gather purchase receipts and warranty documents');
    recommendations.push('Document all communication with the seller');
    recommendations.push('Keep product photos if defective');
  } else if (category === 'employment') {
    recommendations.push('Collect salary slips and employment contract');
    recommendations.push('Document all performance reviews');
    recommendations.push('Maintain records of attendance and work hours');
  } else if (category === 'property') {
    recommendations.push('Verify property ownership documents');
    recommendations.push('Keep all communication with other party');
    recommendations.push('Attach survey maps and records');
  }

  // General recommendations
  if (description.includes('harassment')) {
    recommendations.push('File police complaint if it involves threats or violence');
    recommendations.push('Maintain a detailed diary of incidents with dates and times');
  }

  return recommendations;
}

/**
 * Check if complaint needs escalation
 */
function checkEscalationNeed(complaintData) {
  const { respondentName = '', description = '', category = '' } = complaintData;
  const text = `${respondentName} ${description}`.toLowerCase();

  // Check if government entity is involved
  const governmentScore = text.includes('government') || text.includes('govt') ? 50 : 0;

  // Check if multiple tries have failed
  const multipleFailures = text.includes('failed') && text.includes('multiple') ? 40 : 0;

  // Check for corruption/bribery allegations
  const corruptionScore = text.includes('bribery') || text.includes('corruption') ? 100 : 0;

  const escalationScore = governmentScore + multipleFailures + corruptionScore;

  return {
    needsEscalation: escalationScore > 50,
    escalationScore,
    escalationReason: corruptionScore > 0 ? 'Corruption allegation' : 'Government entity involved',
  };
}

export {
  routeComplaint,
  calculatePriority,
  generateRoutingRecommendations,
  checkEscalationNeed,
  PRIORITY_LEVELS,
  DEPARTMENTS,
};
