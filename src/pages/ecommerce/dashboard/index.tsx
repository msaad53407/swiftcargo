import { OrdersReportChart } from "@/components/charts/OrderReportChart";
import { TopSellingProductsChart } from "@/components/charts/TopSellingProductsChart";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrdersTableSKeleton } from "@/components/orders/OrdersTableSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Package, Users } from "lucide-react";

export default function EcommerceDashboard() {
  const { productsCount, isLoadingProductsCount, productsCountError } = useProducts();
  const { ordersCount, isLoadingOrdersCount, ordersCountError, isLoading, filteredData } = useOrders();
  return (
    <div className="p-4 space-y-6 lg:p-6">
      {/* <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div> */}
      {/* <h1 className="text-xl lg:text-2xl font-bold">Overview Dashboard</h1> */}
      {/* Add a responsive description if needed */}
      {/* <p className="text-muted-foreground text-sm lg:text-base">
              Hi Admin, take a look at your performance and analytics
            </p> */}
      {/* </div> */}
      {/* Responsive Action Section */}
      {/* <div className="flex gap-2 lg:gap-4 flex-wrap"> */}
      {/* </div> */}

      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl lg:text-4xl font-bold">${totalProfit.toFixed(2)}</div>
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  {growth.toFixed(2)}%
                </div>
              </div>
              <div className="h-48 lg:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitData}>
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card> */}

      {/* Payment Status Card */}
      {/* <Card>
                    <CardHeader>
                        <CardTitle className="text-base lg:text-lg font-medium">Package Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <Select onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-full lg:w-[230px]">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Accepted">Accepted</SelectItem>
                                    <SelectItem value="arrived-at-tash-airport">Arrived at Tash Airport</SelectItem>
                                    <SelectItem value="departed-from-tash-airport">Departed from Tash Airport</SelectItem>
                                    <SelectItem value="arrived-at-jfk-airport">Arrived at JFK Airport</SelectItem>
                                    <SelectItem value="picked-up-from-jfk-airport">Picked up from JFK Airport</SelectItem>
                                    <SelectItem value="available-for-pickup">Available for pick up</SelectItem>
                                    <SelectItem value="shipped-to-receivers-destination">Shipped to Receiver’s destination</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mb-4">
                            {selectedStatus && (
                                <div>
                                    <strong>{selectedStatus}</strong> - {statusCount[selectedStatus]} packages
                                </div>
                            )}
                        </div>
                        <div className="h-48 lg:h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={filteredData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {filteredData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card> */}
      {/* </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <OrdersReportChart />
        <TopSellingProductsChart />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingProductsCount ? (
          <StatsCardSkeleton />
        ) : (
          <Card>
            <CardContent className="pt-4 lg:pt-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-5 w-5 lg:h-6 lg:w-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-xl lg:text-2xl font-bold">
                      {productsCountError ? productsCountError.message : productsCount}
                    </div>
                    <div className="text-sm lg:text-base text-muted-foreground">Total Products</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Employees */}
        {isLoadingOrdersCount ? (
          <StatsCardSkeleton />
        ) : (
          <Card>
            <CardContent className="pt-4 lg:pt-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-5 w-5 lg:h-6 lg:w-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-xl lg:text-2xl font-bold">
                      {ordersCountError ? ordersCountError.message : ordersCount}
                    </div>
                    <div className="text-sm lg:text-base text-muted-foreground">Total Orders</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Additional Cards */}
        {/* <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalInvoices.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Invoice Sent</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Recent Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>{isLoading ? <OrdersTableSKeleton /> : <OrdersTable data={filteredData} />}</CardContent>
      </Card>
    </div>
  );
}

const StatsCardSkeleton = () => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardContent>
  </Card>
);
