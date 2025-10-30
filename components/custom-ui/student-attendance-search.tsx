"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, User, Calendar, CheckCircle, XCircle } from "lucide-react";
import { searchStudents, getStudentAttendance } from "@/app/actions/chartData";
import { format, subMonths } from "date-fns";

interface Student {
  id: number;
  name: string;
  email: string;
  instrument: string | null;
  grade: string;
  batch: string;
}

interface AttendanceRecord {
  id: number;
  date: string;
  time: string;
  status: string;
  notes: string | null;
}

interface AttendanceData {
  student: Student;
  attendance: AttendanceRecord[];
  stats: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  };
}

export function StudentAttendanceSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null
  );
  const [selectedMonth, setSelectedMonth] = useState<string>("all-time");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchStudents(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchQuery(student.name);
    await fetchAttendance(student.id, selectedMonth);
  };

  const fetchAttendance = async (studentId: number, month?: string) => {
    setIsLoading(true);
    try {
      const data = await getStudentAttendance(
        studentId,
        month === "all-time" ? undefined : month
      );
      setAttendanceData(data);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (selectedStudent) {
      fetchAttendance(selectedStudent.id, month);
    }
  };

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Student Attendance Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search by student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="pr-10"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                    >
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {student.email} • {student.instrument} • {student.grade}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Month Filter */}
          {selectedStudent && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  {getLastTwelveMonths().map((monthOption) => (
                    <SelectItem key={monthOption} value={monthOption}>
                      {format(new Date(monthOption), "MMMM yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMonth !== "all-time" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMonthChange("all-time")}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results Section */}
        {isLoading && (
          <div className="mt-6 text-center text-muted-foreground">
            Loading attendance data...
          </div>
        )}

        {!isLoading && attendanceData && (
          <div className="mt-6 space-y-4">
            {/* Student Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-lg">
                {attendanceData.student.name}
              </h3>
              <div className="text-sm text-muted-foreground mt-1">
                {attendanceData.student.email} •{" "}
                {attendanceData.student.instrument} •{" "}
                {attendanceData.student.grade} • {attendanceData.student.batch}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-chart-1">
                  {attendanceData.stats.total}
                </div>
                <div className="text-sm text-muted-foreground">Total Days</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {attendanceData.stats.present}
                </div>
                <div className="text-sm text-muted-foreground">Present</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {attendanceData.stats.absent}
                </div>
                <div className="text-sm text-muted-foreground">Absent</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-chart-2">
                  {attendanceData.stats.percentage}%
                </div>
                <div className="text-sm text-muted-foreground">Attendance</div>
              </div>
            </div>

            {/* Attendance Records */}
            {attendanceData.attendance.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Day</th>
                        <th className="text-left p-3">Time</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.attendance.map((record) => (
                        <tr
                          key={record.id}
                          className="border-t hover:bg-muted/50"
                        >
                          <td className="p-3">
                            {format(new Date(record.date), "MMM dd, yyyy")}
                          </td>
                          <td className="p-3">
                            {format(new Date(record.date), "EEEE")}
                          </td>
                          <td className="p-3">{record.time}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {record.status === "present" ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-green-600 capitalize">
                                    {record.status}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  <span className="text-red-600 capitalize">
                                    {record.status}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {record.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found for the selected period.
              </div>
            )}
          </div>
        )}

        {!isLoading && !attendanceData && selectedStudent && (
          <div className="mt-6 text-center text-muted-foreground">
            No data available for this student.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
