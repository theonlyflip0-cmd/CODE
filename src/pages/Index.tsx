import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Shield, Truck, Heart, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { products, filterChips } from "@/data/products";
import categoryMen from "@/assets/category-men.jpg";
import categoryWomen from "@/assets/category-women.jpg";

const trustItems = [
  { icon: Check, label: "Authentic items only" },
  { icon: Truck, label: "Worldwide shipping" },
  { icon: Heart, label: "Charity with every order" },
  { icon: MessageCircle, label: "WhatsApp support" },
];

const Index = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const filtered =
    activeFilter === "All"
      ? products
      : activeFilter === "Sale"
      ? products.filter((p) => p.onSale)
      : products.filter((p) => p.tags.includes(activeFilter));

  return (
    <div>
      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center pt-[var(--nav-height)] pb-12">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight leading-[0.9] mb-6">
              Your personal<br />style curator.
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-8 font-body">
              100% authentic sportswear & fashion, shipped worldwide.
              A portion of every purchase goes to charity.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button asChild size="lg" className="uppercase tracking-wider text-xs font-bold px-8">
                <Link to="/shop">Shop now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="uppercase tracking-wider text-xs font-bold px-8">
                <a href="#mission">How it works</a>
              </Button>
            </div>
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
            <Link to="/shop?category=men" className="group relative aspect-[3/4] overflow-hidden rounded-sm">
              <img src={categoryMen} alt="Shop Men" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-foreground/30 flex items-end p-6">
                <span className="font-display text-2xl font-bold uppercase text-primary-foreground tracking-wide">Men</span>
              </div>
            </Link>
            <Link to="/shop?category=women" className="group relative aspect-[3/4] overflow-hidden rounded-sm">
              <img src={categoryWomen} alt="Shop Women" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-foreground/30 flex items-end p-6">
                <span className="font-display text-2xl font-bold uppercase text-primary-foreground tracking-wide">Women</span>
              </div>
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <item.icon size={16} className="text-accent" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-8">Bestsellers</h2>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveFilter(chip)}
                className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-sm border transition-colors ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg" className="uppercase tracking-wider text-xs font-bold px-10">
              <Link to="/shop">
                View all products <ArrowRight size={14} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-20 bg-foreground text-primary-foreground">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left */}
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest bg-accent text-accent-foreground px-3 py-1 rounded-sm mb-6">
                Footprints of Change
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight leading-[0.95] mb-6">
                Fashion with a purpose. Every purchase matters.
              </h2>
              <p className="opacity-70 leading-relaxed mb-8 max-w-md">
                We believe fashion can change lives. That's why we donate a portion of every sale to
                charity — because looking good should feel good too.
              </p>
              <div className="flex gap-4 mb-8">
                <div className="border border-primary-foreground/20 rounded-sm p-5 flex-1">
                  <Shield size={24} className="text-accent mb-2" />
                  <p className="font-display text-lg font-bold uppercase">100%</p>
                  <p className="text-xs opacity-60">Authentic</p>
                </div>
                <div className="border border-primary-foreground/20 rounded-sm p-5 flex-1">
                  <Heart size={24} className="text-accent mb-2" />
                  <p className="font-display text-lg font-bold uppercase">Charity</p>
                  <p className="text-xs opacity-60">Per order</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="uppercase tracking-wider text-xs font-bold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
              >
                Learn more
              </Button>
            </div>

            {/* Right – WhatsApp CTA */}
            <div className="flex flex-col justify-center">
              <div className="border border-primary-foreground/20 rounded-sm p-8 lg:p-10">
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-3">
                  Can't find it?
                </h3>
                <p className="font-display text-xl font-bold uppercase tracking-tight mb-4 opacity-70">
                  Request any item via WhatsApp
                </p>
                <p className="opacity-60 text-sm mb-6 leading-relaxed">
                  We can source almost anything on request. Send us a message and we'll find it for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-primary-foreground uppercase tracking-wider text-xs font-bold"
                  >
                    <a href="https://wa.me/+31620779900" target="_blank" rel="noopener noreferrer">
                      <MessageCircle size={16} className="mr-2" /> WhatsApp us
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="uppercase tracking-wider text-xs font-bold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
                  >
                    <Link to="/contact">Contact form</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
