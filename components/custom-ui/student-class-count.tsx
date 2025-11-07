"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, BookOpen } from "lucide-react";
import {
  getAllActiveStudents,
  getStudentAttendance,
} from "@/app/actions/chartData";
import { format, subMonths } from "date-fns";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  getBatch,
  getBatchVariant,
  getGrade,
  getGradeVariant,
  getInstrumentIcon,
} from "@/lib/color-icon-constants";
import { Batch, Grade, Instrument } from "@/db/schema";
// import { Student } from "@/db/schema";
// import { StudentFormValues } from "@/lib/validations/student";

interface Student {
  id: number;
  name: string;
  email: string;
  instrument: Instrument | null | undefined;
  grade: Grade;
  batch: Batch;
}

export function StudentClassCount() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all-time");
  const [classCount, setClassCount] = useState<number | null>(null);
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Load active students on mount
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const activeStudents = await getAllActiveStudents();
        setStudents(activeStudents);
      } catch (error) {
        console.error("Failed to load students:", error);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, []);

  const handleFetchAttendance = useCallback(async () => {
    if (!selectedStudentId) return;

    setIsLoading(true);
    try {
      const data = await getStudentAttendance(
        parseInt(selectedStudentId),
        selectedMonth === "all-time" ? undefined : selectedMonth
      );

      if (data) {
        setClassCount(data.stats.present);
        setStudentInfo(data.student);
      } else {
        setClassCount(0);
        setStudentInfo(null);
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      setClassCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudentId, selectedMonth]);

  // Auto-fetch when student or month changes
  useEffect(() => {
    if (selectedStudentId) {
      handleFetchAttendance();
    }
  }, [selectedStudentId, selectedMonth, handleFetchAttendance]);

  const handleClearFilter = () => {
    setSelectedMonth("all-time");
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
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Student Class Attendance Count
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Student Selection */}
        <div className="flex flex-col max-w-min gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Student</label>
            {loadingStudents ? (
              <div className="text-sm text-muted-foreground">
                Loading students...
              </div>
            ) : (
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      <div className="text-left min-w-32">{student.name}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Month Filter */}
          {selectedStudentId && (
            <div className="space-y-2">
              <Label>Filter by Month</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-32">
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-time">All Time</SelectItem>
                      {getLastTwelveMonths().map((monthOption) => (
                        <SelectItem key={monthOption} value={monthOption}>
                          <div className="text-left min-w-32">
                            {format(new Date(monthOption), "MMMM yyyy")}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedMonth !== "all-time" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearFilter}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Display */}
        {isLoading && selectedStudentId && (
          <div className="space-y-4 pt-4">
            {/* Student Info Skeleton */}
            <div className="p-4 bg-muted rounded-lg animate-pulse">
              <div className="h-6 bg-muted-foreground/20 rounded w-1/3 mb-3"></div>
              <div className="flex gap-4">
                <div className="h-6 bg-muted-foreground/20 rounded w-20"></div>
                <div className="h-6 bg-muted-foreground/20 rounded w-20"></div>
                <div className="h-6 bg-muted-foreground/20 rounded w-16"></div>
              </div>
            </div>

            {/* Class Count Display Skeleton */}
            <div className="flex items-center justify-center p-8  shadow-sm rounded-lg bg-muted/30">
              <div className="text-center animate-pulse">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-6 w-6 bg-muted-foreground/20 rounded"></div>
                  <div className="h-12 w-24 bg-muted-foreground/20 rounded"></div>
                </div>
                <div className="h-6 bg-muted-foreground/20 rounded w-40 mx-auto"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-32 mx-auto mt-2"></div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && classCount !== null && studentInfo && (
          <div className="space-y-4 pt-4">
            {/* Student Info */}
            <div className="p-4 bg-muted rounded-lg  w-fit">
              <CardTitle className="mb-3">{studentInfo.name}</CardTitle>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2 mt-1">
                  {getInstrumentIcon(studentInfo.instrument as Instrument)}
                  <span className="capitalize">{studentInfo.instrument}</span>
                </div>
                <Badge variant={getBatchVariant(studentInfo.batch)}>
                  {`${getBatch(studentInfo.batch)}`}
                </Badge>
                <Badge variant={getGradeVariant(studentInfo.grade)}>
                  {`${getGrade(studentInfo.grade)}`}
                </Badge>

                {/* <Badge variant="destructive" className="capitalize">
                  {studentInfo.instrument}
                </Badge>
                <Badge variant="destructive" className="capitalize">
                  {studentInfo.grade}
                </Badge>
                <Badge variant="destructive" className="uppercase">
                  {studentInfo.batch}
                </Badge> */}
              </div>
            </div>

            {/* Class Count Display */}
            <div className="flex items-center justify-center p-8 shadow-sm rounded-lg bg-muted/30">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  <span className="text-5xl font-bold text-primary">
                    {classCount}
                  </span>
                </div>
                <p className="text-lg font-medium">
                  {classCount === 1 ? "Class" : "Classes"} Attended
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedMonth !== "all-time"
                    ? `in ${format(new Date(selectedMonth), "MMMM yyyy")}`
                    : "All Time"}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !selectedStudentId && (
          <div className="flex items-center justify-center p-8 shadow-sm rounded-lg bg-muted/30 mt-4">
            <div className="text-center text-muted-foreground">
              Select a student to view attendance count
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
