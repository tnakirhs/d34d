-- CreateTable
CREATE TABLE "ApprovalRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "expenseId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "threshold" REAL,
    "approverId" INTEGER,
    CONSTRAINT "ApprovalRule_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
