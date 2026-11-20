import type { ReactNode } from "react";

type ButtonProps = {
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  children: ReactNode;
};

export function Button({
  className,
  type = "button",
  disabled = false,
  onClick,
  href,
  children,
}: ButtonProps) {
  if (href) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
