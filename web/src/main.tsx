import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import { AuthProvider } from "./lib/auth";
import AppPage from "./pages/AppPage";
import Embed from "./pages/Embed";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { Privacy, Terms } from "./pages/Legal";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/embed" element={<Embed />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
