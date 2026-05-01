import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { MainLayout } from "./layouts/MainLayout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { InsightsPage } from "./pages/InsightsPage.jsx";
import { JournalPage } from "./pages/JournalPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { WritePage } from "./pages/WritePage.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/write" element={<WritePage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/insights" element={<InsightsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
