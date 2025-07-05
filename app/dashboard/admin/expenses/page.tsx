import { expenseColumns } from "@/components/columns/expenses-columns";
import { getAllExpenses } from "@/app/actions/expense";
import { CustomDataTable } from "@/components/custom-ui/custom-data-table";
import StudentDetailsLoading from "@/components/skeletons/student-details-skeleton";
import { Suspense } from "react";
import AddExpenseButton from "@/components/buttons/add-expenses-button";
import { ExpenseFormValues } from "@/lib/validations/expenses";

export default async function ExpensesPage() {
  const result = await getAllExpenses({
    page: 1,
    limit: 10,
    status: "ALL",
    category: "ALL",
  });

  if (result.expenses) {
    // Transform raw database data to match ExpenseFormValues type
    const transformedExpenses: ExpenseFormValues[] = result.expenses.map((expense) => ({
      id: expense.id,
      date: new Date(expense.date),
      amount: Number(expense.amount),
      description: expense.description,
      category: expense.category as "UTILITIES" | "RENT" | "MISC",
      expenseStatus: expense.expenseStatus as "DUE" | "PAID",
      paymentMethod: expense.paymentMethod as "CASH" | "CARD",
      transactionId: expense.transactionId,
      notes: expense.notes,
      createdAt: new Date(expense.created_at),
      updatedAt: new Date(expense.updated_at),
    }));

    return (
      <Suspense fallback={<StudentDetailsLoading />}>
        <div className="w-[98vw] md:w-[75vw] mb-10">
          <AddExpenseButton className="flex justify-end" />
          <CustomDataTable
            tableTitle="All Expenses"
            pgSize={10}
            columns={expenseColumns}
            data={transformedExpenses}
            showDatePicker={true}
            filters={[
              { column: "description", placeholder: "Find by Description" },
              { column: "category", placeholder: "Filter by Category" },
            ]}
          />
        </div>
      </Suspense>
    );
  } else {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Expenses
          </h2>
          <p className="text-gray-600">
            Unable to fetch expenses at this time
          </p>
        </div>
      </div>
    );
  }
}