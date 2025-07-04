import { z } from "zod";
import { formSchema } from "@/lib/formValidation";
import { demoFormSchema } from "@/lib/demoFormValidation";
import { paymentSchema } from "@/lib/validations/payments";
import { expenseSchema } from "@/lib/validations/expenses";
import { studentSchema, StudentFormValues } from "@/lib/validations/student";
import { INSTRUMENTS } from "@/db/schema";
import { Drum, Guitar, Piano } from "lucide-react";

type FormStatus = "idle" | "submitting" | "success" | "error" | "existingStudent";

export interface FormActionState {
  status: FormStatus;
  data?: {
    message: string | string[];
    issues?: string[] | undefined;
  };
}

export interface ActionState extends FormActionState {
  data?: FormActionState["data"] & {
    user?: z.infer<typeof formSchema>;
  };
}

export interface DemoFormState extends FormActionState {
  fetchTitle: string;
  data?: FormActionState["data"] & {
    user?: z.infer<typeof demoFormSchema>;
  };
}

export interface AttendanceFormState extends FormActionState {
  studentId: number;
  time?: string | null;
}

export interface AddStudentFormState extends FormActionState {
  data?: FormActionState["data"] & {
    user?: z.infer<typeof studentSchema>;
  };
}

export interface UpdateStudentFormState extends AddStudentFormState {
  studentId: number;
  initialValues: StudentFormValues;
}

export interface PaymentFormState extends FormActionState {
  studentId: number;
  data?: FormActionState["data"] & {
    user?: z.infer<typeof paymentSchema>;
  };
}

export interface ExpenseFormState extends FormActionState {
  data?: FormActionState["data"] & {
    user?: z.infer<typeof expenseSchema>;
  };
}

export interface DeleteButtonProps<T> {
  deleteAction: (id: T) => Promise<ActionState>;
  id: T;
  identifier: string | number;
  entityType: string;
  additionalDescription?: string;
}

export interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export interface StudentPageProps {
  params: Promise<{
    studentId: number;
  }>;
}

export interface StudentResponse {
  student: StudentFormValues;
}

export interface Stats {
  activeStudents: number;
  totalPayments: number;
  totalExpenses: number;
  instrumentBreakdown: InstrumentCount[];
}

export interface CombinedStats {
  monthly: Stats;
  yearly: Stats;
  hasData: boolean;
}

export interface InstrumentBreakdownChartProps {
  monthly: InstrumentCount[];
}

export type InstrumentType = (typeof INSTRUMENTS)[keyof typeof INSTRUMENTS];

export const INSTRUMENT_ICONS: Record<InstrumentType, React.ElementType> = {
  guitar: Guitar,
  drums: Drum,
  keyboard: Piano,
};

export interface InstrumentCount {
  instrument: string;
  count: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
}
