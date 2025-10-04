# Expense Manager Web App

A **web-based expense management system** built with **Next.js**, **Prisma**, and **NextAuth**, allowing companies to manage expense submissions, approvals, and user roles.

---

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Database Schema](#database-schema)
* [Setup & Installation](#setup--installation)
* [Seeding Database](#seeding-database)
* [Running the App](#running-the-app)
* [Usage](#usage)

  * [Employee Dashboard](#employee-dashboard)
  * [Manager Dashboard](#manager-dashboard)
  * [Admin Dashboard](#admin-dashboard)
* [API Routes](#api-routes)
* [Next Steps](#next-steps)

---

## Features

* **Employee**:

  * Submit expenses with amount, currency, description, and date
  * View their own expense history and status
* **Manager**:

  * View team expenses
  * Approve or reject expenses
* **Admin**:

  * Manage users and roles (Admin, Manager, Employee)
* Conditional multi-level approvals (planned)
* Fully integrated with **Prisma DB** and **NextAuth** authentication

---

## Tech Stack

* **Next.js 13+ (App Router)**
* **Prisma** (SQLite for local development)
* **NextAuth.js** (authentication)
* **Tailwind CSS** (styling)
* **Node.js / NPM**

---

## Project Structure

```
expense-manager/
│
├─ prisma/
│  ├─ schema.prisma        # Prisma schema defining models
│  └─ seed.js              # Database seeding script
│
├─ app/
│  ├─ api/
│  │  ├─ expenses/route.js # Employee expense submission & fetching
│  │  ├─ approvals/route.js# Manager/Admin approval handling
│  │  ├─ users/route.js    # Admin user management
│  │  └─ auth/[...nextauth]/route.js # NextAuth API
│  ├─ employee/page.js     # Employee dashboard
│  ├─ manager/page.js      # Manager dashboard
│  └─ admin/page.js        # Admin dashboard
│
├─ .env                    # Environment variables
├─ package.json
└─ README.md
```

---

## Database Schema

### User

```prisma
model User {
  id             Int       @id @default(autoincrement())
  name           String
  email          String    @unique
  password       String
  role           Role      @default(EMPLOYEE)
  expenses       Expense[]
  approvalsGiven Approval[] @relation("Approvals")
}
```

### Expense

```prisma
model Expense {
  id          Int           @id @default(autoincrement())
  amount      Float
  currency    String
  description String
  date        DateTime      @default(now())
  status      ExpenseStatus @default(PENDING)
  user        User          @relation(fields: [userId], references: [id])
  userId      Int
  approvals   Approval[]
  rules       ApprovalRule[]
}
```

### Approval

```prisma
model Approval {
  id         Int            @id @default(autoincrement())
  approver   User           @relation("Approvals", fields: [approverId], references: [id])
  approverId Int
  expense    Expense        @relation(fields: [expenseId], references: [id])
  expenseId  Int
  status     ApprovalStatus @default(PENDING)
}
```

### ApprovalRule

```prisma
model ApprovalRule {
  id           Int       @id @default(autoincrement())
  expense      Expense   @relation(fields: [expenseId], references: [id])
  expenseId    Int
  type         RuleType
  threshold    Float?    // for percentage rules
  approverId   Int?      // for specific approver rule
}
```

### Enums

```prisma
enum Role {
  ADMIN
  MANAGER
  EMPLOYEE
}

enum ExpenseStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

enum RuleType {
  PERCENTAGE
  SPECIFIC_APPROVER
  HYBRID
}
```

---

## Setup & Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd expense-manager
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables** (`.env` file):

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=some-long-random-string
DATABASE_URL="file:./dev.db"
```

4. **Initialize Prisma database**

```bash
npx prisma migrate dev --name init
```

---

## Seeding Database

To create initial users:

```bash
node prisma/seed.js
```

* Creates:

  * Admin: `admin@example.com` / `admin`
  * Manager: `manager@example.com` / `manager`
  * Employee: `employee@example.com` / `employee`

* Verify in Prisma Studio:

```bash
npx prisma studio
```

---

## Running the App

```bash
npm run dev
```

* Visit `http://localhost:3000`
* Login as one of the seeded users

---

## Usage

### Employee Dashboard

* Submit new expenses via form
* View list of past expenses with status (`PENDING`, `APPROVED`, `REJECTED`)

### Manager Dashboard

* View team expenses
* Approve or reject pending expenses

### Admin Dashboard

* View all users
* Change roles (Admin / Manager / Employee) dynamically

---

## API Routes

| Route                     | Method | Description                                                |
| ------------------------- | ------ | ---------------------------------------------------------- |
| `/api/expenses`           | GET    | Fetch expenses (Employee sees own, Manager/Admin sees all) |
| `/api/expenses`           | POST   | Submit new expense (Employee only)                         |
| `/api/approvals`          | GET    | Fetch all expenses for approval (Manager/Admin)            |
| `/api/approvals`          | POST   | Approve or reject expense (Manager/Admin)                  |
| `/api/users`              | GET    | Fetch all users (Admin only)                               |
| `/api/users`              | PUT    | Update user role (Admin only)                              |
| `/api/auth/[...nextauth]` | —      | NextAuth authentication routes                             |

---

## Next Steps

1. Implement **conditional multi-level approvals** (percentage, specific approver, hybrid)
2. Add **role-based UI navigation**
3. Prepare for **deployment on Vercel** with **cloud database** (Postgres / Cloudflare D1)
4. Add **email notifications** for expense approvals
