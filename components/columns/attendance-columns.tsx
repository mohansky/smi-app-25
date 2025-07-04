"use client";
import { ColumnDef } from "@tanstack/react-table";
import DateFormatter from "../custom-ui/date-format";
import { AttendanceFormValues } from "@/lib/validations/attendance";
import { Button } from "../ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { DeleteButton } from "../buttons/delete-button";
import { deleteAttendanceRecord } from "@/app/actions/attendance";

// Helper component to format time or show default
const TimeFormatter = ({ timeString }: { timeString?: string }) => {
  if (!timeString) {
    return <span className="text-muted-foreground text-sm">--:--</span>;
  }
  return <span className="font-mono text-sm">{timeString}</span>;
};

export const attendanceColumns: ColumnDef<AttendanceFormValues>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <DateFormatter dateString={row.getValue("date")} />,
  },
  {
    accessorKey: "studentName",
    header: "Student Name",
  },
  {
    accessorKey: "time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    // cell: ({ row }) => <TimeFormatter timeString={row.getValue("time")} />,
    cell: ({ row }) => {
      console.log("Row data:", row.original); // Check what fields exist
      console.log("Time value:", row.getValue("time")); // Check what this returns
      return <TimeFormatter timeString={row.getValue("time")} />;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("notes")}</div>
    ),
  },
  {
    id: "delete",
    header: "Delete",
    cell: ({ row }) => {
      const { id, studentId } = row.original;
      if (typeof id !== "number") return null;
      return (
        <DeleteButton
          id={id}
          identifier={`Student ${studentId}`}
          deleteAction={deleteAttendanceRecord}
          entityType="Attendance Record"
        />
      );
    },
  },
];
