// app/dashboard/admin/page.tsx
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Users, IndianRupee, Calendar } from "lucide-react";
import { MonthPicker } from "@/components/custom-ui/month-picker";
import AddStudentButton from "@/components/buttons/add-student-button";
import MonthlyStatsLoading from "@/components/skeletons/monthly-stats-skeleton";
import { Suspense } from "react";
import { PaymentsChart } from "@/components/custom-ui/chart";
import {
  getActiveStudentsCount,
  getAttendanceStats,
  getDailyAttendance,
  getMonthlyPaymentsAndExpenses,
} from "@/app/actions/chartData";
import { InstrumentBreakdownChart } from "@/components/custom-ui/pie-chart";
import { AttendanceChart } from "@/components/custom-ui/attendance-chart";
import { PageProps } from "@/types";
import { getCombinedStats } from "@/app/actions/chartData";
// import { getDailyAttendance, getAttendanceStats, getActiveStudentsCount } from "@/app/actions/attendanceData";
import { StatCard } from "@/components/custom-ui/stat-card";
import { NoDataCard } from "@/components/custom-ui/no-data-card";
import { Heading } from "@/components/custom-ui/heading"; 

export default async function MonthlyStatsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const currentMonth = format(new Date(), "yyyy-MM");
  const selectedMonth = searchParams.month || currentMonth;

  // Get stats for the selected month
  const stats = await getCombinedStats(selectedMonth);
  const monthDisplay = format(new Date(selectedMonth), "MMMM yyyy");

  // Get attendance data
  const [attendanceData, attendanceStats, activeStudentsCount] =
    await Promise.all([
      getDailyAttendance(selectedMonth),
      getAttendanceStats(selectedMonth),
      getActiveStudentsCount(),
    ]);

  // Get ALL chart data and filter to only months with data
  const allChartData = await getMonthlyPaymentsAndExpenses();

  // Filter to only months that have actual data (payments > 0 OR expenses > 0)
  const monthsWithData = allChartData.filter(
    (item) => item.payments > 0 || item.expenses > 0
  );

  // Sort by month and take the last 12 months with data
  const chartData = monthsWithData
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Take the last 12 months that have data

  return (
    <Suspense fallback={<MonthlyStatsLoading />}>
      <div className="w-[98vw] md:w-[75vw] my-10">
        <AddStudentButton />
        <div className="mb-8">
          <Heading size="md" className="mb-5">
            Statistics Dashboard
          </Heading>
          <MonthPicker defaultValue={selectedMonth} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {stats.hasData ? (
            <>
              {/* Student Stats Card */}
              <Card>
                <StatCard
                  title="Active Students"
                  value={stats.monthly.activeStudents}
                  yearlyValue={stats.yearly.activeStudents}
                  subtitle={`Active Students in ${monthDisplay}`}
                  icon={Users}
                />
                <InstrumentBreakdownChart
                  monthly={stats.monthly.instrumentBreakdown}
                />
              </Card>

              {/* Financial Stats Card */}
              <Card>
                <div className="flex justify-between gap-y-2">
                  <StatCard
                    title="Total Payments"
                    value={stats.monthly.totalPayments}
                    yearlyValue={stats.yearly.totalPayments}
                    subtitle={`Collected in ${monthDisplay}`}
                    icon={IndianRupee}
                  />
                  <StatCard
                    title="Total Expenses"
                    value={stats.monthly.totalExpenses}
                    yearlyValue={stats.yearly.totalExpenses}
                    subtitle={`Expenses in ${monthDisplay}`}
                    icon={IndianRupee}
                  />
                </div>
                {/* Chart shows only months with actual data */}
                <PaymentsChart chartData={chartData} />
              </Card>

              {/* Attendance Stats Card */}
              <Card className="lg:col-span-2 font-firaSans">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">
                      Attendance Overview
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-chart-2">
                        {attendanceStats.averageAttendance}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Daily</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-chart-1">
                        {attendanceStats.highestAttendance}
                      </p>
                      <p className="text-sm text-muted-foreground">Highest</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-chart-3">
                        {attendanceStats.totalStudentsPresent}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Present
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-chart-4">
                        {activeStudentsCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Active Students
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Based on {attendanceStats.totalDays} days in {monthDisplay}
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <NoDataCard />
          )}
        </div>

        {/* Full-width Attendance Chart */}
        {stats.hasData && attendanceData.length > 0 && (
          <Card className="mt-6 mb-20">
            <div className="p-6">
              <AttendanceChart
                data={attendanceData}
                showPercentage={true}
                totalActiveStudents={activeStudentsCount}
              />
            </div>
          </Card>
        )}
      </div>
    </Suspense>
  );
}
