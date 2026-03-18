import { Link } from "react-router-dom";
import { MessageCircle, Heart } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="container py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
      {/* Brand */}
      <div>
        <p className="font-display font-bold text-lg uppercase tracking-tight mb-3">Styleflip</p>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
          Your personal style curator. 100% authentic sportswear & fashion, shipped worldwide.
        </p>
      </div>

      {/* Links */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-4">Navigate</p>
        <ul className="space-y-2">
          {[{ to: "/", label: "Home" }, { to: "/shop", label: "Shop" }, { to: "/contact", label: "Contact" }].map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-4">Get in touch</p>
        <a
          href="https://wa.me/+31620779900"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle size={14} /> WhatsApp us
        </a>
      </div>
    </div>

    <div className="border-t border-border">
      <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Styleflip. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart size={11} className="text-accent" /> — a portion of every sale goes to charity.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
