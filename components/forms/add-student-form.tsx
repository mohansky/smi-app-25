"use client";
// app/components/forms/add-student-form.tsx
import { useActionState, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { studentSchema } from "@/lib/validations/student";
import { INSTRUMENTS, GRADES, BATCHES } from "@/db/schema";
import { AddStudentFormState } from "@/types";
import { z } from "zod";
import { DialogClose, DialogFooter } from "../ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

// Helper function to get safe date value with TypeScript types
const getSafeDate = (date: Date | string | null | undefined): Date => {
  try {
    if (date === null || date === undefined) {
      return new Date();
    }
    
    const d = date instanceof Date ? date : new Date(date);
    return !isNaN(d.getTime()) ? d : new Date();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return new Date();
  }
};

// Helper function to format date for input with TypeScript types
const formatDateForInput = (date: Date | string | null | undefined): string => {
  try {
    const d = getSafeDate(date);
    return d.toISOString().split("T")[0];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return "";
  }
};

// Define proper types for the enum values
type InstrumentType = "guitar" | "drums" | "keyboard";
type GradeType = "grade1" | "grade2" | "grade3";
type BatchType = "mt" | "tf" | "ws" | "cc";
type TimingType = "10am-11am" | "11am-12pm" | "12pm-1pm" | "3pm-4pm" | "4pm-5pm" | "5pm-6pm" | "6pm-7pm" | "7pm-8pm" | "8pm-9pm";

export const AddStudentForm = ({
  addStudent,
}: {
  addStudent: (
    prevState: AddStudentFormState,
    data: FormData
  ) => Promise<AddStudentFormState>;
}) => {
  const [state, formAction, isPending] = useActionState(addStudent, {
    status: "idle",
    data: {
      message: "",
      user: undefined,
      issues: [],
    },
  });

  // Create safe default dates
  const today = new Date();
  const defaultDob = new Date();
  defaultDob.setFullYear(today.getFullYear() - 8); // Default age of 8 years

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      instrument: INSTRUMENTS.GUITAR,
      grade: GRADES.GRADE1,
      batch: BATCHES.MT,
      timing: "10am-11am" as TimingType,
      dateOfBirth: defaultDob,
      joiningDate: today,
      isActive: true,
    },
    mode: "onBlur", // Changed from "onChange" to reduce validation frequency
  });

  // Track date values in state to avoid conversion issues
  const [dateOfBirth, setDateOfBirth] = useState(
    formatDateForInput(defaultDob)
  );
  const [joiningDate, setJoiningDate] = useState(formatDateForInput(today));
  
  // Track select values in state for FormData - with proper typing
  const [instrument, setInstrument] = useState<InstrumentType>(INSTRUMENTS.GUITAR);
  const [grade, setGrade] = useState<GradeType>(GRADES.GRADE1);
  const [batch, setBatch] = useState<BatchType>(BATCHES.MT);
  const [timing, setTiming] = useState<TimingType>("10am-11am");

  // Debounce form validation to improve performance
  const debouncedTrigger = useMemo(
    () => debounce(() => form.trigger(), 300),
    [form]
  );

  if (state.status === "success") {
    return (
      <Alert variant="default">
        <AlertTitle className="text-active text-xl">
          Student Added Successfully!
        </AlertTitle>
        <AlertDescription className="text-muted-foreground text-xs">
          Student details have been recorded in the system.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Add New Student
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state?.data?.message && (
          <div
            className={`font-bold mb-10 ${
              state.status === "error" || state.status === "existingStudent"
                ? "text-destructive"
                : "text-active"
            }`}
          >
            {state.status === "error" && <p>Invalid Fields please check.</p>}
            {state.status === "existingStudent" && <p>{state.data.message}</p>}
          </div>
        )}
        <Form {...form}>
          <form action={formAction} className="space-y-6">
            {/* Hidden inputs to ensure FormData includes all values */}
            <input type="hidden" name="dateOfBirth" value={dateOfBirth} />
            <input type="hidden" name="joiningDate" value={joiningDate} />
            <input type="hidden" name="isActive" value="true" />
            <input type="hidden" name="instrument" value={instrument} />
            <input type="hidden" name="grade" value={grade} />
            <input type="hidden" name="batch" value={batch} />
            <input type="hidden" name="timing" value={timing} />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debouncedTrigger(); // Debounced validation
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
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

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1234567890" 
                        {...field}
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
            </div>

            <div className="grid grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => {
                          setDateOfBirth(e.target.value);
                          if (e.target.value) {
                            field.onChange(new Date(e.target.value));
                          }
                        }}
                        name="dateOfBirth"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="joiningDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joining Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={joiningDate}
                        onChange={(e) => {
                          setJoiningDate(e.target.value);
                          if (e.target.value) {
                            field.onChange(new Date(e.target.value));
                          }
                        }}
                        name="joiningDate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="instrument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Instrument</FormLabel>
                    <Select
                      onValueChange={(value: InstrumentType) => {
                        field.onChange(value);
                        setInstrument(value);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select instrument" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="guitar">Guitar</SelectItem>
                        <SelectItem value="drums">Drums</SelectItem>
                        <SelectItem value="keyboard">Keyboard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Grade</FormLabel>
                    <Select
                      onValueChange={(value: GradeType) => {
                        field.onChange(value);
                        setGrade(value);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="grade1">Grade 1</SelectItem>
                        <SelectItem value="grade2">Grade 2</SelectItem>
                        <SelectItem value="grade3">Grade 3</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Batch</FormLabel>
                    <Select
                      onValueChange={(value: BatchType) => {
                        field.onChange(value);
                        setBatch(value);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mt">Mon, Thur</SelectItem>
                        <SelectItem value="tf">Tue, Fri</SelectItem>
                        <SelectItem value="ws">Wed, Sat</SelectItem>
                        <SelectItem value="cc">CC: Mon - Fri</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Timing</FormLabel>
                    <Select
                      onValueChange={(value: TimingType) => {
                        field.onChange(value);
                        setTiming(value);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="10am-11am">10:00 AM - 11:00 AM</SelectItem>
                        <SelectItem value="11am-12pm">11:00 AM - 12:00 PM</SelectItem>
                        <SelectItem value="12pm-1pm">12:00 PM - 1:00 PM</SelectItem>
                        <SelectItem value="3pm-4pm">3:00 PM - 4:00 PM</SelectItem>
                        <SelectItem value="4pm-5pm">4:00 PM - 5:00 PM</SelectItem>
                        <SelectItem value="5pm-6pm">5:00 PM - 6:00 PM</SelectItem>
                        <SelectItem value="6pm-7pm">6:00 PM - 7:00 PM</SelectItem>
                        <SelectItem value="7pm-8pm">7:00 PM - 8:00 PM</SelectItem>
                        <SelectItem value="8pm-9pm">8:00 PM - 9:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding Student..." : "Add Student"}
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

export default AddStudentForm;