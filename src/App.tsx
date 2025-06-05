
import { AppProviders } from "@/providers/AppProviders";
import { AppRoutes } from "@/router/routes";

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
