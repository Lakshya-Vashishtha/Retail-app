import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

export default function SalesOverTimeChart({ data }: { data: any[] }) {
  const formatted = (data || []).map((item: any) => ({
    x: item.sale_date,
    y: item.total_sales,
  }));

  const series = [
    {
      name: "Total Sales",
      data: formatted,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 300,
      toolbar: { show: false },
    },
    xaxis: {
      type: "category",
      labels: { rotate: -45 },
    },
    yaxis: {
      labels: { formatter: (val: number) => val.toFixed(0) },
    },
    stroke: { curve: "smooth", width: 2 },
    grid: { borderColor: "#e5e7eb" },
    tooltip: { theme: "light" },
  };

  return <ReactApexChart options={options} series={series} type="line" height={300} />;
} 
