import type { ComponentProps, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary";

const variants = {
  primary: "bg-brand-primary text-white hover:bg-brand-primary-hover",
  outlineLight:
    "border-2 border-white/90 bg-transparent text-white hover:bg-white hover:text-brand-dark",
  outlinePrimary:
    "border-2 border-brand-primary bg-transparent text-brand-primary hover:bg-brand-primary hover:text-white",
  ghost: "bg-white text-brand-dark hover:bg-brand-cream",
} as const;

type Variant = keyof typeof variants;

type Props = Omit<ComponentProps<"button">, "className"> & {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  href?: string;
};

export function Button({
  variant = "primary",
  className = "",
  children,
  href,
  type = "button",
  ...rest
}: Props) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
