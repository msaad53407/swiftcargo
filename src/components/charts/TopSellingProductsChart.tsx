import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { getTopSellingProducts } from "@/utils/dashboard";
import { useQuery } from "@tanstack/react-query";
import { Pie, PieChart } from "recharts";
import { Skeleton } from "../ui/skeleton";

export function TopSellingProductsChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["top-selling-products"],
    queryFn: getTopSellingProducts,
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="h-[calc(100%-5rem)]">
          <div className="flex items-center justify-center w-full h-full">
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="flex flex-col items-center space-y-2">
                <Skeleton className="w-32 h-32 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-5rem)]">
          <h2>Error fetching data</h2>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Products</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-5rem)]">
          <h2>No Products Found</h2>
        </CardContent>
      </Card>
    );
  }

  const chartConfig: ChartConfig = data.reduce((acc, { name }, index) => {
    return {
      ...acc,
      [name]: {
        label: name,
        color: `hsl(var(--chart-${index + 1}))`,
      },
    };
  }, {} as ChartConfig);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>January - December {new Date().getFullYear()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px] size-full">
          <PieChart>
            <Pie data={data} dataKey="value" />
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
