
import fs from "fs";


import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function processPDFWithGemini(pdfPath, isTransactionHistory = false) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64PDF = pdfBuffer.toString('base64');

    const prompt = isTransactionHistory
      ? `
        This is a bank statement PDF. Extract all transactions.
        Each transaction should have:
        - date (YYYY-MM-DD)
        - amount (positive for credit, negative for debit)
        - description
        - type ("income" or "expense")
        - category (Food, Transportation, Shopping, Healthcare, Entertainment, Utilities, Salary, Investment, Other)
        Return JSON array: 
        [{"date":"YYYY-MM-DD","amount":123.45,"description":"string","type":"expense","category":"string"}]
      `
      : `
        This is a receipt PDF. Extract:
        - total amount
        - transaction date
        - merchant name
        - category (Food, Transportation, Shopping, Healthcare, Entertainment, Utilities, Other)
        Return JSON:
        {"amount":123.45,"date":"YYYY-MM-DD","merchant":"string","category":"string"}
      `;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64PDF,
        },
      },
    ]);

    const responseText = result.response.candidates[0].content.parts[0].text;

    // Extract JSON (Gemini might add explanation text)
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    const jsonArrayStart = responseText.indexOf('[');
    const jsonArrayEnd = responseText.lastIndexOf(']');

    let parsedData;
    if (isTransactionHistory && jsonArrayStart !== -1 && jsonArrayEnd !== -1) {
      parsedData = JSON.parse(responseText.slice(jsonArrayStart, jsonArrayEnd + 1));
    } else {
      parsedData = JSON.parse(responseText.slice(jsonStart, jsonEnd + 1));
    }

    return parsedData;
  } catch (error) {
    console.error('Gemini PDF parsing error:', error);
    throw new Error('Failed to process PDF file with Gemini');
  }
}

const categorizeTransaction = (description) => {
    const descLower = description.toLowerCase();
    
    const categories = {
      'Food': ['restaurant', 'cafe', 'food', 'dining', 'mcdonald', 'burger', 'pizza', 'coffee', 'grocery', 'supermarket'],
      'Transportation': ['gas', 'fuel', 'taxi', 'uber', 'lyft', 'bus', 'metro', 'parking', 'car', 'auto'],
      'Shopping': ['amazon', 'walmart', 'target', 'store', 'shop', 'retail', 'clothing', 'fashion'],
      'Healthcare': ['pharmacy', 'hospital', 'clinic', 'doctor', 'medical', 'health', 'drug', 'cvs'],
      'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment', 'ticket'],
      'Utilities': ['electric', 'power', 'water', 'internet', 'phone', 'utility', 'bill', 'verizon', 'att'],
      'Salary': ['salary', 'payroll', 'wage', 'income', 'pay'],
      'Investment': ['dividend', 'interest', 'investment', 'stock', 'bond']
    };
  
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => descLower.includes(keyword))) {
        return category;
      }
    }
  
    return 'Other Expenses';
  };

  export { categorizeTransaction, processPDFWithGemini };


