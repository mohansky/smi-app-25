import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { InstrumentBreakdownChart } from "@/components/custom-ui/pie-chart";
import { getStudentStats } from "@/app/actions/chartData";

export async function StudentStatsCard() {
  const { totalActive, instrumentBreakdown } = await getStudentStats();

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Active Students by Instrument</h3>
        </div>

        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-primary">{totalActive}</p>
          <p className="text-sm text-muted-foreground">Total Active</p>
        </div>
        <InstrumentBreakdownChart monthly={instrumentBreakdown} />
      </div>
    </Card>
  );
}
