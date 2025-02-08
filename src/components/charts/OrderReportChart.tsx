import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getMonthlyOrderCount } from "@/utils/dashboard";
import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Skeleton } from "../ui/skeleton";

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function OrdersReportChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders-report"],
    queryFn: getMonthlyOrderCount,
  });

  if (isLoading) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle>Orders Report</CardTitle>
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="h-[calc(100%-8rem)]">
          <div className="flex items-end justify-between w-full h-full">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex flex-col items-center w-full">
                <Skeleton className={`w-full h-${item * 10} mb-2`} />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-3/4" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-5rem)]">
          <h2>Error fetching data</h2>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.length) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle>No Orders</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-5rem)]">
          <h2>No Orders Found</h2>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Annual Orders Report</CardTitle>
        <CardDescription>January - December {new Date().getFullYear()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
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
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Line dataKey="orders" type="linear" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">Showing total orders for current Year</div>
      </CardFooter>
    </Card>
  );
}
