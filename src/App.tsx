import { AppProviders } from "@/providers/AppProviders";
import { AppContent } from "./AppContent";

const App = () => (
  <AppProviders>
    <AppContent />
  </AppProviders>
);

export default App;