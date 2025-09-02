"use client";

import type React from "react";

import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Eye,
  Plus,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch data
  const store = useQuery(api.stores.getStore, { slug });
  const products = useQuery(api.products.getProductsByStoreSlug, { slug });
  const orders = useQuery(api.orders.getMyStoreOrders);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!orders || !products) return null;

    const validOrders = orders.filter((order) => order !== undefined);
    const validProducts = products.filter((product) => product !== undefined);

    // Calculate revenue
    const totalRevenue = validOrders.reduce(
      (sum, order) => sum + (order.amount || 0),
      0
    );
    const lastMonthRevenue = validOrders
      .filter((order) => {
        const orderDate = new Date(order._creationTime);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return orderDate >= lastMonth;
      })
      .reduce((sum, order) => sum + (order.amount || 0), 0);

    // Calculate order metrics
    const totalOrders = validOrders.length;
    const pendingOrders = validOrders.filter(
      (order) => order.status === "pending"
    ).length;
    const completedOrders = validOrders.filter((order) =>
      ["shipping", "delivered"].includes(order.status)
    ).length;

    // Calculate product metrics
    const totalProducts = validProducts.length;
    const activeProducts = validProducts.length;

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      lastMonthRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalProducts,
      activeProducts,
      averageOrderValue,
    };
  }, [orders, products]);

  // Prepare chart data
  const salesData = useMemo(() => {
    if (!orders) return [];

    const validOrders = orders.filter((order) => order !== undefined);
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map((date) => {
      const dayOrders = validOrders.filter((order) => {
        const orderDate = new Date(order._creationTime);
        return orderDate.toDateString() === date.toDateString();
      });

      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        sales: dayOrders.reduce((sum, order) => sum + (order.amount || 0), 0),
        orders: dayOrders.length,
      };
    });
  }, [orders]);

  // Order status data for pie chart
  const orderStatusData = useMemo(() => {
    if (!metrics) return [];

    return [
      { name: "Completed", value: metrics.completedOrders, color: "#10b981" },
      { name: "Pending", value: metrics.pendingOrders, color: "#f59e0b" },
    ];
  }, [metrics]);

  // Recent orders
  const recentOrders = useMemo(() => {
    if (!orders) return [];

    return orders
      .filter((order) => order !== undefined)
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5);
  }, [orders]);

  // TODO: Top products (mock data for now since we don't have sales data per product)
  const topProducts = useMemo(() => {
    if (!products) return [];

    return products
      .filter((product) => product !== undefined)
      .slice(0, 5)
      .map((product) => ({
        ...product,
        sales: 0,
        revenue: 0,
      }));
  }, [products]);

  if (!store || !metrics) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <AnimatedGroup preset="blur-slide" className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back to {store.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/${slug}/orders`}>
                <Eye className="size-4 mr-2" />
                View Orders
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/${slug}/products/add-product`}>
                <Plus className="size-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            description="All time revenue"
            icon={DollarSign}
            trend={metrics.lastMonthRevenue > 0 ? "up" : "neutral"}
            trendValue={`${formatCurrency(metrics.lastMonthRevenue)} this month`}
          />
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders.toString()}
            description={`${metrics.pendingOrders} pending`}
            icon={ShoppingCart}
            trend="up"
            trendValue={`${metrics.completedOrders} completed`}
          />
          <MetricCard
            title="Active Products"
            value={metrics.activeProducts.toString()}
            description={`${metrics.totalProducts} total products`}
            icon={Package}
            trend="neutral"
          />
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(metrics.averageOrderValue)}
            description="Per transaction"
            icon={TrendingUp}
            trend="up"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-7">
          {/* Sales Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Daily sales for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Chart */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Breakdown of order statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        #{order.slug.slice(-8)}
                      </TableCell>
                      <TableCell>
                        {order.firstName} {order.lastName}
                      </TableCell>
                      <TableCell>{formatCurrency(order.amount)}</TableCell>
                      <TableCell>
                        <Badge>{order.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {recentOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No orders yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best performing products</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.sales}</TableCell>
                      <TableCell>{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {topProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No products yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-4">
              <Button variant="outline" asChild className="justify-start">
                <Link href={`/dashboard/${slug}/products/add-product`}>
                  <Plus className="size-4 mr-2" />
                  Add Product
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href={`/dashboard/${slug}/orders`}>
                  <ShoppingCart className="size-4 mr-2" />
                  View Orders
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href={`/dashboard/${slug}/products`}>
                  <Package className="size-4 mr-2" />
                  Manage Products
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href={`/dashboard/${slug}/settings`}>
                  <AlertCircle className="size-4 mr-2" />
                  Store Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedGroup>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trendValue && (
          <div className="flex items-center mt-2">
            {trend === "up" && (
              <ArrowUpIcon className="h-3 w-3 text-green-600 mr-1" />
            )}
            {trend === "down" && (
              <ArrowDownIcon className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className="text-xs text-muted-foreground">{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
