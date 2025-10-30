"use server";
// app/app/actions/chartData.ts
import { db } from "@/db/drizzle";
import { attendance, payments, expenses, students, INSTRUMENTS } from "@/db/schema";
import { CombinedStats } from "@/types";
import { format, subDays, isSunday, endOfMonth, startOfMonth, subYears } from "date-fns";
// import { sql } from "drizzle-orm";


// import { format, subDays, isSunday, startOfMonth, endOfMonth } from 'date-fns';
// import { db } from '@/lib/db'; // Adjust import path to your database connection
// import { attendance, students } from '@/lib/db/schema'; // Adjust import path to your schema
import { eq, and, gte, lte, sql, count } from 'drizzle-orm';

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






export async function getDailyAttendance(month?: string) {
  try {
    // If month is provided, get data for that month, otherwise last 14 days
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const monthDate = new Date(month);
      startDate = startOfMonth(monthDate);
      endDate = endOfMonth(monthDate);
    } else {
      endDate = new Date();
      startDate = subDays(endDate, 13); // Last 14 days
    }

    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    // Query attendance records grouped by date
    // Only count "present" status records
    const attendanceRecords = await db
      .select({
        date: attendance.date,
        attendance: count(attendance.id)
      })
      .from(attendance)
      .where(
        and(
          gte(attendance.date, startDateStr),
          lte(attendance.date, endDateStr),
          eq(attendance.status, 'present') // Only count present students
        )
      )
      .groupBy(attendance.date)
      .orderBy(attendance.date);

    // Create a map of dates to attendance counts
    const attendanceMap = new Map(
      attendanceRecords.map(record => [record.date, record.attendance])
    );

    // Generate complete data for the date range, excluding Sundays
    const attendanceData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Skip Sundays
      if (!isSunday(currentDate)) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        attendanceData.push({
          date: dateStr,
          attendance: attendanceMap.get(dateStr) || 0,
          day: format(currentDate, 'EEE'),
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return attendanceData;
  } catch (error) {
    console.error('Failed to fetch attendance data:', error);
    return [];
  }
}

// Get weekly attendance summary
export async function getWeeklyAttendanceSummary(month?: string) {
  try {
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const monthDate = new Date(month);
      startDate = startOfMonth(monthDate);
      endDate = endOfMonth(monthDate);
    } else {
      endDate = new Date();
      startDate = subDays(endDate, 27); // Last 4 weeks
    }

    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    // Get weekly attendance data
    const weeklyRecords = await db
      .select({
        date: attendance.date,
        attendance: count(attendance.id)
      })
      .from(attendance)
      .where(
        and(
          gte(attendance.date, startDateStr),
          lte(attendance.date, endDateStr),
          eq(attendance.status, 'present')
        )
      )
      .groupBy(attendance.date)
      .orderBy(attendance.date);

    // Group by weeks and calculate totals
    const weeklyData = [];
    let currentWeek = 1;
    let weekTotal = 0;
    let dayCount = 0;

    for (const record of weeklyRecords) {
      const recordDate = new Date(record.date);
      if (!isSunday(recordDate)) {
        weekTotal += record.attendance;
        dayCount++;

        // If we've collected 6 days (Mon-Sat), finalize the week
        if (dayCount === 6) {
          weeklyData.push({
            week: `Week ${currentWeek}`,
            totalAttendance: weekTotal,
            averageDaily: Math.round((weekTotal / dayCount) * 10) / 10
          });
          currentWeek++;
          weekTotal = 0;
          dayCount = 0;
        }
      }
    }

    // Add any remaining partial week
    if (dayCount > 0) {
      weeklyData.push({
        week: `Week ${currentWeek}`,
        totalAttendance: weekTotal,
        averageDaily: Math.round((weekTotal / dayCount) * 10) / 10
      });
    }

    return weeklyData;
  } catch (error) {
    console.error('Failed to fetch weekly attendance:', error);
    return [];
  }
}

// Get attendance statistics
export async function getAttendanceStats(month?: string) {
  try {
    const attendanceData = await getDailyAttendance(month);
    
    if (attendanceData.length === 0) {
      return {
        totalDays: 0,
        averageAttendance: 0,
        highestAttendance: 0,
        lowestAttendance: 0,
        totalStudentsPresent: 0,
      };
    }

    const attendanceNumbers = attendanceData.map(d => d.attendance);
    const total = attendanceNumbers.reduce((sum, num) => sum + num, 0);

    return {
      totalDays: attendanceData.length,
      averageAttendance: Math.round(total / attendanceData.length),
      highestAttendance: Math.max(...attendanceNumbers),
      lowestAttendance: Math.min(...attendanceNumbers),
      totalStudentsPresent: total,
    };
  } catch (error) {
    console.error('Failed to calculate attendance stats:', error);
    return {
      totalDays: 0,
      averageAttendance: 0,
      highestAttendance: 0,
      lowestAttendance: 0,
      totalStudentsPresent: 0,
    };
  }
}

