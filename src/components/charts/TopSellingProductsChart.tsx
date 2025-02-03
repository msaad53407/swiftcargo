import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

const data = [
  { name: "Abayas", value: 45 },
  { name: "Returns", value: 15 },
  { name: "Business & Regular", value: 25 },
  { name: "Prayer Dresses", value: 15 },
];

const COLORS = ["#4338ca", "#f97316", "#22c55e", "#06b6d4"];

export function TopSellingProductsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <p className="text-sm text-muted-foreground">Yearly Report Overview</p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-[300px]"
          config={{
            products: {
              label: "Products",
              color: "hsl(var(--success))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
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
