import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--nav-height)] bg-background border-b border-border flex items-center">
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-display font-bold text-xl uppercase tracking-tight">
          Styleflip
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `text-xs font-medium uppercase tracking-widest transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button asChild size="sm" className="uppercase tracking-wider text-xs font-bold">
            <a href="https://wa.me/+31620779900" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={14} className="mr-1.5" /> WhatsApp
            </a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute top-[var(--nav-height)] left-0 right-0 bg-background border-b border-border md:hidden">
          <nav className="container py-6 flex flex-col gap-4">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-medium uppercase tracking-widest py-1 transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Button asChild size="sm" className="uppercase tracking-wider text-xs font-bold w-fit mt-2">
              <a href="https://wa.me/+31620779900" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={14} className="mr-1.5" /> WhatsApp
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
