import { Router } from 'express';
import Customer from "../models/customer.js";
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// List providers awaiting approval
router.get('/providers/pending', requireAuth, requireRole('admin'), async (req, res) => {
  const [rows] = await pool.query(`
    SELECT u.id as user_id, u.full_name, u.email, pp.id as provider_profile_id, pp.type, pp.status
    FROM provider_profiles pp
    JOIN users u ON u.id = pp.user_id
    WHERE pp.status IN ('pending','under_review')
  `);
  res.json(rows);
});

// Provider docs
router.get('/providers/:providerProfileId/docs', requireAuth, requireRole('admin'), async (req, res) => {
  const id = +req.params.providerProfileId;
  const [rows] = await pool.query('SELECT * FROM provider_documents WHERE provider_id=?', [id]);
  res.json(rows);
});

// Approve / Reject / Suspend provider
router.post('/providers/:providerProfileId/status', requireAuth, requireRole('admin'), async (req, res) => {
  const id = +req.params.providerProfileId;
  const { action, comment } = req.body; // 'approve' | 'reject' | 'suspend'
  const map = { approve: 'approved', reject: 'rejected', suspend: 'suspended' };
  const status = map[action];
  if (!status) return res.status(400).json({ error: 'Invalid action' });

  await pool.query('UPDATE provider_profiles SET status=? WHERE id=?', [status, id]);
  if (comment) {
    await pool.query('UPDATE provider_documents SET reviewer_comment=? WHERE provider_id=?', [comment, id]);
  }
  res.json({ message: `Provider ${status}` });
});

// Announcements
router.post('/announcements', requireAuth, requireRole('admin'), async (req, res) => {
  const { audience='all', target_user_id=null, title, body } = req.body;
  await pool.query(
    'INSERT INTO announcements (audience,target_user_id,title,body) VALUES (?,?,?,?)',
    [audience, target_user_id, title, body]
  );
  res.json({ message: 'Announcement created' });
});

router.get('/announcements', requireAuth, requireRole('admin'), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
  res.json(rows);
});

export default router;
