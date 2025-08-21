# Personal Finance Assistant  

A full-stack personal finance assistant built with **MERN Stack (MongoDB, Express, React, Node.js)**.  
This app helps users manage their finances by tracking income, expenses, and receipts, while also visualizing spending trends using interactive charts.  

---

## Demo Video  
[![Watch the demo]https://drive.google.com/file/d/1FvqC5H9ClQ7_o6anuHKR-xdniN7HTB5n/view?usp=sharing]  
*(Click to watch a quick demo of the project)*  

---

## Table of Contents  
- [Features](#features)  
- [Screenshots](#screenshots)  
- [Available Routes](#available-routes)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Environment Variables](#environment-variables)  
  - [Run the Project](#run-the-project)  

- [Future Enhancements](#future-enhancements)  
- [License](#license)  

---

## Features  
- **User Authentication** – Register, Login, Logout (JWT-based)  
- **Transaction Management** – Add, edit, delete, categorize income & expenses  
- **Receipt Upload** – Upload images/PDF and auto-extract transaction data  
- **AI-Powered OCR & Parsing** – Uses **Google Gemini AI** to extract and parse content from receipts & PDF bank statements  
- **Data Visualization** – Interactive financial charts for spending insights  
- **User Dashboard** – Summary & insights for better planning  

---

## Screenshots  
*(Add your actual screenshots here)*  

### Dashboard  
![Dashboard Screenshot](screenshots/dashboard.png)  

### Transactions  
![Transactions Screenshot](screenshots/transactions.png)  

### Receipt Upload  
![Receipt Upload Screenshot](screenshots/receipt-upload.png)  

---

## Available Routes  

### **Frontend (React)**  
- `/login` – User login  
- `/register` – User registration  
- `/dashboard` – Dashboard with summary  
- `/transactions` – List all transactions  
- `/add-transaction` – Add a new transaction  
- `/uploaded-receipt` – Upload receipts  
- `/charts` – Interactive financial charts  

### **Backend (Node.js API)**  

#### Auth Routes (`/api/auth`)  
| Method | Endpoint   | Description             |
|--------|------------|-------------------------|
| POST   | /login     | User login             |
| POST   | /register  | User registration      |
| GET    | /me        | Get current user       |
| POST   | /logout    | Logout user            |

#### Transaction Routes (`/api/transactions`)  
| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| GET    | /                    | Get all transactions        |
| POST   | /                    | Add transaction             |
| PUT    | /:id                 | Update transaction          |
| DELETE | /:id                 | Delete transaction          |
| GET    | /summary             | Get summarized data         |
| GET    | /charts              | Get chart data              |
| GET    | /categories          | Get all categories          |

#### Receipt Routes (`/api/receipts`)  
| Method | Endpoint         | Description                                |
|--------|-----------------|--------------------------------------------|
| POST   | /upload         | Upload receipt (image/PDF) for OCR & Gemini AI parsing |
| POST   | /pdf-extract    | Extract from PDF bank statement using Gemini AI |
| GET    | /history        | Get upload history                         |

---

## Tech Stack  
- **Frontend:** React, TailwindCSS, Lucide Icons  
- **Backend:** Node.js, Express.js, Mongoose  
- **Database:** MongoDB Atlas  
- **Authentication:** JWT  
- **File Uploads:** Multer  
- **AI/ML:** **Google Gemini AI** for OCR & intelligent data parsing  

---

## Getting Started  

### Prerequisites  
- Node.js  
- MongoDB Atlas or Local MongoDB  

### Installation  
```bash
# Clone repo
git clone https://github.com/prajwal9773/FinSathi.git
cd FinSathi

# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
