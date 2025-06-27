"use client";
// app/components/forms/update-student-form.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { CardContent } from "@/components/ui/card";
import {
  studentSchema,
  type StudentFormValues,
} from "@/lib/validations/student";
import { useActionState, useEffect, useState, useMemo } from "react";
import { debounce } from "lodash";
import { Switch } from "../ui/switch";
import { UpdateStudentFormState } from "@/types";
import { z } from "zod";
import { DialogClose, DialogFooter } from "../ui/dialog";

// Helper function to format date for input
const formatDateForInput = (date: Date | string | null | undefined): string => {
  try {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
  } catch {
    return "";
  }
};

// Define proper types for the enum values
type InstrumentType = "guitar" | "drums" | "keyboard";
type GradeType = "grade1" | "grade2" | "grade3";
type BatchType = "mt" | "tf" | "ws";

export const UpdateStudentForm = ({
  studentId,
  initialValues,
  updateStudent,
  onSuccess,
}: {
  studentId: number;
  initialValues: StudentFormValues;
  updateStudent: (
    prevState: UpdateStudentFormState,
    data: FormData
  ) => Promise<UpdateStudentFormState>;
  onSuccess: () => void;
}) => {
  const [state, formAction, isPending] = useActionState(updateStudent, {
    status: "idle",
    data: {
      message: "",
      issues: [],
    },
    studentId,
    initialValues,
  });

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialValues,
    mode: "onBlur", // Changed from "onChange" to reduce validation frequency
  });

  // Track form values in state to ensure they're included in FormData
  const [dateOfBirth, setDateOfBirth] = useState(
    formatDateForInput(initialValues.dateOfBirth)
  );
  const [joiningDate, setJoiningDate] = useState(
    formatDateForInput(initialValues.joiningDate)
  );
  const [instrument, setInstrument] = useState<InstrumentType>(
    initialValues.instrument || "guitar"
  );
  const [grade, setGrade] = useState<GradeType>(
    initialValues.grade || "grade1"
  );
  const [batch, setBatch] = useState<BatchType>(
    initialValues.batch || "mt"
  );
  const [isActive, setIsActive] = useState(initialValues.isActive ?? true);

  // Debounce form validation to improve performance
  const debouncedTrigger = useMemo(
    () => debounce(() => form.trigger(), 300),
    [form]
  );

  useEffect(() => {
    if (state.status === "success" && !state.data?.issues) {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <CardContent>
      <Form {...form}>
        <form className="space-y-6" action={formAction}>
          {/* Hidden inputs to ensure FormData includes all values */}
          <input type="hidden" name="id" value={studentId} />
          <input type="hidden" name="dateOfBirth" value={dateOfBirth} />
          <input type="hidden" name="joiningDate" value={joiningDate} />
          <input type="hidden" name="instrument" value={instrument} />
          <input type="hidden" name="grade" value={grade} />
          <input type="hidden" name="batch" value={batch} />
          <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />

          <div className="grid md:grid-cols-4 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
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
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setIsActive(checked);
                        debouncedTrigger();
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

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
                      placeholder="+1234567890" 
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
                        debouncedTrigger();
                      }}
                      onBlur={field.onBlur}
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
                        debouncedTrigger();
                      }}
                      onBlur={field.onBlur}
                      name="joiningDate"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
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
                      debouncedTrigger();
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
                      debouncedTrigger();
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
                      debouncedTrigger();
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating Student..." : "Update Student"}
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
  );
};