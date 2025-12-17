import api from "./axiosConfig";

export const productsAPI = {
  getAll: () => api.get("/products"),
  getOne: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post("/products", data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  remove: (id: number) => api.delete(`/products/${id}`),
  uploadCSV: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/products/upload-csv/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
