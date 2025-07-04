"use client";
// app/components/forms/mark-attendance-form.tsx
import { useActionState, useState, useMemo } from "react";
import { debounce } from "lodash";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AttendanceFormValues,
  attendanceSchema,
} from "@/lib/validations/attendance";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AttendanceFormState } from "@/types";
import { DialogClose, DialogFooter } from "../ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

// Helper function to format date for input
const formatDateForInput = (date: Date): string => {
  try {
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// Helper function to get current time in HH:MM format
const getCurrentTime = (): string => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

// Define proper types for the enum values
type StatusType = "present" | "absent";

export const AttendanceForm = ({
  studentId,
  submitAttendanceAction,
}: {
  studentId: number;
  submitAttendanceAction: (
    prevState: AttendanceFormState,
    data: FormData
  ) => Promise<AttendanceFormState>;
}) => {
  const [state, formAction, isPending] = useActionState(
    submitAttendanceAction,
    {
      status: "idle",
      data: {
        message: "",
        issues: [],
      },
      studentId,
    }
  );

  const today = new Date();

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      studentId,
      notes: "",
      status: "present",
      date: today,
      time: getCurrentTime(), // Add default current time
    },
    mode: "onBlur", // Changed from "onChange" to reduce validation frequency
  });

  // Track date, status, and time values in state to ensure they're included in FormData
  const [date, setDate] = useState(formatDateForInput(today));
  const [status, setStatus] = useState<StatusType>("present");
  const [time, setTime] = useState(getCurrentTime());

  // Debounce form validation to improve performance
  const debouncedTrigger = useMemo(
    () => debounce(() => form.trigger(), 300),
    [form]
  );

  if (state.status === "success") {
    return (
      <Alert variant="default">
        <AlertTitle className="text-active text-xl">
          Attendance added Successfully!
        </AlertTitle>
        <AlertDescription className="text-muted-foreground text-xs">
          Attendance has been recorded in the system.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Mark Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(state?.data?.message ||
          (state?.data?.issues && state.data.issues.length > 0)) && (
          <div
            className={`font-bold mb-10 ${
              state.data.issues ? "text-destructive" : "text-active"
            }`}
          >
            {state.data.issues && state.data.issues.length > 0 ? (
              state.data.issues.map((issue, index) => (
                <p key={index}>{issue}</p>
              ))
            ) : (
              <p>{state.data.message}</p>
            )}
          </div>
        )}

        <Form {...form}>
          <form action={formAction} className="space-y-6">
            {/* Hidden inputs to ensure FormData includes all values */}
            <input type="hidden" name="studentId" value={studentId} />
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="status" value={status} />
            <input type="hidden" name="time" value={time} />

            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter Student ID"
                      {...field}
                      value={field.value}
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          if (e.target.value) {
                            field.onChange(new Date(e.target.value));
                          }
                          debouncedTrigger();
                        }}
                        onBlur={field.onBlur}
                        name="date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          setTime(e.target.value);
                          field.onChange(e.target.value);
                          debouncedTrigger();
                        }}
                        onBlur={field.onBlur}
                        name="time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(value: StatusType) => {
                      field.onChange(value);
                      setStatus(value);
                      debouncedTrigger();
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        field.onChange(e);
                        debouncedTrigger();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding Attendance..." : "Mark Attendance"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};



// "use client";
// // app/components/forms/mark-attendance-form.tsx
// import { useActionState, useState, useMemo } from "react";
// import { debounce } from "lodash";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Textarea } from "../ui/textarea";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "../ui/form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import {
//   AttendanceFormValues,
//   attendanceSchema,
// } from "@/lib/validations/attendance";
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { AttendanceFormState } from "@/types";
// import { DialogClose, DialogFooter } from "../ui/dialog";
// import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

// // Helper function to format date for input
// const formatDateForInput = (date: Date): string => {
//   try {
//     return date.toISOString().split("T")[0];
//   } catch {
//     return "";
//   }
// };

