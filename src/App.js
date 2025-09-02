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
  <Route path="/trades" element={<CategoryPage />} />
  <Route path="/freeAgency" element={<CategoryPage />} />
  <Route path="/draft" element={<CategoryPage />} />
  <Route path="/news" element={<CategoryPage />} />
  <Route path="/rumors" element={<CategoryPage />} /> 
  <Route path="/teams/:teamSlug" element={<TeamPage />} />
  <Route path="/:slug" element={<SinglePost />} />
  <Route path="*" element={<Error />} />  
</Routes>
   </BrowserRouter>
  );
}

export default App;