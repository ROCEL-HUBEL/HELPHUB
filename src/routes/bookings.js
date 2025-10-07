import { Router } from 'express';
import Customer from "../models/customer.js";
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Create booking (customer)
router.post('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Only customers' });
  const { provider_user_id, service_id, booking_date, booking_time, address, notes } = req.body;
  await pool.query(
    `INSERT INTO bookings (user_id, provider_user_id, service_id, booking_date, booking_time, address, notes)
     VALUES (?,?,?,?,?,?,?)`,
    [req.user.id, provider_user_id, service_id, booking_date, booking_time, address, notes]
  );
  res.json({ message: 'Booking created' });
});

// List my bookings (customer / provider)
router.get('/mine', requireAuth, async (req, res) => {
  let rows;
  if (req.user.role === 'customer') {
    [rows] = await pool.query(`
      SELECT b.*, s.name AS service_name
      FROM bookings b JOIN services s ON s.id=b.service_id
      WHERE b.user_id=? ORDER BY b.created_at DESC
    `, [req.user.id]);
  } else if (req.user.role === 'provider') {
    [rows] = await pool.query(`
      SELECT b.*, s.name AS service_name
      FROM bookings b JOIN services s ON s.id=b.service_id
      WHERE b.provider_user_id=? ORDER BY b.created_at DESC
    `, [req.user.id]);
  } else {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(rows);
});

// Update booking status (provider)
router.post('/:id/status', requireAuth, async (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Only providers' });
  const id = +req.params.id;
  const { status } = req.body; // Pending, Confirmed, Completed, Cancelled
  await pool.query('UPDATE bookings SET status=? WHERE id=? AND provider_user_id=?', [status, id, req.user.id]);
  res.json({ message: 'Status updated' });
});

// Rate after completion (customer)
router.post('/:id/rate', requireAuth, async (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Only customers' });
  const id = +req.params.id;
  const { rating, review } = req.body;
  // ensure booking belongs to customer & completed
  const [[bk]] = await pool.query('SELECT * FROM bookings WHERE id=? AND user_id=?', [id, req.user.id]);
  if (!bk || bk.status !== 'Completed') return res.status(400).json({ error: 'Cannot rate yet' });

  await pool.query(
    `INSERT INTO ratings (booking_id, customer_id, provider_user_id, rating, review)
     VALUES (?,?,?,?,?)`,
    [id, req.user.id, bk.provider_user_id, rating, review]
  );
  res.json({ message: 'Thanks for your rating!' });
});

export default router;
