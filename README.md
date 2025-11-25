# HOUSTON MUSEUM OF FINE ARTS

Full-stack web application for Houston Museum of Fine Arts built with React, Node.js, and MySQL for COSC 3380: Database Systems

## Project Description

This full-stack application provides a comprehensive platform for Houston Museum of Fine Arts. Built with modern web technologies, it delivers a seamless user experience through an intuitive interface while maintaining robust backend functionality and reliable data management.

### Key Features 🚀

#### Visitor Experience
- Browse and explore available items/content

#### Employee Experience
- Data entry for everything visitor can see

#### Administrative Capabilities
- Manage user accounts and permissions
- Report Dashboard


## Technologies

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

### Database

![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

### Deployment

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![AWS RDS](https://img.shields.io/badge/AWS_RDS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)

### Version Control

![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

## Hosting Locally

### Prerequisites

- Git installed on your machine
- Latest version of Node.js
- MySQL installed locally

### Database Configuration

This project uses AWS RDS for database hosting. Ensure your `.env` file contains the correct AWS RDS endpoint and credentials to connect successfully. The database should be configured with the proper schema before running the application.

## Deployment

- **Frontend**: Deployed on Vercel with automatic deployments from the main branch
- **Backend**: Deployed on Render with environment variables configured
- **Database**: Hosted on AWS RDS (MySQL instance)


## Getting Started

1. **Open a terminal in the folder where you want the project to be**:

2. **Clone the repository** (from the root of the project):

   ```bash
   git clone https://github.com/yaozay/mfah-app.git
   cd mfah-app
   ```

3. **Make sure you are in main branch**:

   ```bash
   git checkout main
   ```

4. **Install dependencies**:

   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
5. **Run backend & frontend**

   ```bash - backend
   cd backend
   npm run dev
   ```
   
   ```bash - frontend(another terminal)
   cd frontend
   npm run dev
   ```

---

## Daily Workflow

### Starting Work

Always make sure you’re up to date before creating a new branch:

```bash
git checkout main
git pull origin main            # get the latest changes
git checkout -b feature/your-task   # create a new branch
```

### After Finishing Your Work

Before committing, make sure your code runs without errors.

```bash
git add .
git commit -m "Describe what you did"
git push origin feature/your-task
```

Then open a **Pull Request** on GitHub to merge your branch into `main`.

## Team Members

Yahya Ozay - 
Thu Pham - 
Nick Polycrates - 
Brayan Chavez - 
Kevin Santhosh

