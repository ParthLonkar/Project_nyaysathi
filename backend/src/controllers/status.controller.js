import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';
import { transitionState, checkSlaBreach, getStateProgress } from '../services/state-machine.service.js';
import { shouldEscalate, determineEscalationLevel } from '../services/escalation.service.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * Update complaint status and manage state transitions
 * POST /api/complaints/:id/status
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, officer_id } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Get current complaint
    const { data: complaint, error: fetchError } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Validate state transition using state machine service
    const isValidTransition = transitionState(complaint.status, status);
    if (!isValidTransition) {
      return res.status(400).json({
        error: `Invalid state transition from ${complaint.status} to ${status}`
      });
    }

    // Check for SLA breach
    const slaBreach = checkSlaBreach(complaint.submitted_at, complaint.sla_days, status);
    const hasBreached = slaBreach.breached;

    // Calculate progress
    const progress = getStateProgress(status);

    // Check if escalation needed
    let escalationData = null;
    if (hasBreached) {
      escalationData = {
        shouldEscalate: true,
        level: determineEscalationLevel(['SLA_BREACH']),
        reason: 'SLA breach detected on status update',
        timestamp: new Date().toISOString()
      };
    }

    // Update complaint
    const { data: updatedComplaint, error: updateError } = await supabase
      .from('complaints')
      .update({
        status,
        progress_percentage: progress,
        sla_breached: hasBreached,
        escalation_data: escalationData,
        updated_at: new Date().toISOString(),
        ...(officer_id && { assigned_officer_id: officer_id })
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Error updating complaint status:', updateError);
      return res.status(500).json({ error: 'Failed to update complaint status' });
    }

    // Create status history entry
    const { error: historyError } = await supabase
      .from('status_history')
      .insert({
        complaint_id: id,
        old_status: complaint.status,
        new_status: status,
        notes,
        updated_by: officer_id,
        created_at: new Date().toISOString()
      });

    if (historyError) {
      logger.warn('Could not create status history entry:', historyError);
    }

    // Send notification to citizen
    // TODO: Implement notification service

    logger.info(`Complaint ${id} status updated from ${complaint.status} to ${status}`);

    res.json({
      success: true,
      complaint: updatedComplaint,
      message: `Status updated to ${status}`,
      escalation: escalationData,
      slaBreach: {
        breached: hasBreached,
        ...(hasBreached && slaBreach)
      }
    });
  } catch (error) {
    logger.error('Update complaint status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get complaint status and progress
 * GET /api/complaints/:id/status
 */
export const getComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: complaint, error } = await supabase
      .from('complaints')
      .select(`
        id,
        status,
        progress_percentage,
        sla_days,
        submitted_at,
        sla_breached,
        escalation_data,
        updated_at,
        assigned_officer_id,
        routing_info
      `)
      .eq('id', id)
      .single();

    if (error || !complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Get status history
    const { data: history } = await supabase
      .from('status_history')
      .select('*')
      .eq('complaint_id', id)
      .order('created_at', { ascending: false });

    // Get officer details
    let officer = null;
    if (complaint.assigned_officer_id) {
      const { data: officerData } = await supabase
        .from('officers')
        .select('id, name, department, contact_phone, email')
        .eq('id', complaint.assigned_officer_id)
        .single();
      officer = officerData;
    }

    // Calculate SLA status
    const daysPassed = Math.floor(
      (new Date() - new Date(complaint.submitted_at)) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = complaint.sla_days - daysPassed;
    let slaStatus = 'on_track';
    if (daysRemaining <= 5) slaStatus = 'at_risk';
    if (daysRemaining <= 0) slaStatus = 'breached';

    res.json({
      complaint: {
        ...complaint,
        daysPassed,
        daysRemaining,
        slaStatus
      },
      statusHistory: history,
      assignedOfficer: officer
    });
  } catch (error) {
    logger.error('Get complaint status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all complaints for a department
 * GET /api/complaints/department/:deptCode
 */
export const getComplaintsByDepartment = async (req, res) => {
  try {
    const { deptCode } = req.params;
    const { status, priority, sortBy } = req.query;

    let query = supabase
      .from('complaints')
      .select(`
        id,
        title,
        category,
        status,
        priority,
        submitted_at,
        progress_percentage,
        sla_breached,
        assigned_officer_id,
        citizen_name,
        citizen_phone
      `)
      .eq('routing_info->department_code', deptCode);

    // Apply filters
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data: complaints, error } = await query.order(
      sortBy === 'recent' ? 'submitted_at' : 'priority',
      { ascending: sortBy !== 'recent' }
    );

    if (error) {
      logger.error('Error fetching complaints for department:', error);
      return res.status(500).json({ error: 'Failed to fetch complaints' });
    }

    // Calculate statistics
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => ['routed', 'received', 'assigned'].includes(c.status)).length,
      inProgress: complaints.filter(c => c.status === 'in_progress').length,
      breached: complaints.filter(c => c.sla_breached).length,
      highPriority: complaints.filter(c => c.priority === 'high').length
    };

    res.json({
      complaints,
      stats,
      department: deptCode
    });
  } catch (error) {
    logger.error('Get department complaints error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Assign complaint to officer
 * POST /api/complaints/:id/assign
 */
export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { officer_id } = req.body;

    if (!officer_id) {
      return res.status(400).json({ error: 'Officer ID is required' });
    }

    // Verify officer exists
    const { data: officer } = await supabase
      .from('officers')
      .select('id')
      .eq('id', officer_id)
      .single();

    if (!officer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    // Update complaint
    const { data: updatedComplaint, error } = await supabase
      .from('complaints')
      .update({
        assigned_officer_id: officer_id,
        status: 'assigned',
        progress_percentage: getStateProgress('assigned'),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error assigning complaint:', error);
      return res.status(500).json({ error: 'Failed to assign complaint' });
    }

    // Create history entry
    await supabase
      .from('status_history')
      .insert({
        complaint_id: id,
        old_status: 'received',
        new_status: 'assigned',
        notes: `Assigned to officer ${officer_id}`,
        created_at: new Date().toISOString()
      });

    logger.info(`Complaint ${id} assigned to officer ${officer_id}`);

    res.json({
      success: true,
      complaint: updatedComplaint,
      message: 'Complaint assigned successfully'
    });
  } catch (error) {
    logger.error('Assign complaint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get SLA monitoring data
 * GET /api/complaints/monitoring/sla-breaches
 */
export const getSLABreaches = async (req, res) => {
  try {
    const { department } = req.query;

    let query = supabase
      .from('complaints')
      .select('id, title, status, sla_days, submitted_at, citizen_name, assigned_officer_id')
      .eq('sla_breached', true);

    if (department) {
      query = query.eq('routing_info->department_code', department);
    }

    const { data: breaches, error } = await query
      .order('submitted_at', { ascending: true });

    if (error) {
      logger.error('Error fetching SLA breaches:', error);
      return res.status(500).json({ error: 'Failed to fetch SLA breaches' });
    }

    // Calculate days overdue
    const breashetData = breaches.map(b => ({
      ...b,
      daysOverdue: Math.floor(
        (new Date() - new Date(b.submitted_at)) / (1000 * 60 * 60 * 24)
      ) - b.sla_days
    }));

    res.json({
      breashetData,
      count: breashetData.length
    });
  } catch (error) {
    logger.error('Get SLA breaches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
