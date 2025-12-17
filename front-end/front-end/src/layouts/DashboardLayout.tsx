import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import SellIcon from "@mui/icons-material/Sell";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const drawerWidth = 240;

export default function DashboardLayout() {
  const location = useLocation();

  const menu = [
    { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
    { text: "Products", path: "/products", icon: <InventoryIcon /> },
    { text: "Sales", path: "/sales", icon: <SellIcon /> },
    { text: "Assistant", path: "/assistant", icon: <SmartToyIcon /> },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            borderRight: "none",
            background: "#ffffff",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6">Retail App</Typography>
        </Toolbar>

        <List>
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  background: active ? "#e2e8f0" : "transparent",
                }}
              >
                <ListItemIcon sx={{ color: active ? "#2563eb" : "gray" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ color: active ? "#2563eb" : "black" }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, ml: `${drawerWidth}px` }}>
        <AppBar
          position="fixed"
          sx={{
            ml: `${drawerWidth}px`,
            background: "#2563eb",
            boxShadow: "none",
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Retail App Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
