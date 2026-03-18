import { useState } from "react";
import { MessageCircle, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app this would POST to an API
    setSubmitted(true);
  };

  return (
    <div className="pt-[var(--nav-height)]">
      {/* Page header */}
      <div className="border-b border-border py-10">
        <div className="container">
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">Contact</h1>
          <p className="text-muted-foreground mt-2 text-sm">We're here to help. Reach out any time.</p>
        </div>
      </div>

      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: info */}
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-6">
              Get in touch
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 border border-border rounded-sm flex items-center justify-center shrink-0">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">WhatsApp</p>
                  <p className="text-muted-foreground text-sm mb-2">
                    Fastest way to reach us. Send us a message and we'll respond ASAP.
                  </p>
                  <a
                    href="https://wa.me/+31620779900"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
                  >
                    +31 6 20 77 99 00
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 border border-border rounded-sm flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Email</p>
                  <p className="text-muted-foreground text-sm mb-2">
                    Use the contact form or email us directly.
                  </p>
                  <a
                    href="mailto:hello@styleflip.com"
                    className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
                  >
                    hello@styleflip.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 border border-border rounded-sm flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Response time</p>
                  <p className="text-muted-foreground text-sm">
                    We typically respond within a few hours on business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-muted rounded-sm">
              <p className="text-xs font-bold uppercase tracking-widest mb-2">Can't find a product?</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We can source almost any sportswear or fashion item on request.
                Send us a WhatsApp with what you're looking for and we'll find it.
              </p>
              <Button asChild size="sm" className="mt-4 uppercase tracking-wider text-xs font-bold">
                <a href="https://wa.me/+31620779900" target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={13} className="mr-1.5" /> Request via WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* Right: form */}
          <div>
            {submitted ? (
              <div className="border border-border rounded-sm p-10 text-center">
                <div className="w-12 h-12 bg-foreground text-primary-foreground rounded-sm flex items-center justify-center mx-auto mb-4">
                  <Mail size={22} />
                </div>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-2">Message sent!</h3>
                <p className="text-muted-foreground text-sm">
                  Thanks for reaching out. We'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2">Name</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-3 text-sm border border-border rounded-sm bg-background focus:outline-none focus:border-foreground/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 text-sm border border-border rounded-sm bg-background focus:outline-none focus:border-foreground/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="What can we help you with?"
                    className="w-full px-4 py-3 text-sm border border-border rounded-sm bg-background focus:outline-none focus:border-foreground/40 resize-none"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full uppercase tracking-wider text-xs font-bold">
                  Send message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
