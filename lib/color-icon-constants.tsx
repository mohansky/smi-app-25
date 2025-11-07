import { Drum, Guitar, Piano } from "lucide-react";

import { Batch, Grade, Instrument, Timing } from "@/db/schema";
export const getInstrumentIcon = (instrument: Instrument) => {
  switch (instrument as Instrument) {
    case "guitar":
      return <Guitar className="w-5 h-5" />;
    case "drums":
      return <Drum className="w-5 h-5" />;
    case "keyboard":
      return <Piano className="w-5 h-5" />;
    default:
      return null;
  }
};

export const getBatchColor = (batch: Batch) => {
  switch (batch as Batch) {
    case "mt":
      return "bg-destructive text-muted dark:text-muted-foreground hover:text-destructive";
    case "tf":
      return "bg-primary text-muted dark:text-muted-foreground hover:text-primary";
    case "ws":
      return "bg-active text-muted dark:text-muted-foreground hover:text-active";
    default:
      return "bg-gray-100 text-muted dark:text-muted-foreground hover:text-active";
  }
};

export const getBatchVariant = (batch: Batch) => {
  switch (batch as Batch) {
    case "mt":
      return "green";
    case "tf":
      return "blue";
    case "ws":
      return "yellow";
    case "cc":
      return "orange";
    default:
      return "default";
  }
};

export const getBatch = (batch: Batch) => {
  switch (batch as Batch) {
    case "mt":
      return "Mon & Thu";
    case "tf":
      return "Tue & Fri";
    case "ws":
      return "Wed & Sat";
    case "cc":
      return "CC Mon - Fri";
    default:
      return "Mon & Thu";
  }
};

export const getTiming = (timing: Timing) => {
  switch (timing as Timing) {
    case "10am-11am":
      return "10 AM - 11 AM";
    case "11am-12pm":
      return "11 AM - 12 PM";
    case "12pm-1pm":
      return "12 PM - 1 PM";
    case "3pm-4pm":
      return "3 PM - 4 PM";
    case "4pm-5pm":
      return "4 PM - 5 PM";
    case "5pm-6pm":
      return "5 PM - 6 PM";
    case "6pm-7pm":
      return "6 PM - 7 PM";
    case "7pm-8pm":
      return "7 PM - 8 PM";
    case "8pm-9pm":
      return "8 PM - 9 PM";
    default:
      return "10 AM - 11 AM";
  }
};

export const getGradeColor = (grade: Grade) => {
  switch (grade as Grade) {
    case "grade1":
      return "bg-destructive text-muted dark:text-muted-foreground hover:text-destructive";
    case "grade2":
      return "bg-primary text-muted dark:text-muted-foreground hover:text-primary";
    case "grade3":
      return "bg-active text-muted dark:text-muted-foreground hover:text-active";
    default:
      return "bg-blue-100 text-muted dark:text-muted-foreground hover:text-active";
  }
};

export const getGradeVariant = (grade: Grade) => {
  switch (grade as Grade) {
    case "grade1":
      return "green";
    case "grade2":
      return "blue"; 
    case "grade3":
      return "yellow";
    default:
      return "default";
  }
};

export const getGrade = (grade: Grade) => {
  switch (grade as Grade) {
    case "grade2":
      return "Grade 2";
    case "grade3":
      return "Grade 3";
    default:
      return "Grade 1";
  }
};

// Color palette for the chart
export const chartColors = [
  "chart-1", // Blue
  "chart-2", // Teal
  "chart-3", // Yellow
  "chart-4", // Orange
  "chart-5", // Purple
  "chart-1", // Pink
];
