import * as z from "zod";

export const attendanceSchema = z
  .object({
    id: z.number().int().positive().optional(),
    studentId: z
      .number()
      .int()
      .positive({ message: "Student ID must be a positive integer" }),
    studentName: z.string().nullable().optional(),
    date: z.union([z.date(), z.string().transform((val) => new Date(val))]),
    status: z.enum(["present", "absent"]).default("present"),
    notes: z.string().max(255).nullable().optional(),
  })
  .strict();

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;
