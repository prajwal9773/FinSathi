import express from 'express';
import { upload, uploadReceipt, extractFromPDF, getUploadHistory } from '../controllers/receiptController.js';
import auth from '../middleware/auth.js';
import uploadMonitoring  from '../middleware/monitoring.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// POST /api/receipts/upload
// Upload and process receipt (image or PDF)
// Private
// Change this line in your routes file:
router.post('/upload-receipt', uploadMonitoring, upload.single('receipt'), uploadReceipt);

// POST /api/receipts/pdf-extract
// Extract transactions from PDF bank statement
// Private
router.post('/pdf-extract', uploadMonitoring, upload.single('pdf'), extractFromPDF);

// GET /api/receipts/history
// Get upload history
// Private
router.get('/history', getUploadHistory);

export default router;