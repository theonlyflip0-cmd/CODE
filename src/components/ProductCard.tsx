import { Link } from "react-router-dom";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { id, name, brand, price, salePrice, onSale, image } = product;

  return (
    <Link
      to={`/product/${id}`}
      className="group block border border-border rounded-sm overflow-hidden hover:border-foreground/30 transition-colors"
    >
      {/* Image */}
      <div className="aspect-square bg-muted overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{brand}</p>
        <h3 className="font-medium text-sm leading-tight mb-2 line-clamp-2">{name}</h3>
        <div className="flex items-center gap-2">
          {onSale && salePrice ? (
            <>
              <span className="font-bold text-sm">€{salePrice}</span>
              <span className="text-muted-foreground line-through text-xs">€{price}</span>
              <span className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded-sm font-medium">
                Sale
              </span>
            </>
          ) : (
            <span className="font-bold text-sm">€{price.toLocaleString("nl-NL")}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
