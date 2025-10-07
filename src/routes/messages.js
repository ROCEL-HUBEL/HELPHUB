// src/routes/messages.js
import { Router } from 'express';
import Customer from "../models/customer.js";
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/:peerId', requireAuth, async (req, res) => {
  const peerId = +req.params.peerId;
  const [rows] = await pool.query(
    `SELECT * FROM messages
     WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)
     ORDER BY created_at ASC`,
    [req.user.id, peerId, peerId, req.user.id]
  );
  res.json(rows);
});

router.post('/:peerId', requireAuth, async (req, res) => {
  const peerId = +req.params.peerId;
  const { body, attachment_url=null, voice_url=null } = req.body;
  const [result] = await pool.query(
    `INSERT INTO messages (sender_id,receiver_id,body,attachment_url,voice_url) VALUES (?,?,?,?,?)`,
    [req.user.id, peerId, body, attachment_url, voice_url]
  );
  // emit via socket.io (if connected)
  req.app.get('io')?.to(String(peerId)).emit('message:new', {
    id: result.insertId, sender_id: req.user.id, receiver_id: peerId, body, attachment_url, voice_url, created_at: new Date()
  });
  res.json({ message: 'sent' });
});

export default router;
