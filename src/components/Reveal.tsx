import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fade + slide-up children on first intersection. `index` staggers the
 * transition-delay by 80 ms per step. Under prefers-reduced-motion it's a
 * no-op (see `.kd-reveal` in styles.css).
 */
export function Reveal({
  index = 0,
  children,
  className,
  as: Tag = "div",
}: {
  index?: number;
  children: ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties = { transitionDelay: `${index * 80}ms` };
  return (
    // @ts-expect-error — dynamic element tag: we intentionally forward `ref` and props.
    <Tag ref={ref} className={cn("kd-reveal", visible && "kd-reveal-in", className)} style={style}>
      {children}
    </Tag>
  );
}
