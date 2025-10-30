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
import { PaymentsChart } from "@/components/custom-ui/chart";
import { getMonthlyPaymentsAndExpenses } from "@/app/actions/chartData";
// import { format } from "date-fns";

interface MonthlyData {
  month: string;
  payments: number;
  expenses: number;
}

export function PaymentsChartCard() {
  const [selectedRange, setSelectedRange] = useState<string>("12");
  const [chartData, setChartData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allChartData = await getMonthlyPaymentsAndExpenses();

        // Filter to only months that have actual data (payments > 0 OR expenses > 0)
        const monthsWithData = allChartData.filter(
          (item) => item.payments > 0 || item.expenses > 0
        );

        // Sort by month and take the last N months with data
        const data = monthsWithData
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-parseInt(selectedRange));

        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch payments data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedRange]);

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Payments & Expenses</h3>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedRange} onValueChange={setSelectedRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="12">Last 12 Months</SelectItem>
                <SelectItem value="24">Last 24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : chartData.length > 0 ? (
          <PaymentsChart chartData={chartData} />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No payment data available
          </div>
        )}
      </div>
    </Card>
  );
}
