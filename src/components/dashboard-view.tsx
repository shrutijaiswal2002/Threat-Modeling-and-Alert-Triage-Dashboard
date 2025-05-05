
"use client";

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Activity, ListChecks, Users, PieChart, BarChart2, CircleHelp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Pie, PieLabel, Bar, XAxis, YAxis, CartesianGrid, BarChart, PieChart as RechartsPieChart, Cell, ResponsiveContainer } from "recharts"

type ChartEntry = {
  name: string;
  value: number;
  fill?: string; // Optional fill color for charts
};

interface DashboardSummary {
  total: number;
  pending: number;
  triaged: number;
  inProgress: number;
  resolved: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  statusDistribution: ChartEntry[];
  assigneeDistribution: ChartEntry[];
}

interface DashboardViewProps {
  data: DashboardData;
  /** Indicates if new data is being loaded (typically after form submission) */
  loading: boolean;
}

const CHART_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--muted))" // Fallback color
 ];


export function DashboardView({ data, loading }: DashboardViewProps) {

  const { summary, statusDistribution, assigneeDistribution } = data;

  // Show skeleton only when loading is true AND there's no summary data yet (total is 0).
  // This prevents showing skeletons over the initial mock data or previously loaded data.
  const showSkeleton = loading && summary.total === 0;


  // Chart configurations (optional, for advanced customization)
  const statusChartConfig = statusDistribution.reduce((acc, cur, idx) => {
    acc[cur.name] = { label: cur.name, color: cur.fill || CHART_COLORS[idx % CHART_COLORS.length] };
    return acc;
  }, {} as any);

   const assigneeChartConfig = assigneeDistribution.reduce((acc, cur, idx) => {
     acc[cur.name] = { label: cur.name, color: CHART_COLORS[idx % CHART_COLORS.length] }; // Assign color based on index
     return acc;
   }, {} as any);


    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5 + 15; // Adjust label position
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const percentage = (percent * 100).toFixed(0);

        if (value === 0 || percent < 0.05) return null; // Don't render label if value is 0 or too small

        return (
            <text
            x={x}
            y={y}
            fill="hsl(var(--foreground))" // Use themed foreground color
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="text-xs font-medium"
            >
            {/* {`${name} (${percentage}%)`} */}
             {`${percentage}%`} {/* Show only percentage */}
            </text>
        );
    };

    const renderAssigneeLabel = ({ x, y, width, height, value }: any) => {
        if (value === 0) return null; // Don't render label if value is 0
        return (
          <text x={x + width / 2} y={y - 6} fill="hsl(var(--foreground))" textAnchor="middle" dominantBaseline="middle" className="text-xs font-semibold">
            {value}
          </text>
        );
      };


  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Summary Cards */}
       <Card className="shadow-md rounded-lg border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
             {showSkeleton ? <Skeleton className="h-4 w-4" /> : <ListChecks className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
            {showSkeleton ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{summary.total}</div>}
            <p className="text-xs text-muted-foreground">
                {showSkeleton ? <Skeleton className="h-3 w-3/4 mt-1"/> : "Total threats identified"}
            </p>
            </CardContent>
       </Card>
        <Card className="shadow-md rounded-lg border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
             {showSkeleton ? <Skeleton className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            </CardHeader>
            <CardContent>
            {showSkeleton ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{summary.pending}</div>}
             <p className="text-xs text-muted-foreground">
                {showSkeleton ? <Skeleton className="h-3 w-3/4 mt-1"/> : "Awaiting initial triage"}
             </p>
            </CardContent>
        </Card>
       <Card className="shadow-md rounded-lg border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            {showSkeleton ? <Skeleton className="h-4 w-4" /> : <Activity className="h-4 w-4 text-orange-500" />}
            </CardHeader>
            <CardContent>
            {/* Combine Triaged and In Progress for this card */}
            {showSkeleton ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{summary.inProgress + summary.triaged}</div>}
            <p className="text-xs text-muted-foreground">
                {showSkeleton ? <Skeleton className="h-3 w-3/4 mt-1"/> : "Triaged or actively worked on"}
            </p>
            </CardContent>
       </Card>
       <Card className="shadow-md rounded-lg border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
             {showSkeleton ? <Skeleton className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
            </CardHeader>
            <CardContent>
            {showSkeleton ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{summary.resolved}</div>}
            <p className="text-xs text-muted-foreground">
                {showSkeleton ? <Skeleton className="h-3 w-3/4 mt-1"/> : "Mitigated or closed threats"}
            </p>
            </CardContent>
       </Card>

      {/* Status Distribution Chart */}
       <Card className="md:col-span-2 shadow-md rounded-lg border border-border">
            <CardHeader>
                <CardTitle className="flex items-center"><PieChart className="mr-2 h-5 w-5 text-primary"/> Status Distribution</CardTitle>
                <CardDescription>Breakdown of threats by current status</CardDescription>
            </CardHeader>
            {/* Use flex to center chart content, adjust padding */}
            <CardContent className="h-[300px] flex items-center justify-center p-4 pt-0">
                 {showSkeleton ? (
                    <div className="flex justify-center items-center h-full w-full">
                        <Skeleton className="h-48 w-48 rounded-full" />
                    </div>
                // Only render the chart if not loading AND there is data
                ) : summary.total > 0 ? (
                <ChartContainer config={statusChartConfig} className="min-h-[250px] w-full aspect-square max-w-[250px]"> {/* Centered container */}
                 <ResponsiveContainer width="100%" height="100%">
                   <RechartsPieChart>
                     <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                     <Pie
                        data={statusDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50} // Make it a donut chart
                        labelLine={false}
                        label={renderCustomizedLabel}
                        paddingAngle={2} // Add slight padding between segments
                        activeIndex={0} // Optional: highlight first segment initially
                      >
                        {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} /> // Add border
                        ))}
                     </Pie>
                       <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                   </RechartsPieChart>
                   </ResponsiveContainer>
                 </ChartContainer>
                 ) : (
                    // Show empty state if not loading and no data
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full w-full">
                        <CircleHelp className="w-12 h-12 mb-2 text-muted-foreground/50"/>
                        <p>No threat data available.</p>
                        <p className="text-sm">Submit system details to analyze.</p>
                    </div>
                 )}
            </CardContent>
       </Card>

      {/* Assignee Distribution Chart */}
       <Card className="md:col-span-2 shadow-md rounded-lg border border-border">
            <CardHeader>
                <CardTitle className="flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-primary"/> Assignee Workload</CardTitle>
                <CardDescription>Number of threats assigned to each SOC analyst</CardDescription>
            </CardHeader>
            {/* Adjust padding for bar chart, remove flex centering */}
            <CardContent className="h-[300px] pl-2 pr-6 pt-4 pb-6"> {/* Added specific padding */}
                 {showSkeleton ? (
                    <div className="flex justify-center items-center h-full w-full px-6 pb-6"> {/* Add padding back for skeleton */}
                        <Skeleton className="h-48 w-full" />
                    </div>
                 // Only render the chart if not loading AND there is data
                 ) : summary.total > 0 ? (
                 <ChartContainer config={assigneeChartConfig} className="min-h-[250px] w-full h-full"> {/* Let container fill space */}
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={assigneeDistribution} margin={{ top: 20, right: 5, left: -15, bottom: 5 }} barGap={4} barCategoryGap="20%"> {/* Adjusted margins */}
                         <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                         <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} className="text-xs"/>
                         <YAxis tickLine={false} axisLine={false} tickMargin={8} width={30} className="text-xs" allowDecimals={false}/>
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" hideLabel nameKey="value" />}
                         />
                         <Bar dataKey="value" radius={4} label={renderAssigneeLabel}>
                             {assigneeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={assigneeChartConfig[entry.name]?.color || CHART_COLORS[index % CHART_COLORS.length]} />
                             ))}
                         </Bar>
                     </BarChart>
                     </ResponsiveContainer>
                 </ChartContainer>
                  ) : (
                    // Show empty state if not loading and no data
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full w-full">
                         <CircleHelp className="w-12 h-12 mb-2 text-muted-foreground/50"/>
                         <p>No threat data available.</p>
                         <p className="text-sm">Threats must be present to show workload.</p>
                     </div>
                   )}
            </CardContent>
       </Card>
    </div>
  );
}
