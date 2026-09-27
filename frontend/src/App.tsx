import { Routes, Route } from "react-router-dom";
import { ROUTE_PATTERNS } from "./routes/path";
import CatalogPage from "./pages/CatalogPage/CatalogPage";
import MoviePage from "./pages/MoviePage/MoviePage";

function App() {
  return (
    <Routes>
      <Route path={ROUTE_PATTERNS.catalog} element={<CatalogPage />} />
      <Route path={ROUTE_PATTERNS.movieDetails} element={<MoviePage />} />
    </Routes>
  );
}

export default App;