import { Drum, Guitar, Piano } from "lucide-react";

import { Batch, Grade, Instrument } from "@/db/schema";
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
      return "secondary";
    case "tf":
      return "success";
    case "ws":
      return "destructive";
    default:
      return "default";
  }
};

export const getBatch = (batch: Batch) => {
  switch (batch as Batch) {
    case "tf":
      return "Tue & Fri";
    case "ws":
      return "Wed & Sat";
    default:
      return "Mon & Thu";
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
      return "secondary";
    case "grade2":
      return "success";
    case "grade3":
      return "destructive";
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
  "#0088FE", // Blue
  "#00C49F", // Teal
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884D8", // Purple
  "#FF6384", // Pink
];
