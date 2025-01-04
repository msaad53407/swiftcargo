'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, getCountFromServer, getDocs } from "firebase/firestore"
import { Package, Users, FileText, TrendingUp, Clock, Target, Activity } from 'lucide-react'
import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts"
import { db } from "../../firebase/config.js"
import { Skeleton } from "@/components/ui/skeleton.js"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.js"
// Sample data for the profit chart
const profitData = Array.from({ length: 30 }, (_, i) => ({
    date: `2024-01-${i + 1}`,
    value: Math.floor(Math.random() * 1000) + 70000
}))



const recentDeliveries = [
    {
        invoiceNo: "#567834",
        customer: "James Martin",
        date: "02/11/2024",
        amount: "45788.75 USD",
        status: "Paid"
    },
    // Add more delivery data as needed
]
interface DashboardStats {
    totalPackages: number
    totalEmployees: number
    totalInvoices: number
    isLoading: boolean
    error: string | null
}
interface Package {
    paymentStatus: string; // This will allow any status, not just "Paid" or "Pending"
}

interface Invoice {
    packageId: string;
    invoiceNo: string;
    status: string;
    receiverName: string;
    paymentStatus: string;
    amount: {
        total: number;
        pending: number;
    };
    createdAt: string;
    updatedAt: string;
}

