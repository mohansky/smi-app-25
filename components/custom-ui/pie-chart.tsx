"use client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  TooltipProps,
  LegendProps,
} from "recharts";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartDataItem, INSTRUMENT_ICONS, InstrumentBreakdownChartProps, InstrumentType } from "@/types";

// Chart colors using CSS custom properties
const getChartColors = () => {
  if (typeof window === 'undefined') {
    // Fallback colors for SSR
    return [
      '#3b82f6', // blue
      '#06b6d4', // cyan
      '#eab308', // yellow
      '#f59e0b', // amber
      '#8b5cf6', // violet
    ];
  }
  
  const computedStyle = getComputedStyle(document.documentElement);
  return [
    computedStyle.getPropertyValue('--color-chart-1').trim(),
    computedStyle.getPropertyValue('--color-chart-2').trim(),
    computedStyle.getPropertyValue('--color-chart-3').trim(),
    computedStyle.getPropertyValue('--color-chart-4').trim(),
    computedStyle.getPropertyValue('--color-chart-5').trim(),
  ];
};

export function InstrumentBreakdownChart({
  monthly,
}: InstrumentBreakdownChartProps) {
  // Prepare data for pie chart
  const chartData = monthly.map((item) => ({
    name: item.instrument,
    value: item.count,
  }));

  const chartColors = getChartColors();

  // Custom tooltip with explicit typing
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem;
      const Icon = INSTRUMENT_ICONS[data.name as InstrumentType];
      return (
        <div className="bg-muted border rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            <span className="font-bold capitalize">{data.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">Students: {data.value}</div>
        </div>
      );
    }
    return null;
  };

  // Custom legend with explicit typing
  const CustomLegend = ({ payload }: LegendProps) => {
    if (!payload) return null;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4 font-firaSans">
        {payload.map((entry, index) => {
          const Icon = INSTRUMENT_ICONS[entry.value as InstrumentType];
          return (
            <div
              key={`legend-${index}`}
              className="flex items-center space-x-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <Icon className="h-4 w-4" />
              <span className="text-sm capitalize">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <CardHeader className="font-firaSans">
        <CardTitle className="text-sm font-medium">
          Students by Instrument
        </CardTitle>
      </CardHeader>
      <CardContent className="font-firaSans">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              className="capitalize"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={<CustomLegend />}
              layout="horizontal"
              verticalAlign="bottom"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  );
}


///////////////////////////////////////////////////////////////////////////////////
// "use client";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Tooltip,
//   Legend,
//   TooltipProps,
//   LegendProps,
// } from "recharts";
// import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ChartDataItem, INSTRUMENT_ICONS, InstrumentBreakdownChartProps, InstrumentType } from "@/types";
// import { chartColors } from "@/lib/color-icon-constants";
 

// export function InstrumentBreakdownChart({
//   monthly,
// }: InstrumentBreakdownChartProps) {
//   // Prepare data for pie chart
//   const chartData = monthly.map((item) => ({
//     name: item.instrument,
//     value: item.count,
//   }));

//   // Custom tooltip with explicit typing
//   const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload as ChartDataItem;
//       const Icon = INSTRUMENT_ICONS[data.name as InstrumentType];

//       return (
//         <div className="bg-muted border rounded-lg shadow-lg p-4">
//           <div className="flex items-center space-x-2">
//             <Icon className="h-5 w-5" />
//             <span className="font-bold capitalize">{data.name}</span>
//           </div>
//           <div className="text-sm text-muted-foreground">Students: {data.value}</div>
//         </div>
//       );
//     }
//     return null;
//   };

//   // Custom legend with explicit typing
//   const CustomLegend = ({ payload }: LegendProps) => {
//     if (!payload) return null;

//     return (
//       <div className="flex flex-wrap justify-center gap-4 mt-4">
//         {payload.map((entry, index) => {
//           const Icon = INSTRUMENT_ICONS[entry.value as InstrumentType];
//           return (
//             <div
//               key={`legend-${index}`}
//               className="flex items-center space-x-2"
//             >
//               <div
//                 className="w-3 h-3 rounded-full"
//                 style={{ backgroundColor: entry.color }}
              
//               />
//               <Icon className="h-4 w-4" />
//               <span className="text-sm capitalize">{entry.value}</span>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <>
//       <CardHeader>
//         <CardTitle className="text-sm font-medium">
//           Students by Instrument
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <ResponsiveContainer width="100%" height={300}>
//           <PieChart className="bg-green-100">
//             <Pie
//               data={chartData}
//               cx="50%"
//               cy="50%"
//               labelLine={false}
//               outerRadius={80}
//               fill="#8884d8"
//               dataKey="value"
//               className="capitalize"
//               label={({ name, percent }) =>
//                 `${name} ${(percent * 100).toFixed(0)}%`
//               }
//             >
//               {chartData.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   // fill={chartColors[index % chartColors.length]}
//                   className={`fill-${chartColors[index % chartColors.length]}`}
//                 />
//               ))}
//             </Pie>
//             <Tooltip content={<CustomTooltip />} />
//             <Legend
//               content={<CustomLegend />}
//               layout="horizontal"
//               verticalAlign="bottom"
//             />
//           </PieChart>
//         </ResponsiveContainer>
//       </CardContent>
//     </>
//   );
// }