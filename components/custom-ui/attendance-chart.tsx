// components/custom-ui/attendance-chart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "../ui/card";

interface AttendanceData {
  date: string;
  attendance: number;
  day: string;
  percentage?: number; // Optional percentage data
}

interface AttendanceChartProps {
  data: AttendanceData[];
  showPercentage?: boolean;
  totalActiveStudents?: number;
}

export function AttendanceChart({
  data,
  showPercentage = false,
  totalActiveStudents = 0,
}: AttendanceChartProps) {
  // Calculate percentage for each day if not provided
  const chartData = data.map((item) => ({
    ...item,
    percentage:
      item.percentage ||
      (totalActiveStudents > 0
        ? Math.round((item.attendance / totalActiveStudents) * 100)
        : 0),
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: AttendanceData & { percentage: number };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = parseISO(data.date);

      return (
        <div className="bg-muted p-3 border rounded-lg shadow-lg font-firaSans">
          <p className="font-medium">{format(date, "EEEE, MMMM d, yyyy")}</p>
          <div className="space-y-1">
            <p className="text-chart-1">
              Present: <span className="font-semibold">{data.attendance}</span>
            </p>
            {showPercentage && totalActiveStudents > 0 && (
              <p className="text-chart-3">
                Percentage:{" "}
                <span className="font-semibold">{data.percentage}%</span>
              </p>
            )}
            {totalActiveStudents > 0 && (
              <p className="text-gray-600 text-xs">
                Total Students: {totalActiveStudents}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full font-firaSans">
      <div className="flex justify-between items-center mb-4">
        {/* <h3 className="text-lg font-semibold">Daily Attendance</h3> */}
        {totalActiveStudents > 0 && (
          <p className="text-sm text-muted-foreground">
            Total Active Students: {totalActiveStudents}
          </p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{
            top: 25,
            right: 20,
            left: 0,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-10" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            domain={[0, "dataMax + 2"]}
          />
          <Tooltip content={<CustomTooltip />} />
          {showPercentage && <Legend />}

          <Bar
            dataKey="attendance"
            name="Students Present"
            // fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            className="fill-primary hover:opacity-80 transition-opacity"
          />

          {/* Optional: Show percentage as a secondary bar - commenting out for now */}
          {/* {showPercentage && totalActiveStudents > 0 && (
            <Bar 
              dataKey="percentage" 
              name="Attendance %"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          )} */}
        </BarChart>
      </ResponsiveContainer>
      {/* Show summary stats below chart */}
      {chartData.length > 0 && (
        <Card className="font-firaSans shadow-none mt-5 w-full">
          <CardContent className="text-center">
            <div className="grid grid-cols-3 text-center text-sm">
              <div>
                <p className="font-medium text-chart-1">
                  {Math.round(
                    chartData.reduce((sum, d) => sum + d.attendance, 0) /
                      chartData.length
                  )}
                </p>
                <p className="text-muted-foreground">Avg Daily</p>
              </div>

              <div>
                <p className="font-medium text-chart-2">
                  {Math.max(...chartData.map((d) => d.attendance))}
                </p>
                <p className="text-muted-foreground">Best Day</p>
              </div>
              <div>
                <p className="font-medium text-chart-4">
                  {Math.min(...chartData.map((d) => d.attendance))}
                </p>
                <p className="text-muted-foreground">Lowest Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
