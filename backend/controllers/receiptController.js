import multer from "multer";
import path from "path";
import fs from "fs";
import Transaction from "../models/Transaction.js";
import processReceipt from "../utils/ocrProcessor.js";
import {processPDFWithGemini} from "../utils/pdfProcessor.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'receipts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//multer configuration

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF) and PDF files are allowed'));
    }
  };

 export const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 * 2// 20MB limit
    },
    fileFilter: fileFilter
  });

//upload receipt controller

export const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    let extractedData;

    try {
      if (fileExtension === '.pdf') {
        extractedData = await processPDFWithGemini(filePath);
      } else {
        extractedData = await processReceipt(filePath);
      }

      // Use fs.promises.unlink or add await
      await fs.promises.unlink(filePath); // Fixed this line

      if (!extractedData || !extractedData.amount) {
        return res.status(400).json({
          message: 'Could not extract transaction data from receipt',
          data: { rawText: extractedData?.rawText || '' }
        });
      }

      // Create transaction from extracted data
      const transaction = new Transaction({
        userId: req.user._id,
        type: 'expense',
        amount: extractedData.amount,
        category: extractedData.category || 'Other Expenses',
        description: extractedData.description || 'Receipt transaction',
        date: extractedData.date || new Date(),
        extractedFromReceipt: true
      });

      await transaction.save();

      res.json({
        message: 'Receipt processed successfully',
        data: {
          transaction,
          extractedData
        }
      });

    } catch (processingError) {
      // Clean up file on processing error
      try {
        await fs.promises.unlink(filePath); 
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
      throw processingError;
    }

  } catch (error) {
    console.error('Upload receipt error:', error);
    
    if (error.message.includes('Only image files')) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Server error while processing receipt'
    });
  }
};

  // Extract transactions from PDF bank statement
export const extractFromPDF = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No PDF file uploaded'
        });
      }
  
      const filePath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
  
      if (fileExtension !== '.pdf') {
         fs.unlink(filePath);
        return res.status(400).json({
          success: false,
          message: 'Only PDF files are allowed for transaction extraction'
        });
      }
  
      try {
        const extractedTransactions = await processPDFWithGemini(filePath, true);
        
        // Clean up uploaded file
         fs.unlink(filePath);
  
        if (!extractedTransactions || extractedTransactions.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No transactions found in the PDF'
          });
        }
  
        // Create transactions in bulk
        const transactions = extractedTransactions.map(data => ({
          userId: req.user._id,
          type: data.type || 'expense',
          amount: data.amount,
          category: data.category || 'Other Expenses',
          description: data.description || 'PDF extracted transaction',
          date: data.date || new Date(),
          extractedFromReceipt: true
        }));
  
        const savedTransactions = await Transaction.insertMany(transactions);
  
        res.json({
          success: true,
          message: `Successfully extracted ${savedTransactions.length} transactions from PDF`,
          data: {
            transactions: savedTransactions,
            count: savedTransactions.length
          }
        });
  
      } catch (processingError) {
        // Clean up file on processing error
        try {
          fs.unlink(filePath);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
        throw processingError;
      }
  
    } catch (error) {
      console.error('Extract from PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while extracting transactions from PDF'
      });
    }
  };


 export const getUploadHistory = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      const [transactions, total] = await Promise.all([
        Transaction.find({
          userId: req.user._id,
          extractedFromReceipt: true
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Transaction.countDocuments({
          userId: req.user._id,
          extractedFromReceipt: true
        })
      ]);
  
      const totalPages = Math.ceil(total / parseInt(limit));
  
      res.json({
        data: {
          transactions,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get upload history error:', error);
      res.status(500).json({
        message: 'Server error while fetching upload history'
      });
    }
  };
