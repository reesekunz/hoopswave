import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Header from "./components/Header"
import Blog from "./pages/Blog"
import SinglePost from "./pages/SinglePost"
import Error from "./pages/Error"

 
function App() {
  return (
   <BrowserRouter>
    <Header />
   <Routes>
   <Route path="/" element={<Blog />} />
   <Route path="/:slug" element={<SinglePost />} />
   {/* <Route path="/blog" element={<Blog />} /> */}
   <Route path="/*" element={<Error />} />

   </Routes>
   </BrowserRouter>
  );
}

export default App;
