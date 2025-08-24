import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

export const initGemini = () => {
  console.log('Environment variables:', {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***' : 'Not found',
    NODE_ENV: process.env.NODE_ENV
  });
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not defined in environment variables');
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  return new GoogleGenerativeAI(apiKey);
};

export const generateSpendingInsights = async (transactionData) => {
  try {
    console.log('Initializing Gemini AI with transaction data...');
    console.log('Transaction data structure:', JSON.stringify({
      totalTransactions: transactionData.totalTransactions,
      timeRange: transactionData.timeRange,
      categoryCount: Object.keys(transactionData.spendingByCategory || {}).length
    }, null, 2));

    const genAI = initGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a helpful financial assistant. Analyze the following transaction data and provide 3-5 personalized spending insights in a friendly, conversational tone. also note that amount i in rupees
    Focus on:
    1. Spending patterns compared to previous periods
    2. Notable changes in spending categories
    3. Potential savings opportunities
    
    Transaction Data Summary:
    - Total Transactions: ${transactionData.totalTransactions}
    - Analysis Period: ${new Date(transactionData.timeRange.start).toLocaleDateString()} to ${new Date(transactionData.timeRange.end).toLocaleDateString()}
    - Spending by Category: ${JSON.stringify(transactionData.spendingByCategory, null, 2)}
    
    Please provide 3-5 insights in the following JSON format:
    ["insight 1", "insight 2", "insight 3"]`;

    // console.log('Sending prompt to Gemini AI...');
    // console.log('Prompt length:', prompt.length);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // console.log('Raw response from Gemini:', text);
    
    // Try to extract JSON array from the response
    try {
      // Look for JSON array in the response
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      
      // If no array found, try to parse the entire response as JSON
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      
      // If we got here, the response wasn't in the expected format
      console.warn('Unexpected response format from Gemini AI:', text);
      return [
        "We've analyzed your spending, but couldn't generate detailed insights at this time.",
        "Please check back later or add more transactions for better analysis."
      ];
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // If parsing fails, return a generic message
      return [
        "We're having trouble analyzing your spending data right now.",
        "Our team has been notified and we'll fix this issue shortly."
      ];
    }
  } catch (error) {
    console.error('Error in generateSpendingInsights:', error);
    throw new Error(`Failed to generate spending insights: ${error.message}`);
  }
};
