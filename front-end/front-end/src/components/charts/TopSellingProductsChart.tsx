import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

type Props = {
  data: { name: string; total_sold: number }[];
};

const TopSellingProductsChart = ({ data }: Props) => {
  const categories = (data || []).map((d) => d.name);
  const seriesData = (data || []).map((d) => d.total_sold);

  const series = [
    {
      name: "Units Sold",
      data: seriesData,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "55%" },
    },
    xaxis: {
      categories,
      title: { text: "Product" },
    },
    yaxis: { title: { text: "Units Sold" } },
    dataLabels: { enabled: false },
    tooltip: { theme: "light" },
  };

  return <ReactApexChart options={options} series={series} type="bar" height={350} />;
};

export default TopSellingProductsChart;
