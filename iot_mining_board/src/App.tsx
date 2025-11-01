import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./components/Router";
import { NotificationsProvider } from "./Context/NotificationsContext";
import { AlertRulesProvider } from "./components/context/AlertRulesContext";

function App() {
  return (
    <div className="h-full bg-black">
      {/* Providers anidados - el orden importa para dependencias */}
      <AlertRulesProvider 
        enablePersistence={true}  // Cambiar a true si quieres persistencia en localStorage
        storageKey="mining_alert_rules_v1"
      >
        <NotificationsProvider>
          <BrowserRouter>
            <AppRouter /> {/* Renderiza el router principal */}
          </BrowserRouter>
        </NotificationsProvider>
      </AlertRulesProvider>
    </div>
  );
}

export default App;