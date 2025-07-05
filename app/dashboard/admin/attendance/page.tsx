import { attendanceColumns } from "@/components/columns/attendance-columns";
import { getAttendanceRecords } from "@/app/actions/attendance";
import {
  AttendanceFormValues,
  attendanceSchema,
} from "@/lib/validations/attendance";
import CustomDataTable from "@/components/custom-ui/custom-data-table";
import StudentDetailsLoading from "@/components/skeletons/student-details-skeleton";
import { Suspense } from "react";

export default async function AttendancePage() {
  // try {
  const { attendance, error } = await getAttendanceRecords();

  if (error) {
    return <div>Error loading students: {error}</div>;
  }

  const parsedAttendanceRecords = attendance?.map((attendanceRecord) =>
    attendanceSchema.parse(attendanceRecord)
  ) as AttendanceFormValues[];

  return (
    <Suspense fallback={<StudentDetailsLoading />}>
      <div className="w-[98vw] md:w-[75vw] mb-10">
        <CustomDataTable
          tableTitle="Attendance"
          pgSize={10}
          columns={attendanceColumns}
          data={parsedAttendanceRecords}
          showDatePicker={true}
          filters={[{ column: "studentName", placeholder: "Find by Name" }]}
        />
      </div>
    </Suspense>
  );
}
