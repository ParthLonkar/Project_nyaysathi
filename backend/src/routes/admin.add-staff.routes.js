import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const REQUIRED_FIELDS = ['username', 'password', 'staff_name', 'email', 'position'];

router.post('/add-staff', verifyToken, verifyAdminRole, async (req, res) => {
  try {
    const {
      username,
      password,
      staff_name,
      email,
      position,
      phone,
      expertise_area
    } = req.body || {};

    const missingFields = REQUIRED_FIELDS.filter(field => {
      const value = req.body?.[field];
      return !value || String(value).trim().length === 0;
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const normalizedUsername = String(username).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    const passwordHash = await bcrypt.hash(String(password), 10);

    const staffInsertPayload = {
      username: normalizedUsername,
      password_hash: passwordHash,
      staff_name: String(staff_name).trim(),
      email: normalizedEmail,
      position: String(position).trim(),
      phone: phone ? String(phone).trim() : null,
      expertise_area: expertise_area ? String(expertise_area).trim() : null,
      is_active: true
    };

    // Try inserting into "staff" table first (new staff directory table)
    const { data: createdStaff, error: insertError } = await supabase
      .from('staff')
      .insert(staffInsertPayload)
      .select('id, username, staff_name, email, position, phone, expertise_area, is_active, created_at')
      .single();

    if (!insertError) {
      return res.status(201).json({
        success: true,
        staff: createdStaff
      });
    }

    const insertMessage = insertError.message || '';
    const isMissingStaffTable = insertMessage.toLowerCase().includes('relation') && insertMessage.toLowerCase().includes('staff');

    if (!isMissingStaffTable) {
      logger.error('Add staff insert error:', insertError);
      const isDuplicate = insertError.code === '23505';
      const isRls = insertMessage.toLowerCase().includes('row-level security policy');
      return res.status(500).json({
        error: isDuplicate
          ? 'User already exists'
          : isRls
            ? 'Insert blocked by Supabase RLS. Add an INSERT policy for staff table or use service role key.'
            : insertMessage || 'Failed to create staff account'
      });
    }

    // Fallback: insert into department_staff if "staff" table doesn't exist
    const { department_id, id: admin_id } = req.user || {};
    if (!department_id || !admin_id) {
      return res.status(400).json({ error: 'Department context missing for staff creation' });
    }

    const { data: existingDept, error: existingDeptError } = await supabase
      .from('department_staff')
      .select('id')
      .or(`username.eq.${normalizedUsername},email.eq.${normalizedEmail}`)
      .limit(1);

    if (existingDeptError) {
      logger.error('Department staff lookup error:', existingDeptError);
      return res.status(500).json({ error: existingDeptError.message || 'Failed to validate staff account' });
    }

    if (existingDept && existingDept.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const { data: createdDeptStaff, error: insertDeptError } = await supabase
      .from('department_staff')
      .insert({
        ...staffInsertPayload,
        department_id,
        admin_id
      })
      .select('id, username, staff_name, email, position, phone, expertise_area, is_active, created_at')
      .single();

    if (insertDeptError) {
      logger.error('Add department staff insert error:', insertDeptError);
      const rawMessage = insertDeptError.message || '';
      const isDuplicate = insertDeptError.code === '23505';
      const isRls = rawMessage.toLowerCase().includes('row-level security policy');
      return res.status(500).json({
        error: isDuplicate
          ? 'User already exists'
          : isRls
            ? 'Insert blocked by Supabase RLS. Add an INSERT policy for department_staff or use service role key.'
            : rawMessage || 'Failed to create staff account'
      });
    }

    return res.status(201).json({
      success: true,
      staff: createdDeptStaff,
      source: 'department_staff'
    });
  } catch (error) {
    logger.error('Add staff error:', error);
    return res.status(500).json({ error: 'Unexpected error while creating staff' });
  }
});

export default router;
