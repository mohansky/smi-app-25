// app/dashboard/admin/page.tsx
import AddStudentButton from "@/components/buttons/add-student-button";
import { Heading } from "@/components/custom-ui/heading";
import { StudentClassCount } from "@/components/custom-ui/student-class-count";
import { AttendanceChartCard } from "@/components/custom-ui/attendance-chart-card";
import { AttendanceStatsCard } from "@/components/custom-ui/attendance-stats-card";
import { PaymentsChartCard } from "@/components/custom-ui/payments-chart-card";
import { StudentStatsCard } from "@/components/custom-ui/student-stats-card";
import { getActiveStudentsCount } from "@/app/actions/chartData";

export default async function MonthlyStatsPage() {
  // Fetch shared data once to avoid duplicate calls
  const activeStudentsCount = await getActiveStudentsCount();

  return (
    <div className="w-[98vw] md:w-[75vw] my-10">
      <AddStudentButton />
      <div className="mb-8">
        <Heading size="md" className="mb-5">
          Statistics Dashboard
        </Heading>
      </div>

      {/* Student Class Count with individual month picker */}
      <StudentClassCount />

      {/* Attendance Chart with individual month picker */}
      <AttendanceChartCard initialActiveStudentsCount={activeStudentsCount} />

      {/* Attendance Stats Card with individual month picker */}
      <AttendanceStatsCard initialActiveStudentsCount={activeStudentsCount} />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Student Stats Card */}
        <StudentStatsCard />

        {/* Payments Chart Card with individual range picker */}
        <PaymentsChartCard />
      </div>
    </div>
  );
}
