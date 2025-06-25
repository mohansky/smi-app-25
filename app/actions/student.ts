"use server";
import { db } from "@/db/drizzle";
import { StudentFormValues, studentSchema } from "@/lib/validations/student";
import { revalidatePath } from "next/cache";
import { eq, InferInsertModel } from "drizzle-orm";
import { students } from "@/db/schema";
import {
  ActionState,
  AddStudentFormState,
  UpdateStudentFormState,
} from "@/types";

export async function addStudent(
  prevState: AddStudentFormState,
  formData: FormData
): Promise<AddStudentFormState> {
  try {
    const rawFormData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      instrument: formData.get("instrument") as string,
      grade: formData.get("grade") as string,
      batch: formData.get("batch") as string,
      dateOfBirth: formData.get("dateOfBirth") as string | null,
      joiningDate: formData.get("joiningDate") as string | null,
      isActive: formData.get("isActive") === "true",
    };

    const validationResult = studentSchema.safeParse(rawFormData);
    if (!validationResult.success) {
      return {
        status: "error",
        data: {
          message: Object.entries(
            validationResult.error.flatten().fieldErrors
          ).flatMap(([field, errors]) =>
            errors.map((error) => `${field}: ${error}`)
          ),
          issues: Object.entries(
            validationResult.error.flatten().fieldErrors
          ).flatMap(([field, errors]) =>
            errors.map((error) => `${field}: ${error}`)
          ),
        },
      };
    }

    const data = validationResult.data;

    const existingStudent = await db.query.students.findFirst({
      where: (students, { eq, and }) =>
        and(eq(students.email, data.email), eq(students.phone, data.phone)),
    });

    if (existingStudent) {
      return {
        status: "existingStudent",
        data: {
          message: ["A student with this email already exists."],
          issues: ["A student with this email already exists."],
        },
      };
    }

    const studentId = parseInt(data.phone.slice(-5), 10);

    const insertData: InferInsertModel<typeof students> = {
      id: studentId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      instrument: data.instrument,
      grade: data.grade,
      batch: data.batch,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().split("T")[0]
        : null,
      joiningDate: new Date(data.joiningDate).toISOString().split("T")[0],
      isActive: data.isActive ?? true,
    };

    await db.insert(students).values(insertData);

    // FIX 1: Revalidate AFTER successful operation
    revalidatePath("/dashboard/admin/students");
    revalidatePath("/students");
    revalidatePath("/dashboard");

    return {
      status: "success",
      data: {
        message: "Student added successfully!",
      },
    };
  } catch (error) {
    // SQLite constraint error handling
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return {
        status: "existingStudent",
        data: {
          message: "A student with this email already exists.",
          issues: ["A student with this email already exists."],
        },
      };
    }
    
    console.error("Error adding student:", error);
    return {
      status: "error",
      data: {
        message: "An unexpected error occurred. Please try again.",
        issues: ["An unexpected error occurred. Please try again."],
      },
    };
  }
}

export async function updateStudent(
  prevState: UpdateStudentFormState,
  formData: FormData
): Promise<UpdateStudentFormState> {
  const studentId = prevState.studentId;
  const initialValues = prevState.initialValues;

  try {
    const rawFormData = {
      id: studentId,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      instrument: formData.get("instrument"),
      grade: formData.get("grade"),
      batch: formData.get("batch"),
      dateOfBirth: formData.get("dateOfBirth")
        ? new Date(formData.get("dateOfBirth") as string)
        : null,
      joiningDate: formData.get("joiningDate")
        ? new Date(formData.get("joiningDate") as string)
        : null,
      isActive: formData.get("isActive") === "true",
    };

    const result = studentSchema.safeParse(rawFormData);

    if (!result.success) {
      return {
        studentId,
        initialValues,
        status: "error",
        data: {
          message: "Validation Error please check entries.",
          issues: Object.entries(result.error.flatten().fieldErrors).flatMap(
            ([field, errors]) => errors.map((error) => `${field}: ${error}`)
          ),
        },
      };
    }

    const updatedFields = {
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      instrument: result.data.instrument,
      grade: result.data.grade,
      batch: result.data.batch,
      dateOfBirth: result.data.dateOfBirth
        ? result.data.dateOfBirth.toISOString().split("T")[0]
        : null,
      joiningDate: result.data.joiningDate
        ? result.data.joiningDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      isActive: result.data.isActive,
      updatedAt: new Date(),
    };

    const updateResult = await db
      .update(students)
      .set(updatedFields)
      .where(eq(students.id, studentId));

    if (updateResult.rowsAffected === 0) {
      throw new Error("No student found to update");
    }

    // FIX 2: Revalidate AFTER successful operation with correct paths
    revalidatePath("/dashboard/admin/students");
    revalidatePath("/students");
    revalidatePath("/dashboard");

    return {
      studentId,
      initialValues,
      status: "success",
      data: {
        message: "Student updated successfully!",
      },
    };
  } catch (error) {
    console.error("Error updating student:", error);
    return {
      studentId,
      initialValues,
      status: "error",
      data: {
        message: "An unexpected error occurred. Please try again.",
        issues: [
          "An unexpected error occurred. Please try again.",
          error instanceof Error ? error.message : String(error),
        ],
      },
    };
  }
}

