import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Header from "./components/Header"
import Blog from "./pages/Blog"
import SinglePost from "./pages/SinglePost"
import TeamPage from "./pages/TeamPage"
import Error from "./pages/Error"
import CategoryPage from './pages/CategoryPage'


function App() {
  return (
   <BrowserRouter>
    <Header />
    <Routes>
  <Route path="/" element={<Blog />} />
  <Route path="/news" element={<CategoryPage />} />
  <Route path="/rumors" element={<CategoryPage />} />
  <Route path="/analysis" element={<CategoryPage />} />
  <Route path="/gamerecaps" element={<CategoryPage />} />
  <Route path="/suns" element={<TeamPage />} />
  <Route path="/diamondbacks" element={<TeamPage />} />
  <Route path="/cardinals" element={<TeamPage />} />
  <Route path="/mercury" element={<TeamPage />} />
  <Route path="/wildcats" element={<TeamPage />} />
  <Route path="/sundevils" element={<TeamPage />} />
  <Route path="/teams/:teamSlug" element={<TeamPage />} />
  <Route path="/:slug" element={<SinglePost />} />
  <Route path="*" element={<Error />} />
</Routes>
   </BrowserRouter>
  );
}

export default App;