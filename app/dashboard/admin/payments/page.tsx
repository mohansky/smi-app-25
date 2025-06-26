// app/dashboard/admin/payments/page.tsx
import { paymentColumns } from "@/components/columns/payments-columns";
import { getAllPayments } from "@/app/actions/payment";
import { CustomDataTable } from "@/components/custom-ui/custom-data-table";
import StudentDetailsLoading from "@/components/skeletons/student-details-skeleton";
import { Suspense } from "react";
import { PaymentFormValues } from "@/lib/validations/payments";

export default async function PaymentsPage() {
  const result = await getAllPayments();
  
  if (result.success && result.data?.payments) {
    // Transform raw database data to match PaymentFormValues type
    const transformedPayments: PaymentFormValues[] = result.data.payments.map((payment) => ({
      id: payment.id,
      studentId: payment.studentId,
      studentName: payment.studentName,
      date: new Date(payment.date),
      amount: Number(payment.amount),
      description: payment.description,
      paymentMethod: payment.paymentMethod as "CASH" | "CARD",
      paymentStatus: payment.paymentStatus as "DUE" | "PAID",
      transactionId: payment.transactionId,
      notes: payment.notes,
      createdAt: new Date(payment.createdAt),
      updatedAt: new Date(payment.updatedAt),
    }));

    return (
      <Suspense fallback={<StudentDetailsLoading />}>
        <div className="w-[98vw] md:w-[75vw] mb-10">
          <CustomDataTable
            tableTitle="All Payments"
            pgSize={10}
            columns={paymentColumns}
            data={transformedPayments}
            showDatePicker={true}
            filters={[{ column: "studentName", placeholder: "Find by Name" }]}
          />
        </div>
      </Suspense>
    );
  } else {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Payments
          </h2>
          <p className="text-gray-600">
            {result.error || "Unable to fetch payments at this time"}
          </p>
        </div>
      </div>
    );
  }
}