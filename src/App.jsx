// App.jsx

import { BrowserRouter } from "react-router-dom";
import AppRouter from "./Router";
import AppHeader from "./components/AppHeader";

export default function App() {
  return (
    <BrowserRouter>
      <AppHeader />
      <AppRouter />
    </BrowserRouter>
  );
}
