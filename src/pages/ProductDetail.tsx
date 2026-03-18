import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Shield, Truck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";

const trustItems = [
  { icon: Shield, label: "100% Authentic" },
  { icon: Truck, label: "Worldwide shipping" },
  { icon: Heart, label: "Charity with every order" },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="pt-[var(--nav-height)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-3">Product not found</h2>
          <p className="text-muted-foreground text-sm mb-6">The product you're looking for doesn't exist.</p>
          <Button asChild variant="outline" className="uppercase tracking-wider text-xs font-bold">
            <Link to="/shop">Back to shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { name, brand, price, salePrice, onSale, image, category, tags } = product;
  const displayPrice = onSale && salePrice ? salePrice : price;
  const waMessage = encodeURIComponent(`Hi! I'm interested in the ${name} (€${displayPrice}). Can you help me order it?`);

  return (
    <div className="pt-[var(--nav-height)]">
      <div className="container py-10">
        {/* Breadcrumb */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider mb-8"
        >
          <ArrowLeft size={13} /> Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <div className="aspect-square bg-muted rounded-sm overflow-hidden">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No image available
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{brand}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight leading-tight mb-4">
              {name}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-xs border border-border px-2.5 py-1 rounded-sm uppercase tracking-wider text-muted-foreground">
                {category}
              </span>
              {tags.filter((t) => t !== "Sale").map((tag) => (
                <span key={tag} className="text-xs border border-border px-2.5 py-1 rounded-sm uppercase tracking-wider text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-display text-4xl font-bold">€{displayPrice.toLocaleString("nl-NL")}</span>
              {onSale && salePrice && (
                <>
                  <span className="text-muted-foreground line-through text-xl">€{price.toLocaleString("nl-NL")}</span>
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-sm font-bold uppercase tracking-wider">
                    Sale
                  </span>
                </>
              )}
            </div>

            {/* Order via WhatsApp */}
            <div className="border border-border rounded-sm p-6 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-2">How to order</p>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                We process orders via WhatsApp. Click the button below to message us with your interest in this item.
              </p>
              <Button
                asChild
                size="lg"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white uppercase tracking-wider text-xs font-bold"
              >
                <a
                  href={`https://wa.me/+31620779900?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={16} className="mr-2" /> Order via WhatsApp
                </a>
              </Button>
            </div>

            {/* Trust items */}
            <div className="space-y-3">
              {trustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon size={15} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
