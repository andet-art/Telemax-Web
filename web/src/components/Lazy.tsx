import React, { useEffect, useRef, useState } from "react";

type LazyProps = {
  children: React.ReactNode;
  rootMargin?: string;
  once?: boolean;
  placeholder?: React.ReactNode;
};

export default function Lazy({
  children,
  rootMargin = "200px",
  once = true,
  placeholder = null,
}: LazyProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return <div ref={ref}>{visible ? children : placeholder}</div>;
}