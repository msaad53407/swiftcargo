import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { getTopSellingProducts } from "@/utils/dashboard";
import { useQuery } from "@tanstack/react-query";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Skeleton } from "../ui/skeleton";

const COLORS = ["#4338ca", "#f97316", "#22c55e", "#06b6d4"];

export function TopSellingProductsChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["top-selling-products"],
    queryFn: getTopSellingProducts,
  });

  if (isLoading) {
    return (
      <Card className="w-full h-[400px]">
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
          <CardTitle>No Products</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-5rem)]">
          <h2>No Products Found</h2>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <p className="text-sm text-muted-foreground">Yearly Report Overview</p>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)]">
        <ChartContainer
          className="h-full w-full"
          config={{
            products: {
              label: "Products",
              color: "hsl(var(--success))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius="40%" outerRadius="70%" paddingAngle={2} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{
                  paddingLeft: "20px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
