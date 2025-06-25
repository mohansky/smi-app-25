"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  // ResponsiveContainer,
} from "recharts";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartDataProps {
  month: string;
  payments: number;
  expenses: number;
}

const chartConfig = {
  payments: {
    label: "Payments: ₹",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Expenses: ₹",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function PaymentsChart({ chartData }: { chartData: ChartDataProps[] }) {
  // Calculate totals
  const totalPayments = chartData.reduce((sum, item) => sum + item.payments, 0);
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
  const difference = totalPayments - totalExpenses;

  // Format month display
  const formatMonth = (monthStr: string) => {
    if (chartData.length === 1) {
      // Single month - show full month name
      const date = new Date(monthStr + "-01");
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      // Multiple months - show month abbreviation
      return monthStr.slice(5, 7);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>
          {chartData.length === 1 ? "Monthly Breakdown" : "Monthly Payments vs Expenses"}
        </CardTitle>
        <CardDescription>
          {chartData.length === 1 
            ? "Payment and expense breakdown for selected month"
            : "Monthly payment and expenses overview"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatMonth}
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="payments"
              type="natural"
              fill="var(--color-payments)"
              fillOpacity={0.4}
              stroke="var(--color-payments)"
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="var(--color-expenses)"
              fillOpacity={0.4}
              stroke="var(--color-expenses)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-between items-center gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none text-active">
            Total Payments: ₹{totalPayments.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 leading-none text-destructive-foreground">
            Total Expenses: ₹{totalExpenses.toLocaleString()}
          </div>
          <div
            className={`flex items-center gap-2 leading-none ${
              difference >= 0 ? "text-active" : "text-destructive-foreground"
            }`}
          >
            Net: ₹{Math.abs(difference).toLocaleString()}
            {difference >= 0 ? " profit" : " loss"}
          </div>
        </div>
      </CardFooter>
    </>
  );
}