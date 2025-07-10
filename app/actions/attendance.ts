"use server";
import { db } from "@/db/drizzle";
import { attendance, students } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, desc, sql, InferInsertModel } from "drizzle-orm";
import { ActionState, AttendanceFormState } from "@/types";
import {
  AttendanceFormValues,
  attendanceSchema,
} from "@/lib/validations/attendance";  


export async function submitAttendanceAction(
  prevState: AttendanceFormState,
  formData: FormData
): Promise<AttendanceFormState> {
  const studentId = prevState.studentId;
  try {
    const rawAttendanceFormData = {
      studentId: studentId,
      date: formData.get("date"),
      time: formData.get("time"), // Add time field
      status: formData.get("status"),
      notes: formData.get("notes"),
      studentName: formData.get("studentName") || "Unknown",
    };

    const parsedData = attendanceSchema.safeParse(rawAttendanceFormData);

    if (!parsedData.success) {
      console.log("Validation Errors:", parsedData.error.errors);
      return {
        studentId,
        status: "error",
        data: {
          message: `Error occurred while submitting attendance record: ${parsedData.error.errors[0].message}`,
          issues: [parsedData.error.errors[0].message],
        },
      };
    }

    // Handle time - provide default if not specified
    const timeValue = parsedData.data.time || "00:00";
    
    // Check for existing record on the same date (regardless of time)
    const existingRecord = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.studentId, parsedData.data.studentId),
          eq(attendance.date, parsedData.data.date.toISOString().split("T")[0])
        )
      )
      .limit(1);

    if (existingRecord.length > 0) {
      return {
        studentId,
        status: "error",
        data: {
          message: `An attendance record already exists for this student on this date.`,
          issues: [
            "An attendance record already exists for this student on this date.",
          ],
        },
      };
    }

    const insertData: InferInsertModel<typeof attendance> = {
      studentId: parsedData.data.studentId,
      date: parsedData.data.date.toISOString().split("T")[0],
      time: timeValue, // Store time separately, can be null for existing records
      status: parsedData.data.status,
      notes: parsedData.data.notes,
    };

    await db.insert(attendance).values(insertData);

    revalidatePath("/dashboard/admin/attendance"); 
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard");

    return {
      studentId,
      status: "success",
      data: {
        message: `Attendance record added successfully for ${
          parsedData.data.date.toISOString().split("T")[0]
        }${timeValue ? ` at ${timeValue}` : ''}`,
      },
    };
  } catch (error) {
    console.error("Full Error:", error);
    return {
      studentId,
      status: "error",
      data: {
        message: "An unexpected error occurred. Please try again.",
        issues: ["An unexpected error occurred. Please try again."],
      },
    };
  }
}
 

export async function getAttendanceRecords(): Promise<{
  attendance?: AttendanceFormValues[];
  error?: string;
}> {

  try {
    const rawRecords = await db
      .select({
        id: attendance.id,
        studentId: attendance.studentId,
        studentName: students.name,
        date: attendance.date,
        time: attendance.time,
        status: attendance.status,
        notes: attendance.notes,
      })
      .from(attendance)
      .leftJoin(students, eq(attendance.studentId, students.id))
      .orderBy(desc(attendance.date));

    const formattedRecords = rawRecords.map((record) => {
      const dateValue =
        typeof record.date === "string" ? new Date(record.date) : record.date;

      return attendanceSchema.parse({
        ...record,
        date: dateValue,
      });
    });

    return { attendance: formattedRecords };
  } catch (error) {
    console.error("Failed to fetch attendance records:", error);
    return { error: "Failed to fetch attendance records" };
  }
}

export async function getAttendanceRecordsByStudent(studentId: number) {
  try {
    const records = await db
      .select({
        id: attendance.id,
        date: attendance.date,
        time: attendance.time,
        status: attendance.status,
        notes: attendance.notes,
        studentId: attendance.studentId,
        studentName: students.name,
      })
      .from(attendance)
      .leftJoin(students, eq(attendance.studentId, students.id))
      .where(eq(attendance.studentId, studentId))
      .orderBy(attendance.date);

    if (!records || records.length === 0) {
      return [];
    }

    return records;
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return [];
  }
}

export async function deleteAttendanceRecord(id: number): Promise<ActionState> {
  try {
    const existingRecord = await db.query.attendance.findFirst({
      where: eq(attendance.id, id),
    });

    if (!existingRecord) {
      return {
        status: "error",
        data: {
          message: `Attendance record with ID ${id} not found`,
          issues: [`Attendance record with ID ${id} not found`],
        },
      };
    }

    await db.delete(attendance).where(eq(attendance.id, id));

    revalidatePath("/dashboard/admin/attendance"); 
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard");

    return {
      status: "success",
      data: {
        message: "Attendance deleted successfully",
      },
    };
  } catch (error) {
    return {
      status: "error",
      data: {
        message: `Failed to delete attendance record. Please try again. ${error}`,
        issues: [
          `Failed to delete attendance record. Please try again. ${error}`,
        ],
      },
    };
  }
}

export async function getAttendanceRecordsByStudentId(studentId: number) {
  const records = await db
    .select({
      id: attendance.id,
      studentId: attendance.studentId,
      studentName: students.name,
      time: attendance.time,
      date: attendance.date,
      status: attendance.status,
      notes: attendance.notes,
    })
    .from(attendance)
    .leftJoin(students, eq(attendance.studentId, students.id))
    .where(eq(attendance.studentId, studentId))
    .orderBy(desc(attendance.date));

  return records;
}

// Optional: Get attendance records by date range
export async function getAttendanceRecordsByDateRange(
  startDate: Date,
  endDate: Date
) {
  const records = await db
    .select({
      id: attendance.id,
      studentId: attendance.studentId,
      studentName: students.name,
      date: attendance.date,
      time: attendance.time,
      status: attendance.status,
      notes: attendance.notes,
    })
    .from(attendance)
    .leftJoin(students, eq(attendance.studentId, students.id))
    .where(
      sql`${attendance.date} >= ${startDate} AND ${attendance.date} <= ${endDate}`
    )
    .orderBy(desc(attendance.date));

  return records;
}
