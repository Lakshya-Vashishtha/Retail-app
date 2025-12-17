import api from "./axiosConfig";

export const salesAPI = {
  getAll: () => api.get("/sales"),
  create: (data: any) => api.post("/sales", data),
  update: (id: number, data: any) => api.put(`/sales/${id}`, data),
  remove: (id: number) => api.delete(`/sales/${id}`),
};
