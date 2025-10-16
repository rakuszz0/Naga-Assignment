 Fastify Todo API
A robust REST API for a Todo application built with Fastify, MySQL, and JWT authentication. Features comprehensive documentation, pagination, and secure user management.

 Table of Contents
Features

Tech Stack

Project Structure

Prerequisites

Installation

Environment Variables

Database Setup

Running the Application

API Documentation

API Endpoints

Authentication

Error Handling

Development


  Features
 JWT Authentication - Secure user registration and login

 Todo Management - Full CRUD operations for todos

 User Profiles - User management and profile endpoints

 Pagination - Efficient data retrieval with pagination

 Input Validation - Comprehensive request validation

 API Documentation - Interactive Swagger/OpenAPI docs

 Health Checks - System monitoring endpoints

 Security - Password hashing, CORS, and middleware protection

 Database Migrations - Automated table creation and indexing

 Tech Stack
Runtime: Node.js

Framework: Fastify

Database: MySQL

Authentication: JWT

Documentation: Swagger/OpenAPI

Password Hashing: bcrypt

Environment Management: dotenv


 Project Structure
text
src/
├── config/
│   └── database.ts          # Database configuration and connection pool
├── controllers/
│   ├── authController.ts    # Authentication handlers
│   └── todoController.ts    # Todo CRUD handlers
├── middleware/
│   └── auth.ts             # JWT authentication middleware
├── models/
│   ├── User.ts             # User data model and methods
│   └── Todo.ts             # Todo data model and methods
├── routes/
│   ├── auth.ts             # Authentication routes
│   └── todos.ts            # Todo routes
├── types/
│   └── index.ts            # TypeScript type definitions
├── migrations/
│   └── init.ts             # Database table creation
└── app.ts                  # Fastify application setup
 Prerequisites
Before running this application, ensure you have:

Node.js (v16 or higher)

MySQL (v5.7 or higher)

npm or yarn package manager

 Installation
Clone the repository (or navigate to your project directory)

bash
git clone <repository-url>
cd your-project-directory
Install dependencies

bash
npm install
Set up environment variables

bash
cp .env.example .env
 Environment Variables
Create a .env file in the root directory:

env
# Server Configuration
PORT=5001
HOST=0.0.0.0
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=todo_app
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-12345-change-in-production

 Database Setup
Create MySQL database

sql
CREATE DATABASE todo_app;
Run database migrations

bash
npm run migrate
This will create:

users table with indexes

todos table with foreign key constraints

Automatic timestamp management

Soft delete functionality

 Running the Application
Development Mode
bash
npm run dev
Production Mode
bash
npm start
Build and Start
bash
npm run build
npm start
 API Documentation
Once the server is running, access the interactive API documentation:

text
http://localhost:5001/docs
The Swagger UI provides:

Complete endpoint documentation

Request/response schemas

Interactive testing

Authentication setup

 API Endpoints
Authentication Endpoints

Method	Endpoint	Description	Auth Required

POST	/api/auth/register	Register new user	No
POST	/api/auth/login	User login	No
GET	/api/auth/profile	Get user profile	Yes
Todo Endpoints
Method	Endpoint	Description	Auth Required
GET	/api/todos	Get paginated todos	Yes
GET	/api/todos/:id	Get specific todo	Yes
POST	/api/todos	Create new todo	Yes
PUT	/api/todos/:id	Update todo	Yes
DELETE	/api/todos/:id	Delete todo	Yes
System Endpoints
Method	Endpoint	Description
GET	/	API information
GET	/health	Health check

 Authentication
Registration
json
POST /api/auth/register
{
  "name": "Tester",
  "email": "test@example.com",
  "password": "password123"
}
Login
json
POST /api/auth/login
{
  "email": "lagi@example.com",
  "password": "password123"
}
Using Authentication
Include the JWT token in requests:

http
Authorization: Bearer <your-jwt-token>

 Example Usage
Create a Todo

bash
curl -X POST http://localhost:5001/api/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, Eggs, Bread"
  }'
Get Paginated Todos
bash
curl "http://localhost:5001/api/todos?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

 
 Error Handling
The API returns standardized error responses:

json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional information if available"
}
Common Error Codes
USER_EXISTS - User already registered

INVALID_CREDENTIALS - Wrong email/password

TODO_NOT_FOUND - Todo doesn't exist or not owned by user

VALIDATION_ERROR - Request validation failed

INVALID_TOKEN - JWT token is invalid or expired


Development
Available Scripts
bash
npm run dev          # Development with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
npm run migrate     # Run database migrations
npm test           # Run tests (if available)
Code Structure Highlights
Controllers: Handle HTTP requests and responses

Models: Database operations and business logic

Middleware: Authentication and request processing

Routes: API endpoint definitions

Types: TypeScript type definitions for type safety

Adding New Features
Define types in types/index.ts

Create model methods in appropriate model file

Add controller handlers

Define routes with schemas

Update API documentation in route schemas


 Database Schema
Users Table
sql
id INT AUTO_INCREMENT PRIMARY KEY
name VARCHAR(255) NOT NULL
email VARCHAR(255) UNIQUE NOT NULL
password VARCHAR(255) NOT NULL
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at TIMESTAMP NULL
Todos Table
sql
id INT AUTO_INCREMENT PRIMARY KEY
title VARCHAR(255) NOT NULL
description TEXT
is_done BOOLEAN DEFAULT FALSE
user_id INT NOT NULL
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at TIMESTAMP NULL
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
INDEX idx_user_id (user_id)


 Security Features
Password hashing with bcrypt

JWT token expiration (7 days)

CORS protection

Input validation and sanitization

SQL injection prevention with parameterized queries

Authentication middleware for protected routes
