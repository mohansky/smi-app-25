"use client";
// app/components/forms/add-expenses-form.tsx
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
import { ExpenseFormValues, expenseSchema } from "@/lib/validations/expenses";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ActionState } from "@/types";
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
type CategoryType = "UTILITIES" | "RENT" | "MISC";
type ExpenseStatusType = "DUE" | "PAID";

export const AddExpenseForm = ({
  createExpense,
}: {
  createExpense: (
    prevState: ActionState,
    data: FormData
  ) => Promise<ActionState>;
}) => {
  const [state, formAction, isPending] = useActionState(createExpense, {
    status: "idle",
    data: {
      message: "",
      issues: [],
    },
  });

  const today = new Date();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: today,
      amount: 0,
      description: "",
      category: "MISC",
      paymentMethod: "CASH",
      expenseStatus: "PAID",
      transactionId: "",
      notes: "",
    },
    mode: "onBlur", // Changed from "onSubmit" to provide better user feedback
  });

  // Track form values in state to ensure they're included in FormData
  const [date, setDate] = useState(formatDateForInput(today));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("CASH");
  const [category, setCategory] = useState<CategoryType>("MISC");
  const [expenseStatus, setExpenseStatus] = useState<ExpenseStatusType>("PAID");

  // Debounce form validation to improve performance
  const debouncedTrigger = useMemo(
    () => debounce(() => form.trigger(), 300),
    [form]
  );

  if (state.status === "success") {
    return (
      <Alert variant="default">
        <AlertTitle className="text-active text-xl">
          Expense Added Successfully!
        </AlertTitle>
        <AlertDescription className="text-muted-foreground text-xs">
          The expense has been recorded in the system.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Add Expense
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
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="paymentMethod" value={paymentMethod} />
            <input type="hidden" name="category" value={category} />
            <input type="hidden" name="expenseStatus" value={expenseStatus} />

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
                    <FormLabel>Expense Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Expense description" 
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Category</FormLabel>
                    <Select
                      onValueChange={(value: CategoryType) => {
                        field.onChange(value);
                        setCategory(value);
                        debouncedTrigger();
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UTILITIES">Utilities</SelectItem>
                        <SelectItem value="RENT">Rent</SelectItem>
                        <SelectItem value="MISC">Miscellaneous</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expenseStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Status</FormLabel>
                    <Select
                      onValueChange={(value: ExpenseStatusType) => {
                        field.onChange(value);
                        setExpenseStatus(value);
                        debouncedTrigger();
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expense status" />
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
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding Expense..." : "Add Expense"}
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