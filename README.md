# Employee Management System

A basic MERN employee management application. The React dashboard supports
creating, viewing, searching, filtering, editing, and deleting employees. The
Overview shows team statistics, recent additions, and department sizes. The
Departments view summarizes team membership and average salary, with shortcuts
to each department's employees. The employee directory can be filtered by
department or status. The Express API persists employee records in MongoDB.

The login screen is a demo-only frontend gate: any valid email and non-empty
password opens the dashboard. Credentials are not authenticated, and the API
remains public. Do not use this mode for real or sensitive employee data.

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB connection URI

## Run locally

1. Install dependencies from the project root and each app:

   ```bash
   npm install
   npm install --prefix server
   npm install --prefix client
   ```

2. Create `server/.env` from `server/.env.example` and set `MONGODB_URI` if
   needed.

3. Start the frontend and backend from the project root:

   ```bash
   npm run dev
   ```

   Vite runs at `http://127.0.0.1:5174` and the API runs at
   `http://localhost:5001`.

The client uses `/api` as its API base in development; Vite proxies these
requests to the backend. To create a production frontend build, run
`npm run build` from the root.

## API

- `GET /api/employees` — list employees
- `GET /api/employees/:id` — get one employee
- `POST /api/employees` — create an employee
- `PUT /api/employees/:id` — update an employee
- `DELETE /api/employees/:id` — delete an employee
- `GET /api/health` — API and database health

Employee fields: `name`, `email`, `phone`, `department`, `designation`,
`salary`, `dateOfJoining`, and `status` (`Active` or `Inactive`).
