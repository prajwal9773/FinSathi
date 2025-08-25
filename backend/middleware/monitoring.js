// Add this middleware before your upload routes
import express from 'express';


export const uploadMonitoring = (req, res, next) => {
    const startTime = Date.now();
    
    console.log('Upload started:', {
      timestamp: new Date().toISOString(),
      contentLength: req.headers['content-length'],
      contentType: req.headers['content-type'],
      userAgent: req.headers['user-agent']
    });
  
    // Monitor the request
    req.on('data', (chunk) => {
      console.log(`Received chunk: ${chunk.length} bytes`);
    });
  
    req.on('end', () => {
      const duration = Date.now() - startTime;
      console.log(`Upload completed in ${duration}ms`);
    });
  
    req.on('error', (error) => {
      console.error('Upload error:', error);
    });
  
    req.on('aborted', () => {
      console.log('Upload aborted by client');
    });
  
    next();
  };
  export default uploadMonitoring;
  
  // Use it in your routes
  // app.post('/api/upload-receipt', uploadMonitoring, upload.single('receipt'), uploadReceipt);