export async function deleteStudent(studentId: number): Promise<ActionState> {
  try {
    // Check if student exists
    const existingStudent = await db.query.students.findFirst({
      where: (students, { eq }) => eq(students.id, studentId),
    });

    if (!existingStudent) {
      return {
        status: "error",
        data: {
          message: `Student with ID ${studentId} not found`,
          issues: [`Student with ID ${studentId} not found`],
        },
      };
    }

    await db.delete(students).where(eq(students.id, studentId));

    // FIX 3: Revalidate AFTER successful operation with correct paths
    revalidatePath("/dashboard/admin/students");
    revalidatePath("/students");
    revalidatePath("/dashboard");

    return {
      status: "success",
      data: {
        message: "Student deleted successfully",
      },
    };
  } catch (error) {
    console.error("Error deleting student:", error);
    return {
      status: "error",
      data: {
        message: `Failed to delete student. Please try again.`,
        issues: [`Failed to delete student. Please try again.`],
      },
    };
  }
}

export async function getStudents(): Promise<{
  students?: StudentFormValues[];
  error?: string;
}> {
  try {
    const rawData = await db.select().from(students).orderBy(students.id);

    // Safely transform the data to match StudentFormValues
    const formattedStudents: StudentFormValues[] = rawData.map((student) => ({
      ...student,
      dateOfBirth: student.dateOfBirth 
        ? (() => {
            try {
              const date = new Date(student.dateOfBirth);
              return isNaN(date.getTime()) ? null : date;
            } catch {
              return null;
            }
          })()
        : null,
      joiningDate: (() => {
        try {
          const date = new Date(student.joiningDate);
          return isNaN(date.getTime()) ? new Date() : date;
        } catch {
          return new Date();
        }
      })(),
      instrument: student.instrument ?? "guitar",
      grade: student.grade ?? "grade1",
      batch: student.batch,
      isActive: student.isActive,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    }));

    return { students: formattedStudents };
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return { error: "Failed to fetch students" };
  }
}

export async function getStudentById(studentId: number): Promise<{
  student?: StudentFormValues;
  error?: string;
}> {
  try {
    const rawData = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!rawData.length) {
      return { error: `Student with ID ${studentId} not found` };
    }

    // Safely transform the single student with better error handling
    const formattedStudent: StudentFormValues = {
      ...rawData[0],
      dateOfBirth: rawData[0].dateOfBirth 
        ? (() => {
            try {
              const date = new Date(rawData[0].dateOfBirth);
              return isNaN(date.getTime()) ? null : date;
            } catch {
              console.warn('Invalid dateOfBirth:', rawData[0].dateOfBirth);
              return null;
            }
          })()
        : null,
      joiningDate: (() => {
        try {
          const date = new Date(rawData[0].joiningDate);
          if (isNaN(date.getTime())) {
            console.warn('Invalid joiningDate:', rawData[0].joiningDate);
            return new Date();
          }
          return date;
        } catch {
          console.warn('Failed to parse joiningDate:', rawData[0].joiningDate);
          return new Date();
        }
      })(),
      instrument: rawData[0].instrument ?? "guitar",
      grade: rawData[0].grade,
      batch: rawData[0].batch,
      isActive: rawData[0].isActive,
      createdAt: rawData[0].createdAt,
      updatedAt: rawData[0].updatedAt,
    };

    return { student: formattedStudent };
  } catch (error) {
    console.error("Failed to fetch student:", error);
    return {
      error: `Failed to fetch student: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}