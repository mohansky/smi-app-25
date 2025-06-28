// app/lib/validations/student.ts
import * as z from "zod";

// Add these if they're not already defined in your validations file
const dateOrNull = z
  .union([
    z.date(),
    z.string().transform((val) => {
      if (!val) return null;
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    }),
    z.null(),
  ])
  .nullable()
  .optional();

const dateWithFallback = z
  .union([
    z.date(),
    z.string().transform((val) => {
      if (!val) return new Date();
      const date = new Date(val);
      return isNaN(date.getTime()) ? new Date() : date;
    }),
  ])
  .default(new Date());

export const studentSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().regex(/^\d{10,}$/, {
    message: "Phone number must contain at least 10 digits.",
  }),
  instrument: z.enum(["guitar", "drums", "keyboard"]).default("guitar"),
  grade: z.enum(["grade1", "grade2", "grade3"]).default("grade1"),
  batch: z.enum(["mt", "tf", "ws", "cc"]).default("mt"),
  timing: z.enum(
    [
      "10am-11am",
      "11am-12pm",
      "12pm-1pm",
      "3pm-4pm",
      "4pm-5pm",
      "5pm-6pm",
      "6pm-7pm",
      "7pm-8pm",
      "8pm-9pm",
    ],
    {
      message: "Please select a valid timing slot.",
    }
  ),
  dateOfBirth: dateOrNull,
  joiningDate: dateWithFallback,
  updatedAt: z
    .union([
      z.date().refine((date) => !isNaN(date.getTime()), "Invalid date"),
      z.string().transform((val) => {
        const date = new Date(val);
        return isNaN(date.getTime()) ? undefined : date;
      }),
      z.undefined(),
    ])
    .optional(),
  createdAt: z
    .union([
      z.date().refine((date) => !isNaN(date.getTime()), "Invalid date"),
      z.string().transform((val) => {
        const date = new Date(val);
        return isNaN(date.getTime()) ? undefined : date;
      }),
      z.undefined(),
    ])
    .optional(),
  isActive: z.boolean().default(true),
});

// Separate schema just for form validation
export const studentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z
    .string()
    .regex(/^\d{10,}$/, "Phone number must contain at least 10 digits."),
  instrument: z.enum(["guitar", "drums", "keyboard"]).default("guitar"),
  grade: z.enum(["grade1", "grade2", "grade3"]).default("grade1"),
  batch: z.enum(["mt", "tf", "ws"]).default("mt"),
  dateOfBirth: z.date(),
  joiningDate: z.date(),
  isActive: z.boolean().default(true),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
