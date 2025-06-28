"use client";
// app/components/custom-ui/stutent-details.tsx
import { updateStudent } from "@/app/actions/student";
import { UpdateStudentForm } from "@/components/forms/update-student-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getBatch,
  getBatchVariant,
  getGrade,
  getGradeVariant,
  getInstrumentIcon,
  getTiming,
} from "@/lib/color-icon-constants";
import { StudentFormValues } from "@/lib/validations/student";
import { format } from "date-fns";
import {
  Clock,
  Edit,
  GraduationCap,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

// Helper function to safely format dates
const safeFormatDate = (
  date: Date | string | null | undefined,
  formatString: string,
  fallback: string = "Not available"
) => {
  if (!date) return fallback;

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    return format(dateObj, formatString);
  } catch {
    return fallback;
  }
};

export default function StudentDetails({
  student,
}: {
  student: StudentFormValues;
}) {
  return (
    <Card className="p-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            <span className="flex gap-3">
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5" />
                <p className="text-2xl font-bold"> {student.name}</p>
              </div>
              <Badge
                className="capitalize"
                variant={student.isActive ? "success" : "destructive"}
              >
                {student.isActive ? "Active" : "Inactive"}
              </Badge>
            </span>
            <span className="flex text-xs font-thin text-muted-foreground">
              Student ID: &nbsp; <p> {student.id}</p>
            </span>
          </CardTitle>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="accent"
                size="icon"
                title={`Edit ${student.name}`}
              >
                <Edit className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-6xl  ">
              <DialogHeader>
                <DialogTitle>Edit Student</DialogTitle>
              </DialogHeader>
              <UpdateStudentForm
                studentId={student.id!}
                initialValues={student}
                updateStudent={updateStudent}
                onSuccess={() => toast.success("Student updated successfully!")}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href={`mailto:${student.email}`} title={`Mail ${student.name}`}>
            <Button variant="link" className="p-0">
              <Mail className="w-5 h-5 text-gray-500" />
              <span>{student.email}</span>
            </Button>
          </Link>
          <Link href={`tel:${student.phone}`} title={`Call ${student.name}`}>
            <Button variant="link" className="p-0">
              <Phone className="w-5 h-5 text-gray-500" />
              <span>{student.phone}</span>
            </Button>
          </Link>
        </div>
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Date of Birth</div>
              <div className="mt-1">
                {safeFormatDate(
                  student.dateOfBirth,
                  "MMMM d, yyyy",
                  "Not provided"
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Joining Date</div>
              <div className="mt-1">
                {safeFormatDate(student.joiningDate, "MMMM d, yyyy")}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Class Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Instrument</div>
              <div className="flex items-center space-x-2 mt-1">
                {getInstrumentIcon(student.instrument)}
                <span className="capitalize">{student.instrument}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Grade</div>

              <Badge variant={getGradeVariant(student.grade)}>
                {`${getGrade(student.grade)}`}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500">Batch</div>
              <Badge variant={getBatchVariant(student.batch)}>
                {`${getBatch(student.batch)}`}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500">Timings</div>
              <Badge variant="outline">{`${getTiming(student.timing)}`}</Badge>
            </div>
          </div>
        </Card>

        <div className=" flex justify-between text-xs font-light text-gray-400 ">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last updated: <br />
            {safeFormatDate(student.updatedAt, "PPpp", "Never updated")}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Created: <br />
            {safeFormatDate(student.createdAt, "dd MMM yyyy", "Unknown")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
