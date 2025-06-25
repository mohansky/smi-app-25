import {
  User,
  UserRoundPen,
  IndianRupee,
  CalendarDays,
  Calendar1,
  LayoutDashboard,
  PlusIcon,
  ReceiptIndianRupee
} from "lucide-react";

export const adminMenu: {
  text: string;
  url: string;
  id?: number;
  icon: string | React.ComponentType;
}[] = [
  {
    text: "Dashboard",
    url: "/dashboard/admin",
    id: 1,
    icon: LayoutDashboard,
  },
    {
    text: "Register Student",
    url: "/dashboard/admin/register-student",
    id: 2,
    icon: UserRoundPen,
  },
  {
    text: "Add Fees and Attendance",
    url: "/dashboard/admin/add-pay-att-student",
    id: 3,
    icon: PlusIcon,
  }, 
  {
    text: "Students",
    url: "/dashboard/admin/students",
    id: 4,
    icon: User,
  },
  {
    text: "Attendance",
    url: "/dashboard/admin/attendance",
    id: 5,
    icon: Calendar1,
  },
  {
    text: "Payments",
    url: "/dashboard/admin/payments",
    id: 6,
    icon: IndianRupee,
  },
  {
    text: "Expenses",
    url: "/dashboard/admin/expenses",
    id: 7,
    icon: ReceiptIndianRupee,
  },
  {
    text: "Schedule",
    url: "/dashboard/admin/schedule",
    id: 8,
    icon: CalendarDays,
  },
];

export const userMenu: {
  text: string;
  url: string;
  id?: number;
  icon: string | React.ComponentType;
}[] = [
  {
    text: "Dashboard",
    url: "/dashboard/user",
    id: 1,
    icon: LayoutDashboard,
  },
  {
    text: "Attendance",
    url: "/dashboard/user/attendance",
    id: 2,
    icon: Calendar1,
  },
  {
    text: "Payments",
    url: "/dashboard/user/payments",
    id: 3,
    icon: IndianRupee,
  },
  {
    text: "Schedule",
    url: "/dashboard/user/schedule",
    id: 4,
    icon: CalendarDays,
  },
];
