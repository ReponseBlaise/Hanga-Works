# Hanga Works Backend

This is the backend API for **Hanga Works**, a Skills, Employment & Workforce Intelligence Platform. It is built using a modern, scalable, and modular architecture.

## 🛠️ Technology Stack
- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)
- **Language:** TypeScript
- **Authentication:** JWT (JSON Web Tokens) with Passport
- **API Documentation:** Swagger UI

---

## 🚀 Getting Started

### 1. Install Dependencies
Navigate to the `backend` folder and install the required npm packages:
```bash
cd backend
npm install
```

### 2. Environment Setup
Make sure you have a `.env` file in the root of the `backend` directory. Your `.env` should look something like this:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/Hanga?schema=public"
JWT_SECRET="your_secret_key"
```

### 3. Database Setup & Migrations
Sync your Prisma schema with your PostgreSQL database:
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Seeding the Database
You can populate the database with dummy data (Employers, Learners, Jobs, Courses, and Mentorship sessions) for testing purposes:
```bash
npx prisma db seed
```
*Note: This will safely wipe the old data and insert a fresh set of mock data.*

### 5. Start the Development Server
Start the NestJS server in watch mode:
```bash
npm run dev
```
The server will be running at **`http://localhost:3000`**.

---

## 📚 API Documentation (Swagger)

We use Swagger for interactive API documentation and testing. Once the server is running, open your browser and navigate to:

👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

From there, you can see every single available endpoint, their required parameters, and execute test requests directly from the UI. Remember to log in using the `/api/v1/auth/login` endpoint and authorize Swagger with your Bearer Token to access protected routes.

---

## 🧪 Testing

To run the automated test suite (Jest):
```bash
npm run test
```

To run end-to-end tests:
```bash
npm run test:e2e
```

---

## 📂 Directory Structure

The source code is organized modularly inside the `src/` directory:

- `src/auth/` - Authentication, JWT, and guards.
- `src/users/` - User profiles, skills, and settings.
- `src/jobs/` - Job marketplace and applications.
- `src/employer/` - ATS features for organizations.
- `src/lms/` - Learning Management System (Courses, Enrollment, Progress).
- `src/certifications/` - Digital badge issuance and verification.
- `src/mentorship/` - Mentor profiles and session booking.
- `src/intelligence/` - AI Gap analysis and pathway recommendations.
- `src/notifications/` - WebSocket events and email/SMS alerts.
- `src/analytics/` - Platform and workforce metrics.
