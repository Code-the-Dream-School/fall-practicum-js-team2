import type { ReactNode } from "react";
import "./Button.css";

type ButtonProps = {
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  children: ReactNode;
  variant?: "primary";
};

export function Button({
  className,
  type = "button",
  disabled = false,
  onClick,
  href,
  children,
  variant,
}: ButtonProps) {
  const classes = [variant ? `button button-${variant}` : null, className]
    .filter(Boolean)
    .join(" ");
  if (href) {
    return (
      <a className={classes} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
