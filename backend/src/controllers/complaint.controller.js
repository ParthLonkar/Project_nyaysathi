import { logger } from '../utils/logger.js';
import { pythonService } from '../services/python.service.js';
import { supabaseAdmin } from '../config/supabase.js';
import { attachmentService } from '../services/attachment.service.js';
import { routeComplaint, generateRoutingRecommendations } from '../services/routing.service.js';

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
            documentValid: aiResult?.document_valid,
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

      const savedAttachments = await attachmentService.persistAttachments(
        complaint.id,
        uploadedFiles,
        metadataAttachments
      );
      logger.info(
        `Attachment persistence complete for complaint ${complaint.id}`,
        JSON.stringify({ requested: uploadedFiles.length, saved: savedAttachments.length })
      );

      const aiAuditPayload = {
        ...aiResult,
        routing_info: routingDecision,
        routing_recommendations: routingRecommendations,
        attachments: savedAttachments,
        ai_analysis: {
          ...aiResult,
          routing_info: routingDecision,
          routing_recommendations: routingRecommendations,
          agent_flow: {
            intake: 'completed',
            routing: 'completed',
            drafting: aiResult?.drafting ? 'completed' : 'pending',
            compliance: aiResult?.compliance ? 'completed' : 'pending',
            action: 'completed',
          },
          attachments: savedAttachments,
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
        routing_info: routingDecision,
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

      res.status(201).json({
        success: true,
        caseId: complaint.id,
        aiResult: { ...aiResult, routing_info: routingDecision, routing_recommendations: routingRecommendations },
        complaint: updatedComplaint,
        attachments: savedAttachments,
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
      res.json({
        ...data,
        attachments,
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