export default function Dashboard() {
    const [paymentStatusData, setPaymentStatusData] = useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null); // State for selected status
    const [statusCount, setStatusCount] = useState<Record<string, number>>({}); // Status count map

    const statusColors = {
        "PENDING": "#FF5722",
        "on-the-way": "#FFC107",
        "delivered": "#4CAF50",
        "cancelled": "#9E9E9E",
    };
    // Function to fetch payment status data from Firestore
    const fetchPaymentStatusData = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "packages"));
            const statusCount: Record<string, number> = {};

            querySnapshot.forEach((doc) => {
                const packageData: Package = doc.data() as Package;
                const status = packageData.status;

                // Count the occurrences of each unique payment status
                if (statusCount[status]) {
                    statusCount[status]++;
                } else {
                    statusCount[status] = 1;
                }
            });

            // Set the status count data
            setStatusCount(statusCount);

            // Convert the statusCount object to an array suitable for the PieChart
            const chartData = Object.keys(statusCount).map((status) => ({
                name: status,
                value: statusCount[status],
                color: statusColors[status] || "#888888", // Default color if status has no assigned color
            }));

            setPaymentStatusData(chartData);
        } catch (error) {
            console.error("Error fetching payment status data: ", error);
        }
    };

    useEffect(() => {
        fetchPaymentStatusData();
    }, []);

    // Filter data based on the selected status
    const filteredData = selectedStatus
        ? paymentStatusData.filter((data) => data.name === selectedStatus)
        : paymentStatusData;


    const [stats, setStats] = useState<DashboardStats>({
        totalPackages: 0,
        totalEmployees: 0,
        totalInvoices: 0,
        isLoading: true,
        error: null
    })

    useEffect(() => {
        async function fetchStats() {
            try {
                // Get counts from different collections
                const packagesSnapshot = await getCountFromServer(collection(db, 'packages'))
                const employeesSnapshot = await getCountFromServer(collection(db, 'managers'))
                const invoicesSnapshot = await getCountFromServer(collection(db, 'invoices'))

                setStats({
                    totalPackages: packagesSnapshot.data().count,
                    totalEmployees: employeesSnapshot.data().count,
                    totalInvoices: invoicesSnapshot.data().count,
                    isLoading: false,
                    error: null
                })
            } catch (error) {
                setStats(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Failed to fetch dashboard statistics'
                }))
            }
        }

        fetchStats()
    }, [])

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
    )
    //inovice data

    const [totalProfit, setTotalProfit] = useState<number>(0);
    const [growth, setGrowth] = useState<number>(0);
    const [profitData, setProfitData] = useState<any[]>([]);
    const [invoiceData, setInvoiceData] = useState<any[]>([]);
    // Fetch invoice data from Firestore
    const fetchInvoices = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "invoices"));
            const invoices: Invoice[] = [];
            querySnapshot.forEach((doc) => {
                invoices.push(doc.data() as Invoice);
            });
            // Save the most recent 4 invoices
            const recentInvoices = invoices
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 4);

            setInvoiceData(recentInvoices);



            // Calculate total profit
            const paidInvoices = invoices.filter(
                (invoice) => invoice.paymentStatus.toLowerCase() === "paid"
            );

            const totalProfit = paidInvoices.reduce(
                (sum, invoice) => sum + invoice.amount.total,
                0
            );

            setTotalProfit(totalProfit);

            // Generate profit trend data
            const trendData: Record<string, number> = {};
            paidInvoices.forEach((invoice) => {
                const date = new Date(invoice.createdAt).toLocaleDateString();
                trendData[date] = (trendData[date] || 0) + invoice.amount.total;
            });

            const profitData = Object.keys(trendData).map((date) => ({
                date,
                value: trendData[date],
            }));

            setProfitData(profitData);

            // Mock growth percentage calculation (for simplicity)
            const lastWeekProfit = profitData.slice(-7).reduce((sum, d) => sum + d.value, 0);
            const previousWeekProfit = profitData.slice(-14, -7).reduce((sum, d) => sum + d.value, 0);

            const growth =
                previousWeekProfit > 0
                    ? ((lastWeekProfit - previousWeekProfit) / previousWeekProfit) * 100
                    : 100;

            setGrowth(growth);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);


    return (
        <div className="p-4 space-y-6 lg:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold">Overview Dashboard</h1>
                    {/* Add a responsive description if needed */}
                    {/* <p className="text-muted-foreground text-sm lg:text-base">
              Hi Admin, take a look at your performance and analytics
            </p> */}
                </div>
                {/* Responsive Action Section */}
                {/* <div className="flex gap-2 lg:gap-4 flex-wrap"> */}
            </div>

            {/* Main Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Total Profit Card */}
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
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#10B981"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Status Card */}
                <Card>
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
                                    <SelectItem value="accepted">Accepted</SelectItem>
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
                </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.isLoading ? (
                    <>
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                    </>
                ) : (
                    <>
                        {/* Total Packages */}
                        <Card>
                            <CardContent className="pt-4 lg:pt-6">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Package className="h-5 w-5 lg:h-6 lg:w-6 text-purple-500" />
                                        </div>
                                        <div>
                                            <div className="text-xl lg:text-2xl font-bold">
                                                {stats.totalPackages.toLocaleString()}
                                            </div>
                                            <div className="text-sm lg:text-base text-muted-foreground">
                                                Total Packages
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Employees */}
                        <Card>
                            <CardContent className="pt-4 lg:pt-6">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Users className="h-5 w-5 lg:h-6 lg:w-6 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="text-xl lg:text-2xl font-bold">
                                                {stats.totalEmployees.toLocaleString()}
                                            </div>
                                            <div className="text-sm lg:text-base text-muted-foreground">
                                                Total Employees
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Additional Cards */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <FileText className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">
                                                {stats.totalInvoices.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Invoice Sent</div>
                                        </div>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Recent Deliveries Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="h-12 px-4 text-left whitespace-nowrap">Invoice No.</th>
                                    <th className="h-12 px-4 text-left whitespace-nowrap">Customer</th>
                                    <th className="h-12 px-4 text-left whitespace-nowrap">Date</th>
                                    <th className="h-12 px-4 text-left whitespace-nowrap">Amount</th>
                                    <th className="h-12 px-4 text-left whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceData.map((delivery, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-4 whitespace-nowrap">{delivery.invoiceNo}</td>
                                        <td className="p-4 whitespace-nowrap">{delivery.receiverName}</td>
                                        <td className="p-4 whitespace-nowrap">{delivery.createdAt}</td>
                                        <td className="p-4 whitespace-nowrap">{delivery.amount.total}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${delivery.status === 'Paid'
                                                    ? 'bg-green-100 text-green-600'
                                                    : delivery.status === 'Partially Paid'
                                                        ? 'bg-yellow-100 text-yellow-600'
                                                        : 'bg-red-100 text-red-600'
                                                    }`}
                                            >
                                                {delivery.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>

    )
}

