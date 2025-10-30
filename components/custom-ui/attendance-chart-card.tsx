"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { AttendanceChart } from "@/components/custom-ui/attendance-chart";
import { getDailyAttendance, getActiveStudentsCount } from "@/app/actions/chartData";
import { format, subMonths } from "date-fns";

interface AttendanceData {
  date: string;
  attendance: number;
  day: string;
}

interface AttendanceChartCardProps {
  initialActiveStudentsCount: number;
}

export function AttendanceChartCard({ initialActiveStudentsCount }: AttendanceChartCardProps) {
  const currentMonth = format(new Date(), "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [activeStudentsCount] = useState<number>(initialActiveStudentsCount);
  const [isLoading, setIsLoading] = useState(true);

  // Generate last 12 months for the dropdown
  const getLastTwelveMonths = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = subMonths(today, i);
      months.push(format(date, "yyyy-MM"));
    }
    return months;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const attendance = await getDailyAttendance(selectedMonth);
        setAttendanceData(attendance.filter((day) => day.attendance > 1));
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  return (
    <Card className="mt-6 mb-5">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Daily Attendance by Month</h3>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getLastTwelveMonths().map((monthOption) => (
                  <SelectItem key={monthOption} value={monthOption}>
                    {format(new Date(monthOption), "MMMM yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[320px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : attendanceData.length > 0 ? (
          <AttendanceChart
            data={attendanceData}
            showPercentage={true}
            totalActiveStudents={activeStudentsCount}
          />
        ) : (
          <div className="h-[320px] flex items-center justify-center text-muted-foreground">
            No attendance data for this month
          </div>
        )}
      </div>
    </Card>
  );
}
