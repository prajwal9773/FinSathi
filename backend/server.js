import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transaction.js";
import receiptRoutes from "./routes/receipts.js";
import budgetRoutes from "./routes/budgets.js";
import insightRoutes from "./routes/insights.js";


dotenv.config();



connectDB();

const app = express();

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
  });

//Middleware
// Replace the corsOptions with this simpler version for testing

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

// CORS setup
app.use(
  cors({
    origin: [
      "http://3.109.2.255",
      "http://3.109.2.255:5173",
      "http://localhost:5173" // Vite dev
    ],
    credentials: true,
  })
);



// Then apply other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

//Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000
});
app.use(limiter);

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/insights", insightRoutes);


//Health check
app.get("/api/health", (req,res)=>{
    res.json({message: "API is running"})
});

//Error handler

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});
