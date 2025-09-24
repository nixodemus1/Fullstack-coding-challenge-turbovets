# Fullstack-coding-challenge-turbovets
coding challenge from turbovets hiring. this is my submission

# Secure Task Management System

## Project Setup

### Prerequisites
- Node.js (v16 or later)
- npm (v8 or later)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd Fullstack-coding-challenge-turbovets
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Applications

#### Backend (NestJS)
1. Navigate to the backend folder:
   ```bash
   cd Apps/api
   ```
2. Start the backend server:
   ```bash
   npm run start:dev
   ```

#### Frontend (Angular)
1. Navigate to the frontend folder:
   ```bash
   cd Apps/dashboard
   ```
2. Start the frontend server:
   ```bash
   npm start
   ```

### Project Structure
- `Apps/api`: NestJS backend application.
- `Apps/dashboard`: Angular frontend application.
- `Libraries/auth`: Shared library for RBAC logic and decorators.
- `Libraries/data`: Shared library for TypeScript interfaces and DTOs.

### Future Enhancements
- Implement advanced role delegation.
- Add JWT refresh tokens and CSRF protection.
- Optimize RBAC caching for scalability.
