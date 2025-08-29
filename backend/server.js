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
import goalRoutes from "./routes/goals.js";

dotenv.config();

connectDB();

const app = express();

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
});

//Middleware

app.use(cors());

// Then apply other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

//Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50000
});
app.use(limiter);

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/goals", goalRoutes);

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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
