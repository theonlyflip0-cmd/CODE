import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products, filterChips } from "@/data/products";

const categories = ["All", "Clothes", "Shoes", "Accessories"];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") === "women" ? "All" : "All";

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialCategory);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState("default");

  const filtered = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Tag/brand filter
    if (activeFilter !== "All") {
      if (activeFilter === "Sale") {
        result = result.filter((p) => p.onSale);
      } else {
        result = result.filter((p) => p.tags.includes(activeFilter));
      }
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "price-asc") result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    if (sortBy === "price-desc") result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    if (sortBy === "sale") result.sort((a, b) => (b.onSale ? 1 : 0) - (a.onSale ? 1 : 0));

    return result;
  }, [activeFilter, activeCategory, search, sortBy]);

  return (
    <div className="pt-[var(--nav-height)]">
      {/* Page header */}
      <div className="border-b border-border py-10">
        <div className="container">
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">Shop</h1>
          <p className="text-muted-foreground mt-2 text-sm">{filtered.length} products</p>
        </div>
      </div>

      <div className="container py-10">
        {/* Search + Sort row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-sm bg-background focus:outline-none focus:border-foreground/40"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 text-sm border border-border rounded-sm bg-background focus:outline-none focus:border-foreground/40 cursor-pointer"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="sale">Sale items first</option>
          </select>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-sm border transition-colors ${
                activeCategory === cat
                  ? "bg-foreground text-primary-foreground border-foreground"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Brand/tag chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-sm border transition-colors ${
                activeFilter === chip
                  ? "bg-foreground text-primary-foreground border-foreground"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">No products found</p>
            <p className="text-sm">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
