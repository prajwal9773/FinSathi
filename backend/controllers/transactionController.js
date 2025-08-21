import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

//create transaction controller

export const getTransactions = async(req, res)=>{
    try{
        const{
            page = 1,
            limit = 10,
            type,
            category,
            startDate,
            endDate,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        //filtering user
        const filter = {userId: req.user._id};
        if(type && ["income", "expense"].includes(type)){
            filter.type = type;
        }
        if(category){
            filter.category = category;
        }

        if(startDate || endDate){
            filter.date = {};
            if(startDate){
                filter.date.$gte = new Date(startDate);
            }
            if(endDate){
                filter.date.$lte = new Date(endDate);
            }
        }

        const keyword = "";
const results = await Transaction.find({
  name: { $regex: keyword, $options: "i" }
});



        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

        //pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        //query
        const [transactions, total] = await Promise.all([
            Transaction.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
            Transaction.countDocuments(filter)
        ])


        const totalPages = Math.ceil(total / parseInt(limit));
        res.json({
            data:{
                transactions,
                pagination:{
                    currentPage: parseInt(page),
                   itemsPerPage: parseInt(limit),
                   totalItems: total,
                   totalPages,
                   hasNextPage: parseInt(page) < totalPages,
                   hasPreviousPage: parseInt(page) > 1,
                   results
                 
                }
            }
        })


    }
    catch(error){   
        console.log(error);
        res.status(500).json({message: "Internal server error"});


    }
}

// Get single transaction controller
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ 
      success: true,
      data: { transaction } 
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

//create transaction controller


export const createTransaction = async(req, res)=>{
    try{
        const {type, amount, category, description, date} = req.body;

        if(!type || !amount || !category || !description || !date){
            return res.status(400).json({message: "All fields are required"});
        }
        if(!["income", "expense"].includes(type)){
            return res.status(400).json({message: "Invalid type"});
        }
        if(isNaN(amount) || parseFloat(amount) <= 0){
            return res.status(400).json({message: "Amount must be a positive number"});
        }
       
         
        const transaction = new Transaction({
            userId: req.user._id,
            type,
            amount : parseFloat(amount),
            category,
            description,
            date : new Date(date)
        })
        await transaction.save();
        res.status(201).json({
            message: "Transaction created successfully",
            data: transaction
        })        

    }
    catch(error){
        console.log(error);
        if(error.name === "ValidationError"){
            return res.status(400).json({message: error.message});
        }
      
        res.status(500).json({message: "Internal server error"});
    }

}

//delete transaction controller

export const deleteTransaction = async(req,res)=>{
    try{
        const {id} = req.params;
        const transaction = await Transaction.findOneAndDelete({
            _id: id,
            userId: req.user._id
        })
        if(!transaction){
            return res.status(404).json({message: "Transaction not found"});
        }
        res.status(200).json({message: "Transaction deleted successfully"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error"});
    }
}

export const getSummary = async(req, res)=>{
    try{
        const {startDate, endDate} = req.query;
        const summary = await Transaction.getUserSummary(req.user._id, startDate, endDate);
        res.status(200).json({
            message: "Summary fetched successfully",
            data: summary
        })

    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error"});
    }
}
export const getChartData = async(req, res)=>{
    try{
       const{type = 'category', startDate, endDate, year} = req.query;
       
       // For now, just return all user transactions
       const data = await Transaction.find({ userId: req.user._id });
       
       res.status(200).json({
           success: true,
           data: data
       });
       
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error"});
    }
}


export const getCategories = async(req, res)=>{
    try{
        const categories = {
            expense: [
              'Food', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare',
              'Education', 'Utilities', 'Rent', 'Insurance', 'Travel', 'Other Expenses'
            ],
            income: [
              'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other Income'
            ]
          };
          res.status(200).json({
            message: "Categories fetched successfully",
            data: categories
          })
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error"});
    }
}


export const updateTransaction = async(req, res)=>{
    try{
        const {id} = req.params;
        const {type, amount, category, description, date} = req.body;
        const transaction = await Transaction.findOne({
            _id: id,
            userId: req.user._id
        })
        if(!transaction){
            return res.status(404).json({message: "Transaction not found"});
        }
        transaction.type = type;
        transaction.amount = amount;
        transaction.category = category;
        transaction.description = description;
        transaction.date = date;
        await transaction.save();
        res.status(200).json({message: "Transaction updated successfully"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error"});
    }
}

