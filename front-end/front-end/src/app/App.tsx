import { BrowserRouter } from "react-router-dom";
import QueryProvider from "./providers/QueryProvider";
import { AuthProvider } from "./providers/AuthProvider";
import AppRoutes from "./AppRoutes";
import ThemeProvider from "./providers/ThemeProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>
              <AppRoutes />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      <ToastContainer position="top-right" />
    </>
  );
}
