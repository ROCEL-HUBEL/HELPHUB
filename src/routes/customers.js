import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import Customer from "../models/customer.js";
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(process.cwd(), 'src/uploads')),
  filename: (_, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g,'_'))
});
const upload = multer({ storage });

// Get my profile
router.get('/me', requireAuth, requireRole('customer','provider','admin'), async (req, res) => {
  const [[u]] = await pool.query('SELECT id,role,full_name,email,username,avatar_url,country,mobile_number,digital_address FROM users WHERE id=?', [req.user.id]);
  res.json(u || null);
});

// Update basic fields
router.post('/me', requireAuth, requireRole('customer','provider'), async (req, res) => {
  const { full_name, username, digital_address, country, mobile_number } = req.body;
  await pool.query(
    `UPDATE users SET full_name=?, username=?, digital_address=?, country=?, mobile_number=?
     WHERE id=?`,
    [full_name, username, digital_address, country, mobile_number, req.user.id]
  );
  res.json({ message: 'Profile updated' });
});

// Upload avatar
router.post('/me/avatar', requireAuth, requireRole('customer','provider'), upload.single('avatar'), async (req, res) => {
  const url = `/uploads/${req.file.filename}`;
  await pool.query('UPDATE users SET avatar_url=? WHERE id=?', [url, req.user.id]);
  res.json({ avatar_url: url });
});

export default router;
