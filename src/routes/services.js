import { Router } from 'express';
import Customer from "../models/customer.js";
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// List services (filter by category optional)99999999999
router.get('/', async (req, res) => {
  const { category } = req.query;
  const [rows] = category
    ? await pool.query('SELECT * FROM services WHERE category=? ORDER BY name', [category])
    : await pool.query('SELECT * FROM services ORDER BY category, name');
  res.json(rows);
});

// Admin can seed / create services later — omitted for brevity

// Find providers for a service
router.get('/:serviceId/providers', requireAuth, async (req, res) => {
  const serviceId = +req.params.serviceId;
  const [rows] = await pool.query(`
    SELECT u.id as user_id, u.full_name, u.avatar_url, pp.id as provider_profile_id, pp.status
    FROM provider_profiles pp
    JOIN provider_services ps ON ps.provider_id = pp.id
    JOIN users u ON u.id = pp.user_id
    WHERE ps.service_id=? AND pp.status='approved'
  `, [serviceId]);
  res.json(rows);
});

export default router;
