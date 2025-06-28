// db/schema.ts
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
// import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

export const INSTRUMENTS = {
  GUITAR: "guitar",
  DRUMS: "drums",
  KEYBOARD: "keyboard",
} as const;

export const GRADES = {
  GRADE1: "grade1",
  GRADE2: "grade2",
  GRADE3: "grade3",
} as const;

export type Grade = (typeof GRADES)[keyof typeof GRADES];

export const BATCHES = {
  MT: "mt",
  TF: "tf",
  WS: "ws",
  CC: "cc",
} as const;

export type Batch = (typeof BATCHES)[keyof typeof BATCHES];

// Define timing options
export const TIMINGS = {
  "10AM_11AM": "10am-11am",
  "11AM_12PM": "11am-12pm",
  "12PM_1PM": "12pm-1pm",
  "3PM_4PM": "3pm-4pm",
  "4PM_5PM": "4pm-5pm",
  "5PM_6PM": "5pm-6pm",
  "6PM_7PM": "6pm-7pm",
  "7PM_8PM": "7pm-8pm",
  "8PM_9PM": "8pm-9pm",
} as const;

export type Timing = (typeof TIMINGS)[keyof typeof TIMINGS];

export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
} as const;

export type Instrument = (typeof INSTRUMENTS)[keyof typeof INSTRUMENTS];

// User records
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID as text
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  role: text("role", { enum: ["USER", "ADMIN"] }).default("USER"),
  isVerified: integer("is_verified", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// Student records
export const students = sqliteTable("students", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  phone: text("phone").notNull(),
  instrument: text("instrument")
    .$type<Instrument>()
    .default(INSTRUMENTS.GUITAR),
  grade: text("grade").$type<Grade>().notNull(),
  batch: text("batch").$type<Batch>().notNull(),
  timing: text("timing").$type<Timing>().notNull(),
  dateOfBirth: text("date_of_birth"),
  joiningDate: text("joining_date").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Attendance records
export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id")
    .references(() => students.id, { onDelete: "cascade" })
    .notNull(),
  date: text("date").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
});

// Payment records
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id")
    .references(() => students.id, { onDelete: "cascade" })
    .notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull(),
  transactionId: text("transaction_id"),
  notes: text("notes"),
  created_at: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updated_at: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type InsertPayment = typeof payments.$inferInsert;

// Expense records
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: integer("date", { mode: "timestamp" }).notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  category: text("category").default("MISC").notNull(),
  expenseStatus: text("expense_status").default("PAID").notNull(),
  paymentMethod: text("payment_method").default("CASH").notNull(),
  transactionId: text("transaction_id"),
  notes: text("notes"),
  created_at: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updated_at: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type InsertExpense = typeof expenses.$inferInsert;

// Relations (these stay the same)
export const studentsRelations = relations(students, ({ many, one }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  attendance: many(attendance),
  payments: many(payments),
}));

export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
}));

export const verificationTokens = sqliteTable("verification_tokens", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Export types
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
