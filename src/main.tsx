import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <SocketProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </SocketProvider>
  </BrowserRouter>
);