// // Define proper types for the enum values
// type StatusType = "present" | "absent";

// export const AttendanceForm = ({
//   studentId,
//   submitAttendanceAction,
// }: {
//   studentId: number;
//   submitAttendanceAction: (
//     prevState: AttendanceFormState,
//     data: FormData
//   ) => Promise<AttendanceFormState>;
// }) => {
//   const [state, formAction, isPending] = useActionState(
//     submitAttendanceAction,
//     {
//       status: "idle",
//       data: {
//         message: "",
//         issues: [],
//       },
//       studentId,
//     }
//   );

//   const today = new Date();

//   const form = useForm<AttendanceFormValues>({
//     resolver: zodResolver(attendanceSchema),
//     defaultValues: {
//       studentId,
//       notes: "",
//       status: "present",
//       date: today,
//     },
//     mode: "onBlur", // Changed from "onChange" to reduce validation frequency
//   });

//   // Track date and status values in state to ensure they're included in FormData
//   const [date, setDate] = useState(formatDateForInput(today));
//   const [status, setStatus] = useState<StatusType>("present");

//   // Debounce form validation to improve performance
//   const debouncedTrigger = useMemo(
//     () => debounce(() => form.trigger(), 300),
//     [form]
//   );

//   if (state.status === "success") {
//     return (
//       <Alert variant="default">
//         <AlertTitle className="text-active text-xl">
//           Attendance added Successfully!
//         </AlertTitle>
//         <AlertDescription className="text-muted-foreground text-xs">
//           Attendance has been recorded in the system.
//         </AlertDescription>
//       </Alert>
//     );
//   }

//   return (
//     <Card className="w-full mx-auto">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold text-center">
//           Mark Attendance
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         {(state?.data?.message ||
//           (state?.data?.issues && state.data.issues.length > 0)) && (
//           <div
//             className={`font-bold mb-10 ${
//               state.data.issues ? "text-destructive" : "text-active"
//             }`}
//           >
//             {state.data.issues && state.data.issues.length > 0 ? (
//               state.data.issues.map((issue, index) => (
//                 <p key={index}>{issue}</p>
//               ))
//             ) : (
//               <p>{state.data.message}</p>
//             )}
//           </div>
//         )}

//         <Form {...form}>
//           <form action={formAction} className="space-y-6">
//             {/* Hidden inputs to ensure FormData includes all values */}
//             <input type="hidden" name="studentId" value={studentId} />
//             <input type="hidden" name="date" value={date} />
//             <input type="hidden" name="status" value={status} />

//             <FormField
//               control={form.control}
//               name="studentId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Student ID</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="number"
//                       placeholder="Enter Student ID"
//                       {...field}
//                       value={field.value}
//                       readOnly
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="date"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Date</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="date"
//                       value={date}
//                       onChange={(e) => {
//                         setDate(e.target.value);
//                         if (e.target.value) {
//                           field.onChange(new Date(e.target.value));
//                         }
//                         debouncedTrigger();
//                       }}
//                       onBlur={field.onBlur}
//                       name="date"
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select
//                     onValueChange={(value: StatusType) => {
//                       field.onChange(value);
//                       setStatus(value);
//                       debouncedTrigger();
//                     }}
//                     defaultValue={field.value}
//                     value={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select Status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="present">Present</SelectItem>
//                       <SelectItem value="absent">Absent</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Notes</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       placeholder="Optional notes"
//                       {...field}
//                       value={field.value ?? ""}
//                       onChange={(e) => {
//                         field.onChange(e);
//                         debouncedTrigger();
//                       }}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogFooter>
//               <Button type="submit" disabled={isPending}>
//                 {isPending ? "Adding Attendance..." : "Mark Attendance"}
//               </Button>
//               <DialogClose asChild>
//                 <Button type="button" variant="secondary">
//                   Close
//                 </Button>
//               </DialogClose>
//             </DialogFooter>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// };

 