import { Router } from 'express';
import Customer from "../models/customer.js";
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  if (!['customer','provider'].includes(req.user.role)) return res.status(403).json({ error: 'Only users' });
  const { message, stars=0 } = req.body;
  await pool.query(
    'INSERT INTO feedback (user_id, role, message, stars) VALUES (?,?,?,?)',
    [req.user.id, req.user.role, message, stars]
  );
  res.json({ message: 'Feedback submitted' });
});

// Admin reply is in admin-feedback UI; we store reply here:
router.post('/:id/reply', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admin' });
  const id = +req.params.id;
  const { reply } = req.body;
  await pool.query('UPDATE feedback SET admin_reply=? WHERE id=?', [reply, id]);
  res.json({ message: 'Reply saved' });
});

router.get('/', requireAuth, async (req, res) => {
  // Admin sees all; others see their own
  if (req.user.role === 'admin') {
    const [rows] = await pool.query('SELECT * FROM feedback ORDER BY created_at DESC');
    res.json(rows);
  } else {
    const [rows] = await pool.query('SELECT * FROM feedback WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  }
});

export default router;
