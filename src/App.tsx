import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/shop" element={<div className="container py-20"><h1 className="text-3xl font-bold">Shop</h1></div>} />
        <Route path="/contact" element={<div className="container py-20"><h1 className="text-3xl font-bold">Contact</h1></div>} />
        <Route path="/product/:id" element={<div className="container py-20"><h1 className="text-3xl font-bold">Product</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