// Get total active students for attendance percentage calculation
export async function getActiveStudentsCount() {
  try {
    const result = await db
      .select({ count: count(students.id) })
      .from(students)
      // .where(eq(students.status, 'active')); // Assuming you have a status field

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Failed to get active students count:', error);
    return 0;
  }
}

// Get attendance percentage for a specific date
export async function getAttendancePercentage(date: string) {
  try {
    const [presentCount, totalActive] = await Promise.all([
      db
        .select({ count: count(attendance.id) })
        .from(attendance)
        .where(
          and(
            eq(attendance.date, date),
            eq(attendance.status, 'present')
          )
        ),
      getActiveStudentsCount()
    ]);

    const present = presentCount[0]?.count || 0;

    if (totalActive === 0) return 0;

    return Math.round((present / totalActive) * 100);
  } catch (error) {
    console.error('Failed to calculate attendance percentage:', error);
    return 0;
  }
}

// Get student attendance by student ID with optional month filter
export async function getStudentAttendance(studentId: number, month?: string) {
  try {
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const monthDate = new Date(month);
      startDate = startOfMonth(monthDate);
      endDate = endOfMonth(monthDate);
    } else {
      // Get all time data if no month specified
      startDate = new Date('2020-01-01');
      endDate = new Date();
    }

    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    // Get student details
    const student = await db
      .select({
        id: students.id,
        name: students.name,
        email: students.email,
        instrument: students.instrument,
        grade: students.grade,
        batch: students.batch,
      })
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (student.length === 0) {
      return null;
    }

    // Get attendance records
    const attendanceRecords = await db
      .select({
        id: attendance.id,
        date: attendance.date,
        time: attendance.time,
        status: attendance.status,
        notes: attendance.notes,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.studentId, studentId),
          gte(attendance.date, startDateStr),
          lte(attendance.date, endDateStr)
        )
      )
      .orderBy(attendance.date);

    // Calculate statistics
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const attendancePercentage = totalRecords > 0
      ? Math.round((presentCount / totalRecords) * 100)
      : 0;

    return {
      student: student[0],
      attendance: attendanceRecords,
      stats: {
        total: totalRecords,
        present: presentCount,
        absent: absentCount,
        percentage: attendancePercentage,
      },
    };
  } catch (error) {
    console.error('Failed to fetch student attendance:', error);
    return null;
  }
}

// Search students by name or email
export async function searchStudents(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchQuery = `%${query.toLowerCase()}%`;

    const results = await db
      .select({
        id: students.id,
        name: students.name,
        email: students.email,
        instrument: students.instrument,
        grade: students.grade,
        batch: students.batch,
      })
      .from(students)
      .where(
        sql`LOWER(${students.name}) LIKE ${searchQuery} OR LOWER(${students.email}) LIKE ${searchQuery}`
      )
      .limit(10);

    return results;
  } catch (error) {
    console.error('Failed to search students:', error);
    return [];
  }
}

// Get all active students
export async function getAllActiveStudents() {
  try {
    const activeStudents = await db
      .select({
        id: students.id,
        name: students.name,
        email: students.email,
        instrument: students.instrument,
        grade: students.grade,
        batch: students.batch,
      })
      .from(students)
      .where(eq(students.isActive, true))
      .orderBy(students.name);

    return activeStudents;
  } catch (error) {
    console.error('Failed to fetch active students:', error);
    return [];
  }
}

// Get student stats with instrument breakdown
export async function getStudentStats() {
  try {
    const activeStudents = await db
      .select({
        id: students.id,
        instrument: students.instrument,
      })
      .from(students)
      .where(eq(students.isActive, true));

    const instrumentBreakdown = Object.values(INSTRUMENTS).map((instrument) => ({
      instrument,
      count: activeStudents.filter((s) => s.instrument === instrument).length,
    }));

    return {
      totalActive: activeStudents.length,
      instrumentBreakdown,
    };
  } catch (error) {
    console.error('Failed to fetch student stats:', error);
    return {
      totalActive: 0,
      instrumentBreakdown: Object.values(INSTRUMENTS).map((instrument) => ({
        instrument,
        count: 0,
      })),
    };
  }
}