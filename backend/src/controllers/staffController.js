import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const staffController = {
  addStaff: async (req, res) => {
    try {
      logger.info('Add staff request received', {
        username: req.body?.username,
        email: req.body?.email,
        fields: Object.keys(req.body || {})
      });
      const {
        username,
        password,
        staff_name,
        email,
        position,
        phone,
        expertise_area
      } = req.body || {};

      const required = ['username', 'password', 'staff_name', 'email', 'position'];
      const missing = required.filter((field) => !req.body?.[field] || String(req.body[field]).trim() === '');
      if (missing.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
      }

      const normalizedUsername = String(username).trim();
      const normalizedEmail = String(email).trim().toLowerCase();

      const { data: existing, error: existsError } = await supabase
        .from('staff')
        .select('id')
        .or(`username.eq.${normalizedUsername},email.eq.${normalizedEmail}`)
        .limit(1);

      if (existsError) {
        logger.error('Staff lookup error:', existsError);
        return res.status(500).json({ error: existsError.message || 'Failed to validate staff account' });
      }

      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(String(password), 10);

      const { data, error } = await supabase
        .from('staff')
        .insert({
          username: normalizedUsername,
          password_hash: passwordHash,
          staff_name: String(staff_name).trim(),
          email: normalizedEmail,
          position: String(position).trim(),
          phone: phone ? String(phone).trim() : null,
          expertise_area: expertise_area ? String(expertise_area).trim() : null,
          created_at: new Date().toISOString()
        })
        .select('id, username, staff_name, email, position, phone, expertise_area, created_at')
        .single();

      if (error) {
        logger.error('Add staff error:', error);
        const rawMessage = error.message || '';
        const isRls = rawMessage.toLowerCase().includes('row-level security policy');
        const message = error.code === '23505'
          ? 'User already exists'
          : isRls
            ? 'Insert blocked by Supabase RLS. Add an INSERT policy for staff table or use service role key.'
            : rawMessage || 'Failed to create staff member';
        return res.status(500).json({ error: message });
      }

      return res.status(201).json({ success: true, staff: data });
    } catch (error) {
      logger.error('Add staff error:', error);
      return res.status(500).json({ error: error.message || 'Failed to create staff member' });
    }
  },

  listStaff: async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, username, staff_name, email, position, phone, expertise_area, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Get staff error:', error);
        return res.status(500).json({ error: 'Failed to fetch staff' });
      }

      return res.json({ success: true, staff: data || [] });
    } catch (error) {
      logger.error('Get staff error:', error);
      return res.status(500).json({ error: 'Failed to fetch staff' });
    }
  }
};
