"use client";
// app/components/forms/add-payment-form.tsx
import { useActionState, useState, useMemo } from "react";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PaymentFormValues, paymentSchema } from "@/lib/validations/payments";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PaymentFormState } from "@/types";
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

// Define proper types for the enum values
type PaymentMethodType = "CASH" | "CARD";
type PaymentStatusType = "DUE" | "PAID";

export const AddPaymentForm = ({
  studentId,
  createPayment,
}: {
  studentId: number;
  createPayment: (
    prevState: PaymentFormState,
    data: FormData
  ) => Promise<PaymentFormState>;
}) => {
  const [state, formAction, isPending] = useActionState(createPayment, {
    status: "idle",
    data: {
      message: "",
      issues: [],
    },
    studentId,
  });

  const today = new Date();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      studentId,
      date: today,
      amount: 0,
      description: "",
      paymentMethod: "CARD",
      paymentStatus: "PAID",
      transactionId: "",
      notes: "",
    },
    mode: "onBlur", // Changed from "onSubmit" to provide better user feedback
  });

  // Track form values in state to ensure they're included in FormData
  const [date, setDate] = useState(formatDateForInput(today));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("CARD");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>("PAID");

  // Debounce form validation to improve performance
  const debouncedTrigger = useMemo(
    () => debounce(() => form.trigger(), 300),
    [form]
  );

  if (state.status === "success") {
    return (
      <Alert variant="default">
        <AlertTitle className="text-active text-xl">
          Payment Added Successfully!
        </AlertTitle>
        <AlertDescription className="text-muted-foreground text-xs">
          The payment has been recorded in the system.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Add Fee Payment
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
            <input type="hidden" name="paymentMethod" value={paymentMethod} />
            <input type="hidden" name="paymentStatus" value={paymentStatus} />

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
            
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        step="0.50"
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
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Payment description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Payment description" 
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

            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter transaction ID (optional)"
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
              
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={(value: PaymentMethodType) => {
                        field.onChange(value);
                        setPaymentMethod(value);
                        debouncedTrigger();
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select
                      onValueChange={(value: PaymentStatusType) => {
                        field.onChange(value);
                        setPaymentStatus(value);
                        debouncedTrigger();
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DUE">Due</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes (optional)"
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
                {isPending ? "Adding Payment..." : "Add Payment"}
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