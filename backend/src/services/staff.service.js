import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

function readClient() {
  return supabaseAdmin || supabase;
}

/**
 * Department Staff Service
 * Manages staff operations on complaints
 */

export const staffService = {
  /**
   * Get all complaints assigned to staff member
   */
  getAssignedComplaints: async (staffId, departmentId, filters = {}) => {
    try {
      const client = readClient();
      let query = client
        .from('staff_assignments')
        .select(`
          id,
          complaint_id,
          status,
          assignment_notes,
          assigned_at,
          updated_at,
          complaints (
            id,
            reference_id,
            title,
            description,
            category,
            department,
            priority,
            status,
            progress_percentage,
            sla_days,
            submitted_at
          )
        `)
        .eq('staff_id', staffId)
        .eq('status', 'active');

      if (filters.priority) {
        query = query.eq('complaints.priority', filters.priority);
      }
      if (filters.status) {
        query = query.eq('complaints.status', filters.status);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) {
        logger.error('Get assigned complaints error:', error);
        return { success: false, error: 'Failed to fetch complaints' };
      }

      return { success: true, complaints: data };
    } catch (error) {
      logger.error('Get assigned complaints error:', error);
      return { success: false, error: 'Failed to fetch complaints' };
    }
  },

  /**
   * Get details of a specific complaint assigned to staff
   */
  getComplaintDetails: async (complaintId, staffId) => {
    try {
      const client = readClient();
      
      logger.info(`getComplaintDetails called with: complaintId=${complaintId}, staffId=${staffId}, clientType=${supabaseAdmin ? 'admin' : 'anon'}`);
      
      // Fetch through staff_assignments to respect RLS policies
      const { data: assignment, error: assignmentError } = await client
        .from('staff_assignments')
        .select(`
          id,
          complaint_id,
          status,
          assignment_notes,
          assigned_at,
          updated_at,
          complaints (
            id,
            reference_id,
            title,
            description,
            category,
            priority,
            status,
            progress_percentage,
            sla_days,
            submitted_at,
            created_at
          )
        `)
        .eq('staff_id', staffId)
        .eq('complaint_id', complaintId)
        .single();

      logger.info(`Query result: hasData=${!!assignment}, hasError=${!!assignmentError}, error=${assignmentError?.message}`);

      if (assignmentError || !assignment) {
        logger.error(`Staff assignment not found for staff_id=${staffId}, complaint_id=${complaintId}. Error: ${assignmentError?.message}, Code: ${assignmentError?.code}`);
        return { success: false, error: 'Complaint not found or you are not assigned to it' };
      }

      // Extract complaint from the assignment
      const complaint = assignment?.complaints;

      if (!complaint) {
        logger.error(`Complaint data missing from assignment`);
        return { success: false, error: 'Complaint data not available' };
      }

      // Fetch related notes, visits, and documents
      const { data: notes } = await client
        .from('complaint_notes')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: false });

      const { data: visits } = await client
        .from('field_visits')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('visit_date', { ascending: false });

      // Fetch documents including RTI PDF
      const { data: documents } = await client
        .from('complaint_documents')
        .select('id, document_type, file_name, storage_path, public_url, created_at')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: false });

      const rtiPdf = documents?.find(d => d.document_type === 'rti_pdf');

      logger.info(`Successfully fetched complaint details for complaint_id=${complaintId} with ${documents?.length || 0} documents`);
      if (rtiPdf) {
        logger.info(`RTI PDF available for complaint ${complaintId}: ${rtiPdf.file_name}`);
      }

      return { 
        success: true, 
        complaint: {
          ...complaint,
          complaint_notes: notes || [],
          field_visits: visits || [],
          documents: documents || [],
          rti_pdf_url: rtiPdf?.public_url || null
        }
      };
    } catch (error) {
      logger.error(`Get complaint details exception: ${error.message}`);
      return { success: false, error: 'Failed to fetch complaint' };
    }
  },

  /**
   * Update complaint status
   */
  updateComplaintStatus: async (complaintId, newStatus, staffId) => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .update({
          status: newStatus
        })
        .eq('id', complaintId)
        .select()
        .single();

      if (error) {
        logger.error('Update status error:', error);
        return { success: false, error: 'Failed to update status' };
      }

      logger.info(`Complaint ${complaintId} status updated to ${newStatus} by staff ${staffId}`);
      return { success: true, complaint: data };
    } catch (error) {
      logger.error('Update status error:', error);
      return { success: false, error: 'Failed to update status' };
    }
  },

  /**
   * Update complaint progress
   */
  updateComplaintProgress: async (complaintId, progressPercentage) => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .update({
          progress_percentage: progressPercentage
        })
        .eq('id', complaintId)
        .select()
        .single();

      if (error) {
        logger.error('Update progress error:', error);
        return { success: false, error: 'Failed to update progress' };
      }

      return { success: true, complaint: data };
    } catch (error) {
      logger.error('Update progress error:', error);
      return { success: false, error: 'Failed to update progress' };
    }
  },

  /**
   * Add note to complaint
   */
  addComplaintNote: async (complaintId, noteText, staffName, staffId) => {
    try {
      const { data, error } = await supabase
        .from('complaint_notes')
        .insert({
          complaint_id: complaintId,
          staff_id: staffId,
          note_text: noteText,
          created_by_name: staffName,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Add note error:', error);
        return { success: false, error: 'Failed to add note' };
      }

      logger.info(`Note added to complaint ${complaintId}`);
      return { success: true, note: data };
    } catch (error) {
      logger.error('Add note error:', error);
      return { success: false, error: 'Failed to add note' };
    }
  },

  /**
   * Schedule field visit
   */
  scheduleFieldVisit: async (complaintId, visitDate, visitTime, location, visitType) => {
    try {
      const { data, error } = await supabase
        .from('field_visits')
        .insert({
          complaint_id: complaintId,
          visit_date: visitDate,
          visit_time: visitTime,
          location: location,
          visit_type: visitType,
          status: 'scheduled',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Schedule visit error:', error);
        return { success: false, error: 'Failed to schedule visit' };
      }

      logger.info(`Field visit scheduled for complaint ${complaintId}`);
      return { success: true, visit: data };
    } catch (error) {
      logger.error('Schedule visit error:', error);
      return { success: false, error: 'Failed to schedule visit' };
    }
  },

  /**
   * Complete field visit
   */
  completeFieldVisit: async (visitId, findings) => {
    try {
      const { data, error } = await supabase
        .from('field_visits')
        .update({
          status: 'completed',
          findings: findings,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitId)
        .select()
        .single();

      if (error) {
        logger.error('Complete visit error:', error);
        return { success: false, error: 'Failed to complete visit' };
      }

      logger.info(`Field visit ${visitId} completed`);
      return { success: true, visit: data };
    } catch (error) {
      logger.error('Complete visit error:', error);
      return { success: false, error: 'Failed to complete visit' };
    }
  },

  /**
   * Get staff dashboard summary
   */
  getStaffDashboard: async (staffId) => {
    try {
      const client = readClient();
      const { data: assignments, error: assignmentError } = await client
        .from('staff_assignments')
        .select('complaint_id, complaints (status)')
        .eq('staff_id', staffId)
        .eq('status', 'active');

      if (assignmentError) {
        return { success: false, error: 'Failed to fetch dashboard' };
      }

      const { data: performance } = await client
        .from('staff_performance')
        .select('*')
        .eq('staff_id', staffId)
        .single();

      // Calculate status breakdown
      const statusBreakdown = {
        assigned: 0,
        in_progress: 0,
        resolved: 0,
        pending_review: 0
      };

      assignments.forEach(a => {
        const status = a.complaints?.status || 'unknown';
        if (statusBreakdown.hasOwnProperty(status)) {
          statusBreakdown[status]++;
        }
      });

      return {
        success: true,
        summary: {
          total_assigned: assignments.length,
          ...statusBreakdown,
          performance: performance || {
            customer_satisfaction_score: 0,
            sla_achievement_rate: 0,
            on_time_completion_rate: 0
          }
        }
      };
    } catch (error) {
      logger.error('Get dashboard error:', error);
      return { success: false, error: 'Failed to get dashboard' };
    }
  },

  /**
   * Upload evidence file for complaint work progress
   */
  uploadEvidenceFile: async (complaintId, fileBuffer, fileName, fileType = 'evidence', staffId = null) => {
    try {
      logger.info(`uploadEvidenceFile start: complaintId=${complaintId}, fileName=${fileName}, fileType=${fileType}, bufferSize=${fileBuffer.length}`);

      // Generate unique file path
      const timestamp = Date.now();
      const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `complaints/${complaintId}/evidence/${timestamp}-${safeFileName}`;

      logger.info(`Uploading file to storage: ${storagePath}`);

      // Upload to Supabase storage using admin client to bypass RLS
      const storageClient = supabaseAdmin || supabase;
      const { data: uploadData, error: uploadError } = await storageClient
        .storage
        .from('complaint-documents')
        .upload(storagePath, fileBuffer, {
          contentType: 'application/octet-stream',
          upsert: false
        });

      if (uploadError) {
        logger.error('File upload error:', uploadError);
        return { success: false, error: `File upload failed: ${uploadError.message}` };
      }

      logger.info(`File uploaded to storage, getting public URL`);

      // Get public URL
      const { data: publicUrlData } = storageClient
        .storage
        .from('complaint-documents')
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData?.publicUrl;
      logger.info(`Public URL obtained: ${publicUrl}`);

      // Create complaint_documents record using admin client to bypass RLS
      const writeClient = supabaseAdmin || supabase;
      const docPayload = {
        complaint_id: complaintId,
        document_type: fileType,
        file_name: fileName,
        storage_path: storagePath,
        public_url: publicUrl
      };
      
      // Include staff_id if provided (for tracking)
      if (staffId) {
        docPayload.staff_id = staffId;
      }

      logger.info(`Inserting document record:`, JSON.stringify(docPayload));

      const { data: docRecord, error: dbError } = await writeClient
        .from('complaint_documents')
        .insert(docPayload)
        .select()
        .single();

      if (dbError) {
        logger.error('Create document record error:', dbError.message);
        return { success: false, error: `Failed to save document record: ${dbError.message}` };
      }

      logger.info(`Evidence file uploaded successfully for complaint ${complaintId}: ${fileName}`);
      return { success: true, document: docRecord };
    } catch (error) {
      logger.error('Upload evidence error:', error);
      return { success: false, error: `Failed to upload evidence: ${error.message}` };
    }
  }
};
