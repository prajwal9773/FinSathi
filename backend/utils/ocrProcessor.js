import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Validate API key exists - but don't throw error during import
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('⚠️  GEMINI_API_KEY is not set in environment variables');
}

async function processReceipt(imagePath) {
  try {
    // Validate API key before making request
    if (!process.env.GEMINI_API_KEY || !genAI) {
      throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Convert image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Determine MIME type based on file extension
    const ext = path.extname(imagePath).toLowerCase();
    let mimeType = 'image/png';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.gif':
        mimeType = 'image/gif';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
      default:
        mimeType = 'image/png';
    }

    const prompt = `
      Analyze this receipt/bill image and extract the following information:
      
      1. Total amount (the final amount to be paid)
      2. Date of transaction (in YYYY-MM-DD format)
      3. Type of transaction (usually "Expense" for receipts)
      4. Category based on the merchant/items:
         - Food & Dining (restaurants, groceries, food delivery)
         - Transportation (gas, parking, public transport)
         - Shopping (retail, clothing, electronics)
         - Healthcare (pharmacy, medical, dental)
         - Entertainment (movies, games, subscriptions)
         - Utilities (electricity, water, internet, phone)
         - Other (anything else)
      
      Please return ONLY a valid JSON object in this exact format:
      {
        "amount": 0.00,
        "date": "YYYY-MM-DD",
        "type": "Expense",
        "category": "Category Name"
      }
      
      If you cannot determine a value, use reasonable defaults:
      - amount: 0.00
      - date: today's date
      - type: "Expense"
      - category: "Other"
    `;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
    ]);

    const response = result.response;
    
    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const responseText = response.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    // Validate and sanitize the extracted data
    return {
      amount: parseFloat(parsedData.amount) || 0,
      category: parsedData.category || 'Other',
      description: `Receipt from ${parsedData.category || 'merchant'}`,
      date: parsedData.date ? new Date(parsedData.date) : new Date(),
      rawText: responseText,
    };

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Return default values instead of null to prevent downstream errors
    return {
      amount: 0,
      category: 'Other',
      description: 'Receipt transaction (processing failed)',
      date: new Date(),
      rawText: error.message || 'Processing failed',
      error: true
    };
  }
}

export default processReceipt;