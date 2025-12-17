import api from "./axiosConfig";

export const dashboardAPI = {
  getSalesAnalytics: () => api.get("/dashboard/sales-analytics"),
  getSalesOverTime: () => api.get("/dashboard/sales-over-time"),
  getTopSellingProducts: () => api.get("/dashboard/top-selling-products"),
  getLowStock: () => api.get("/dashboard/low-stock-alert"),
  getExpiryAlert: () => api.get("/dashboard/expiry-alert"),
};
