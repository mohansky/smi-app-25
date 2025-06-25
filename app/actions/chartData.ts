"use server";
// app/app/actions/chartData.ts
import { db } from "@/db/drizzle";
import { payments, expenses, students, INSTRUMENTS } from "@/db/schema";
import { CombinedStats } from "@/types";
import { endOfMonth, startOfMonth, subYears } from "date-fns";
import { sql } from "drizzle-orm";

interface MonthlyDataProps {
  month: string;
  payments: number;
  expenses: number;
}

export async function getMonthlyPaymentsAndExpenses(): Promise<
  MonthlyDataProps[]
> {
  try {
    // Get all payments and expenses
    const allPayments = await db.select().from(payments);
    const allExpenses = await db.select().from(expenses);

    // Group payments by month
    const paymentsByMonth = allPayments.reduce((acc, payment) => {
      const date = new Date(payment.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += Number(payment.amount);
      return acc;
    }, {} as Record<string, number>);

    // Group expenses by month
    const expensesByMonth = allExpenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    // Combine into final format
    const allMonths = new Set([
      ...Object.keys(paymentsByMonth),
      ...Object.keys(expensesByMonth)
    ]);

    const mergedData: MonthlyDataProps[] = Array.from(allMonths).map(month => ({
      month,
      payments: paymentsByMonth[month] || 0,
      expenses: expensesByMonth[month] || 0,
    })).sort((a, b) => a.month.localeCompare(b.month));

    return mergedData;
  } catch (error) {
    console.error("Error fetching monthly payments and expenses data:", error);
    return [];
  }
}

export async function getCombinedStats(month: string): Promise<CombinedStats> {
  const selectedDate = new Date(month);
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const yearStart = startOfMonth(subYears(selectedDate, 1));

  try {
    // Get active students
    const activeStudents = await db
      .select({
        id: students.id,
        instrument: students.instrument,
      })
      .from(students)
      .where(sql`is_active = 1`);

    // Get all payments and expenses with PAID status
    const allPayments = await db
      .select()
      .from(payments)
      .where(sql`payment_status = 'PAID'`);

    const allExpenses = await db
      .select()
      .from(expenses)
      .where(sql`expense_status = 'PAID'`);

    // Filter by date ranges in JavaScript
    const monthlyPayments = allPayments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= monthStart && paymentDate <= monthEnd;
    });

    const yearlyPayments = allPayments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= yearStart && paymentDate <= monthEnd;
    });

    const monthlyExpenses = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });

    const yearlyExpenses = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= yearStart && expenseDate <= monthEnd;
    });

    // Calculate totals
    const monthlyPaymentsTotal = monthlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const yearlyPaymentsTotal = yearlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const monthlyExpensesTotal = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const yearlyExpensesTotal = yearlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Calculate instrument breakdowns
    const monthlyInstrumentCounts = Object.values(INSTRUMENTS).map(
      (instrument) => ({
        instrument,
        count: activeStudents.filter(
          (student) => student.instrument === instrument
        ).length,
      })
    );

    const yearlyInstrumentCounts = Object.values(INSTRUMENTS).map(
      (instrument) => ({
        instrument,
        count: activeStudents.filter(
          (student) => student.instrument === instrument
        ).length,
      })
    );

    const hasData =
      activeStudents.length > 0 || monthlyPaymentsTotal > 0 || monthlyExpensesTotal > 0;

    return {
      monthly: {
        activeStudents: activeStudents.length,
        totalPayments: monthlyPaymentsTotal,
        totalExpenses: monthlyExpensesTotal,
        instrumentBreakdown: monthlyInstrumentCounts,
      },
      yearly: {
        activeStudents: activeStudents.length,
        totalPayments: yearlyPaymentsTotal,
        totalExpenses: yearlyExpensesTotal,
        instrumentBreakdown: yearlyInstrumentCounts,
      },
      hasData,
    };

  } catch (error) {
    console.error('Error in getCombinedStats:', error);
    
    // Return empty stats on error
    return {
      monthly: {
        activeStudents: 0,
        totalPayments: 0,
        totalExpenses: 0,
        instrumentBreakdown: Object.values(INSTRUMENTS).map(instrument => ({
          instrument,
          count: 0,
        })),
      },
      yearly: {
        activeStudents: 0,
        totalPayments: 0,
        totalExpenses: 0,
        instrumentBreakdown: Object.values(INSTRUMENTS).map(instrument => ({
          instrument,
          count: 0,
        })),
      },
      hasData: false,
    };
  }
}