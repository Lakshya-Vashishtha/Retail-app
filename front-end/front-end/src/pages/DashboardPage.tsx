import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "../api/dashboard";
import { Grid } from "@mui/material";
import KpiCard from "../components/common/KpiCard";
import SalesOverTimeChart from "../components/charts/SalesOverTimeChart";
import TopSellingProductsChart from "../components/charts/TopSellingProductsChart";
import LowStockList from "../components/common/LowStockList";
import ExpiryAlertList from "../components/common/ExpiryAlertList";

export default function DashboardPage() {
  const salesAnalytics = useQuery({
  queryKey: ["sales-analytics"],
  queryFn: dashboardAPI.getSalesAnalytics,
});

const salesOverTime = useQuery({
  queryKey: ["sales-over-time"],
  queryFn: dashboardAPI.getSalesOverTime,
});

const topSelling = useQuery({
  queryKey: ["top-selling"],
  queryFn: dashboardAPI.getTopSellingProducts,
});

const lowStock = useQuery({
  queryKey: ["low-stock"],
  queryFn: dashboardAPI.getLowStock,
});

const expiryAlert = useQuery({
  queryKey: ["expiry"],
  queryFn: dashboardAPI.getExpiryAlert,
});


  if (
    salesAnalytics.isLoading ||
    salesOverTime.isLoading ||
    topSelling.isLoading ||
    lowStock.isLoading ||
    expiryAlert.isLoading
  ) return <div>Loading dashboard...</div>;

  const data = salesAnalytics.data?.data;

  return (
    <Grid container spacing={3}>
      {/* KPI Cards */}
      <Grid item xs={12} md={3}>
        <KpiCard title="Total Sales Value" value={data?.total_sales_value ?? "-"} />
      </Grid>

      <Grid item xs={12} md={3}>
        <KpiCard title="Total Products Sold" value={data?.total_products_sold ?? "-"} />
      </Grid>

      <Grid item xs={12} md={3}>
        <KpiCard title="Average Order Value" value={data?.average_order_value ?? "-"} />
      </Grid>

      <Grid item xs={12} md={3}>
        <KpiCard title="Sales Today" value={data?.sales_today ?? "-"} />
      </Grid>

      {/* Sales Over Time */}
      <Grid item xs={12}>
        <SalesOverTimeChart data={salesOverTime.data?.data || []} />
      </Grid>

      {/* Top Products Chart */}
      <Grid item xs={12}>
        <TopSellingProductsChart data={topSelling.data?.data || []} />
      </Grid>

      {/* Alerts */}
      <Grid item xs={12} md={6}>
        <LowStockList items={lowStock.data?.data || []} />
      </Grid>

      <Grid item xs={12} md={6}>
        <ExpiryAlertList items={expiryAlert.data?.data || []} />
      </Grid>
    </Grid>
  );
}
