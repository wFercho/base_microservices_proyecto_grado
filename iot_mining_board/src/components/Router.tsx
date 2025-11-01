import { Routes, Route, Navigate } from "react-router-dom";
import { Scene } from "./pages/Screen";
import { SensorPage } from "./pages/Sensor";
import { SensorNodesPage } from "./pages/SensorNodes";
import { Boards } from "./pages/Boards";
import { Config } from "./pages/Config";
import { MinesPage } from "./pages/Mines";
import { ProfilesPage } from "./pages/Profiles";
import { IotGatewaysPage } from "./pages/IoTGateways";
import { Home } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { ProtectedRoute } from "../components/ProtectedRoute";
import MineZonesList from "./Mine3D/MineZonesList";

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/home" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mines_3d"
        element={
          <ProtectedRoute>
            <MineZonesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sensores"
        element={
          <ProtectedRoute>
            <SensorPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/nodos_sensores"
        element={
          <ProtectedRoute>
            <SensorNodesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/perfiles"
        element={
          <ProtectedRoute>
            <ProfilesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/gateways"
        element={
          <ProtectedRoute>
            <IotGatewaysPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/minas"
        element={
          <ProtectedRoute>
            <MinesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tableros"
        element={
          <ProtectedRoute>
            <Boards />
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuracion"
        element={
          <ProtectedRoute>
            <Config />
          </ProtectedRoute>
        }
      />

      <Route path="/mine/:id/3d" element={<ProtectedRoute><Scene /></ProtectedRoute>} />


      {/* Ruta 404 */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};