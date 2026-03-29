import { logger } from '../utils/logger.js';
import { pythonService } from '../services/python.service.js';
import { supabaseAdmin } from '../config/supabase.js';
import { attachmentService } from '../services/attachment.service.js';
import { documentService } from '../services/document.service.js';
import { routeComplaint, generateRoutingRecommendations } from '../services/routing.service.js';
import { actionAgentService } from '../services/action-agent.service.js';

const REFERENCE_ID_REGEX = /^Ref-\d{4}-\d{6}$/;

const buildResolvedTitle = (title, description) => {
  if (title && String(title).trim()) return String(title).trim();
  if (description && String(description).trim()) {
    return String(description).trim().split('.').shift().slice(0, 80);
  }
  return 'Civic complaint';
};

const parseMetadataAttachments = (attachmentsMeta) => {
  if (Array.isArray(attachmentsMeta)) return attachmentsMeta;
  if (typeof attachmentsMeta === 'string') {
    try {
      const parsed = JSON.parse(attachmentsMeta);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
};

const deriveProgressFromStatus = (status = 'new') => {
  const key = String(status || 'new').toLowerCase();
  const map = {
    new: 10,
    submitted: 10,
    routed: 25,
    received: 35,
    assigned: 50,
    in_review: 60,
    in_progress: 70,
    processing: 70,
    escalated: 80,
    resolved: 100,
    closed: 100,
  };
  return map[key] ?? 20;
};

const mapCitizenDocument = (doc = {}) => ({
  document_type: doc.document_type || 'document',
  file_name: doc.file_name || 'document',
  download_url: doc.download_url || doc.signed_url || doc.public_url || null,
  signed_url: doc.signed_url || null,
  public_url: doc.public_url || null,
  view_url: doc.view_url || doc.download_url || doc.signed_url || doc.public_url || null,
  created_at: doc.created_at || null,
});

const mapCitizenDocuments = (documents = []) => {
  if (!Array.isArray(documents)) return [];
  return documents.map(mapCitizenDocument);
};

const buildReferenceId = () => {
  const year = new Date().getFullYear();
  const randomSix = Math.floor(100000 + Math.random() * 900000);
  return `Ref-${year}-${randomSix}`;
};

const generateUniqueReferenceId = async (attempts = 8) => {
  for (let i = 0; i < attempts; i += 1) {
    const candidate = buildReferenceId();
    const { data, error } = await supabaseAdmin
      .from('complaints')
      .select('id')
      .eq('reference_id', candidate)
      .maybeSingle();

    if (error) {
      logger.warn('Reference ID uniqueness check failed, proceeding with generated value:', error.message);
      return candidate;
    }

    if (!data) {
      return candidate;
    }
  }

  return `Ref-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
};

const mapTopLevelAiFields = (aiResult = {}, fallbackInput = {}, routingDecision = {}) => {
  const recommendedActions = Array.isArray(aiResult.recommended_actions)
    ? aiResult.recommended_actions
    : [];

  return {
    category: aiResult.category || routingDecision.category || 'general',
    department: aiResult.department || routingDecision.departmentName || null,
    priority: aiResult.priority || routingDecision.priority || 'medium',
    legal_strategy: aiResult.legal_strategy || null,
    summary: aiResult.summary || null,
    recommended_actions: recommendedActions,
    escalation_risk: aiResult.escalation_risk || null,
    manual_review: aiResult.manual_review === true,
    citizen_name: fallbackInput.name || null,
    citizen_phone: fallbackInput.phone || null,
    location: fallbackInput.location || null,
  };
};

export const complaintController = {
  createComplaint: async (req, res, next) => {
    try {
      console.log('Incoming complaint body:', req.body);
      const {
        title,
        description,
        complaint_text,
        location,
        userId,
        name,
        phone,
        attachments,
        attachment_meta,
      } = req.body || {};

      const uploadedFiles = Array.isArray(req.files) ? req.files : [];
      const metadataAttachments = parseMetadataAttachments(attachment_meta || attachments);
      const resolvedDescription = description || complaint_text || '';
      const resolvedTitle = buildResolvedTitle(title, resolvedDescription);
      const resolvedUserId = req.user?.id || userId || 'demo-user';

      logger.info(
        'Complaint request received',
        JSON.stringify({
          hasText: Boolean(resolvedDescription),
          location: location || null,
          userId: resolvedUserId,
          hasName: Boolean(name),
          hasPhone: Boolean(phone),
          metadataAttachmentCount: metadataAttachments.length,
          uploadedFileCount: uploadedFiles.length,
          uploadedFiles: uploadedFiles.map((file) => ({
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
          })),
        })
      );

      const missingFields = [];
      if (!resolvedDescription) missingFields.push('complaint_text');
      if (!location) missingFields.push('location');

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            status: 400,
            message: `Missing required field(s): ${missingFields.join(', ')}`,
            required: ['complaint_text', 'location'],
          },
        });
      }

      const baseComplaintPayload = {
        user_id: resolvedUserId,
        reference_id: await generateUniqueReferenceId(),
        title: resolvedTitle,
        description: resolvedDescription,
        location,
        category: 'general',
        status: 'new',
        priority: 'medium',
        manual_review: false,
        citizen_name: name || null,
        citizen_phone: phone || null,
      };

      let complaint;
      try {
        const { data, error } = await supabaseAdmin
          .from('complaints')
          .insert([baseComplaintPayload])
          .select()
          .single();

        if (error) throw error;
        complaint = data;
        logger.info(`Complaint base insert success: ${complaint.id}`);
      } catch (insertError) {
        logger.warn('Complaint insert with extended columns failed, retrying with minimal payload:', insertError.message);
        const minimalPayload = {
          user_id: resolvedUserId,
          title: resolvedTitle,
          description: resolvedDescription,
          category: 'general',
          status: 'new',
          priority: 'medium',
        };

        const { data, error } = await supabaseAdmin
          .from('complaints')
          .insert([minimalPayload])
          .select()
          .single();

        if (error) throw error;
        complaint = data;
        logger.info(`Complaint base insert success (minimal payload): ${complaint.id}`);
      }

      let aiResult;
      const aiStartMs = Date.now();
      try {
        logger.info(`AI enrichment start for complaint ${complaint.id}`);
        aiResult = await pythonService.callAIService({
          text: resolvedDescription,
          location,
          name: name || null,
          email: null,  // Not in current form
          phone: phone || null,
          address: location || null,
          aadhaar: null,  // Not in current form
          reference_id: complaint.reference_id || null,
        });
        logger.info(
          `AI enrichment success for complaint ${complaint.id}`,
          JSON.stringify({
            durationMs: Date.now() - aiStartMs,
            category: aiResult?.category,
            department: aiResult?.department,
            priority: aiResult?.priority,
            hasComplaintDraft: Boolean(aiResult?.complaint_draft),
            hasRtiDraft: Boolean(aiResult?.rti_draft),
            hasComplaintPdf: Boolean(aiResult?.complaint_pdf),
            complaintPdfBase64Size: aiResult?.complaint_pdf ? String(aiResult.complaint_pdf).length : 0,
            hasRtiPdf: Boolean(aiResult?.rti_pdf),
            rtiPdfBase64Size: aiResult?.rti_pdf ? String(aiResult.rti_pdf).length : 0,
            documentValid: aiResult?.document_valid,
          })
        );
        logger.info(
          `Generated PDF payload received from AI for complaint ${complaint.id}`,
          JSON.stringify({
            complaintPdfReceived: Boolean(aiResult?.complaint_pdf),
            rtiPdfReceived: Boolean(aiResult?.rti_pdf),
          })
        );
      } catch (aiError) {
        logger.warn(
          `AI enrichment failed for complaint ${complaint.id}, using fallback`,
          JSON.stringify({ durationMs: Date.now() - aiStartMs, error: aiError.message })
        );
        aiResult = pythonService.buildFallbackAIResult(resolvedDescription, location, aiError.message);
      }

      const routingDecision = routeComplaint({
        category: aiResult?.category || 'general',
        description: resolvedDescription,
        title: resolvedTitle,
        location,
      });

      const routingRecommendations = generateRoutingRecommendations({
        category: aiResult?.category || routingDecision.category || 'general',
        description: resolvedDescription,
      });
      const actionPlan = actionAgentService.buildActionPlan({ aiResult, routingDecision });

      const savedAttachments = await attachmentService.persistAttachments(
        complaint.id,
        uploadedFiles,
        metadataAttachments
      );
      logger.info(
        `Attachment persistence complete for complaint ${complaint.id}`,
        JSON.stringify({ requested: uploadedFiles.length, saved: savedAttachments.length })
      );

      const savedDocuments = await documentService.persistGeneratedDocuments({
        complaintId: complaint.id,
        referenceId: complaint.reference_id,
        aiResult,
        department: aiResult?.department || routingDecision.departmentName,
      });
      logger.info(
        `Document persistence complete for complaint ${complaint.id}`,
        JSON.stringify({
          hasComplaintDraft: Boolean(aiResult?.complaint_draft),
          hasRtiDraft: Boolean(aiResult?.rti_draft),
          savedDocumentCount: savedDocuments.length,
        })
      );

      const aiAuditPayload = {
        ...aiResult,
        routing_info: actionPlan.routing_info,
        routing_recommendations: routingRecommendations,
        attachments: savedAttachments,
        documents: savedDocuments,
        ai_analysis: {
          ...aiResult,
          routing_info: actionPlan.routing_info,
          routing_recommendations: routingRecommendations,
          agent_flow: {
            intake: 'completed',
            routing: 'completed',
            drafting: aiResult?.drafting ? 'completed' : 'pending',
            compliance: aiResult?.compliance ? 'completed' : 'pending',
            action: 'completed',
          },
          attachments: savedAttachments,
          documents: savedDocuments,
          input: {
            text: resolvedDescription,
            location,
            citizen_name: name || null,
            citizen_phone: phone || null,
            attachments: metadataAttachments,
          },
        },
      };

      const mappedFields = mapTopLevelAiFields(aiResult, { name, phone, location }, routingDecision);
      const updatePayload = {
        ...mappedFields,
        status: actionPlan.status,
        progress_percentage: actionPlan.progress_percentage,
        routing_info: actionPlan.routing_info,
        escalation_flag: actionPlan.escalation_flag,
        is_urgent: actionPlan.is_urgent,
        admin_classification: actionPlan.admin_classification,
        manual_review: actionPlan.manual_review,
        ai_analysis: aiAuditPayload.ai_analysis,
      };

      let updatedComplaint = complaint;
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('complaints')
        .update(updatePayload)
        .eq('id', complaint.id)
        .select()
        .single();

      if (updateError) {
        logger.warn(`Failed to update mapped AI fields on complaint ${complaint.id}:`, updateError.message);
        const fallbackUpdate = {
          category: aiResult.category || routingDecision.category || 'general',
          priority: aiResult.priority || routingDecision.priority || 'medium',
          status: actionPlan.status,
          progress_percentage: actionPlan.progress_percentage,
          routing_info: actionPlan.routing_info,
          manual_review: actionPlan.manual_review,
          ai_analysis: aiAuditPayload.ai_analysis,
        };

        const { data: fallbackData, error: fallbackError } = await supabaseAdmin
          .from('complaints')
          .update(fallbackUpdate)
          .eq('id', complaint.id)
          .select()
          .single();

        if (!fallbackError && fallbackData) {
          updatedComplaint = fallbackData;
          logger.info(`Complaint AI fallback update success: ${complaint.id}`);
        }
      } else {
        updatedComplaint = updateData;
        logger.info(`Complaint AI mapped update success: ${complaint.id}`);
      }

      await actionAgentService.createInitialTimelineEntry({
        complaintId: complaint.id,
        note: actionPlan.timeline_note,
        status: actionPlan.status,
      });

      if (savedDocuments.length > 0) {
        await actionAgentService.createTimelineEntry({
          complaintId: complaint.id,
          note: `Complaint letter generated and routed to ${actionPlan.routing_info?.departmentName || 'department'}`,
          status: actionPlan.status,
        });
      }

      res.status(201).json({
        success: true,
        caseId: updatedComplaint?.reference_id || complaint.id,
        aiResult: {
          ...aiResult,
          routing_info: actionPlan.routing_info,
          routing_recommendations: routingRecommendations,
          action_agent: {
            status: actionPlan.status,
            progress_percentage: actionPlan.progress_percentage,
            escalation_flag: actionPlan.escalation_flag,
            admin_classification: actionPlan.admin_classification,
            is_urgent: actionPlan.is_urgent,
          },
        },
        complaint: updatedComplaint,
        attachments: savedAttachments,
        documents: mapCitizenDocuments(savedDocuments),
      });
    } catch (error) {
      next(error);
    }
  },

  getUserComplaints: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { data, error } = await supabaseAdmin
        .from('complaints')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  getAllComplaints: async (req, res, next) => {
    try {
      const { filter = 'all' } = req.query;
      let query = supabaseAdmin.from('complaints').select('*');

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  getComplaintById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabaseAdmin
        .from('complaints')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      const attachments = await attachmentService.getComplaintAttachments(id);
      const documents = await documentService.getComplaintDocuments(id);
      const fallbackDocuments = Array.isArray(data?.ai_analysis?.documents) ? data.ai_analysis.documents : [];
      res.json({
        ...data,
        attachments,
        documents: mapCitizenDocuments(documents.length > 0 ? documents : fallbackDocuments),
      });
    } catch (error) {
      next(error);
    }
  },

  trackComplaintByReference: async (req, res, next) => {
    try {
      const { referenceId } = req.params;
      const trimmedReferenceId = String(referenceId || '').trim();

      if (!REFERENCE_ID_REGEX.test(trimmedReferenceId)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid reference ID format. Expected format: Ref-YYYY-XXXXXX',
            format: 'Ref-2026-123456',
          },
        });
      }

      const { data: complaint, error } = await supabaseAdmin
        .from('complaints')
        .select(`
          id,
          reference_id,
          status,
          category,
          department,
          priority,
          summary,
          created_at,
          submitted_at,
          progress_percentage
        `)
        .eq('reference_id', trimmedReferenceId)
        .maybeSingle();

      if (error) throw error;
      if (!complaint) {
        return res.status(404).json({
          success: false,
          error: { message: 'No complaint found for this reference ID.' },
        });
      }

      const { data: history, error: historyError } = await supabaseAdmin
        .from('status_history')
        .select('new_status, notes, created_at')
        .eq('complaint_id', complaint.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) {
        logger.warn(`Status history fetch failed for complaint ${complaint.id}:`, historyError.message);
      }

      const documents = await documentService.getComplaintDocuments(complaint.id);

      const timeline = (history || []).map((entry) => ({
        status: entry.new_status || complaint.status || 'new',
        note: entry.notes || '',
        at: entry.created_at,
      }));

      const latestUpdate = timeline[0] || null;
      const safeProgress = typeof complaint.progress_percentage === 'number'
        ? complaint.progress_percentage
        : deriveProgressFromStatus(complaint.status);
      const safeLastUpdated = complaint.submitted_at || complaint.created_at || null;

      return res.json({
        success: true,
        complaint: {
          reference_id: complaint.reference_id,
          status: complaint.status || 'new',
          category: complaint.category || 'general',
          department: complaint.department || 'Pending routing',
          priority: complaint.priority || 'medium',
          summary: complaint.summary || 'No summary available yet.',
          created_at: complaint.created_at || null,
          submitted_at: complaint.submitted_at || complaint.created_at || null,
          updated_at: safeLastUpdated,
          progress_percentage: safeProgress,
          latest_update: latestUpdate?.at || safeLastUpdated,
          latest_note: latestUpdate?.note || '',
          documents: mapCitizenDocuments(documents),
          timeline,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  updateComplaintStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const { data, error } = await supabaseAdmin
        .from('complaints')
        .update({ status, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  deleteComplaint: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin
        .from('complaints')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};


