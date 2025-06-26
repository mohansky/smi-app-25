"use server";
import { db } from "@/db/drizzle";
import { expenses, InsertExpense } from "@/db/schema";
import { and, count, desc, eq, ilike, gte, lte } from "drizzle-orm";
import { ExpenseFilterParams, expenseSchema } from "@/lib/validations/expenses";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ActionState, ExpenseFormState } from "@/types";

export async function getAllExpenses(params: ExpenseFilterParams) {
  const {
    page = 1,
    limit = 10,
    status = "ALL",
    category = "ALL",
    search,
    startDate,
    endDate,
  } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build where conditions dynamically
  const whereConditions = [];

  // Status filter
  if (status !== "ALL") {
    whereConditions.push(eq(expenses.expenseStatus, status));
  }

  // Category filter
  if (category !== "ALL") {
    whereConditions.push(eq(expenses.category, category));
  }

  // Search filter (if search term provided)
  if (search) {
    whereConditions.push(ilike(expenses.description, `%${search}%`));
  }

  // Date range filters
  if (startDate) {
    whereConditions.push(gte(expenses.date, new Date(startDate)));
  }

  if (endDate) {
    whereConditions.push(lte(expenses.date, new Date(endDate)));
  }

  // Fetch total count for pagination
  const totalCountResult = await db
    .select({ count: count() })
    .from(expenses)
    .where(and(...whereConditions));

  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Fetch paginated expenses
  const results = await db
    .select()
    .from(expenses)
    .where(and(...whereConditions))
    .orderBy(desc(expenses.date))
    .limit(limit)
    .offset(offset);

  return {
    expenses: results,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
    },
  };
}

// export async function createExpense(
//   prevState: ExpenseFormState,
//   formData: FormData
// ): Promise<ExpenseFormState> {
//   try {
//     const rawData = {
//       date: new Date(formData.get("date") as string),
//       amount: Number(formData.get("amount")),
//       description: formData.get("description") as string,
//       paymentMethod: formData.get("paymentMethod") as "CASH" | "CARD",
//       paymentStatus: formData.get("paymentStatus") as "DUE" | "PAID",
//       transactionId: formData.get("transactionId") || undefined,
//       notes: formData.get("notes") || undefined,
//     };

//     const validatedData = expenseSchema.parse(rawData);

//     const expenseData: InsertExpense = {
//       date: validatedData.date,
//       amount: validatedData.amount.toString(),
//       description: validatedData.description,
//       paymentMethod: validatedData.paymentMethod,
//       expenseStatus: validatedData.expenseStatus,
//       transactionId: validatedData.transactionId,
//       notes: validatedData.notes,
//     };

//     await db.insert(expenses).values(expenseData);

//     revalidatePath("/payments");
//     return {
//       status: "success",
//       data: {
//         message: "Payment added successfully!",
//       },
//     };
//   } catch (error) {
//     console.error("Error adding payment:", error);
//     return {
//       status: "error",
//       data: {
//         issues: ["An unexpected error occurred. Please try again."],
//       },
//     };
//   }
// }


export async function createExpense(
  prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  try {
    const rawData = {
      date: new Date(formData.get("date") as string),
      amount: Number(formData.get("amount")),
      description: formData.get("description") as string,
      category: formData.get("category") as "UTILITIES" | "RENT" | "MISC",
      paymentMethod: formData.get("paymentMethod") as "CASH" | "CARD",
      expenseStatus: formData.get("expenseStatus") as "DUE" | "PAID",
      transactionId: formData.get("transactionId") as string | null,
      notes: formData.get("notes") as string | null,
    };

    const validatedData = expenseSchema.parse(rawData);

    const expenseData: InsertExpense = {
      date: validatedData.date,
      amount: validatedData.amount, // Keep as number, don't convert to string
      description: validatedData.description,
      category: validatedData.category,
      paymentMethod: validatedData.paymentMethod,
      expenseStatus: validatedData.expenseStatus,
      transactionId: validatedData.transactionId || null,
      notes: validatedData.notes || null,
    };

    await db.insert(expenses).values(expenseData);
    
    revalidatePath("/expenses");
    revalidatePath("/dashboard/admin/expenses"); // Add proper path revalidation

    return {
      status: "success",
      data: {
        message: "Expense added successfully!",
      },
    };
  } catch (error) {
    console.error("Error adding expense:", error);
    
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        data: {
          message: `Validation error: ${error.errors[0].message}`,
          issues: error.errors.map(err => err.message),
        },
      };
    }
    
    return {
      status: "error",
      data: {
        message: "An unexpected error occurred. Please try again.",
        issues: ["Failed to create expense. Please check your input and try again."],
      },
    };
  }
}

export async function deleteExpenseRecord(id: number): Promise<ActionState> {
  try {
    const existingRecord = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
    });
    
    if (!existingRecord) {
      return {
        status: "error",
        data: {
          message: `Expense record with ID ${id} not found`,
        },
      };
    }
 
    await db.delete(expenses).where(eq(expenses.id, id));
    
    revalidatePath("/expenses");
    revalidatePath("/dashboard/admin/expenses");
    
    return {
      status: "success",
      data: {
        message: "Expense deleted successfully",
      },
    };
  } catch (error) {
    console.error("Error deleting expense:", error);
    
    return {
      status: "error",
      data: {
        message: "An unexpected error occurred while deleting the expense.",
      },
    };
  }
}

// export async function deleteExpenseRecord(id: number): Promise<ActionState> {
//   try { 
//     const existingRecord = await db.query.expenses.findFirst({
//       where: eq(expenses.id, id),
//     });

//     if (!existingRecord) {
//       return {
//         status: "error",
//         data: {
//           message: `Expense record with ID ${id} not found`,
//           issues: [`Expense record with ID ${id} not found`],
//         },
//       };
//     }
 
//     await db.delete(expenses).where(eq(expenses.id, id));

//     revalidatePath("/expenses");
//     return {
//       status: "success",
//       data: {
//         message: "Expense deleted successfully",
//       },
//     };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return {
//         status: "error",
//         data: {
//           message: `Something went wrong: ${error.errors[0].message}`,
//           issues: [error.errors[0].message],
//         },
//       };
//     } else {
//       return {
//         status: "error",
//         data: {
//           message: "An unexpected error occurred. Please try again.",
//           issues: ["An unexpected error occurred. Please try again."],
//         },
//       };
//     }
//   }
// }
