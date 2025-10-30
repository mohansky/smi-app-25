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
import { getAttendanceStats, getActiveStudentsCount } from "@/app/actions/chartData";
import { format, subMonths } from "date-fns";

interface AttendanceStats {
  totalDays: number;
  averageAttendance: number;
  highestAttendance: number;
  lowestAttendance: number;
  totalStudentsPresent: number;
}

interface AttendanceStatsCardProps {
  initialActiveStudentsCount: number;
}

export function AttendanceStatsCard({ initialActiveStudentsCount }: AttendanceStatsCardProps) {
  const currentMonth = format(new Date(), "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
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
        const stats = await getAttendanceStats(selectedMonth);
        setAttendanceStats(stats);
      } catch (error) {
        console.error("Failed to fetch attendance stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  const monthDisplay = format(new Date(selectedMonth), "MMMM yyyy");

  return (
    <Card className="font-firaSans mb-5">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Attendance Overview</h3>
          </div>
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

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : attendanceStats ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 items-center gap-4 mb-4">
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
                <p className="text-sm text-muted-foreground">Total Present</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-chart-4">
                  {activeStudentsCount}
                </p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Based on {attendanceStats.totalDays} days in {monthDisplay}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No data available
          </div>
        )}
      </div>
    </Card>
  );
}
