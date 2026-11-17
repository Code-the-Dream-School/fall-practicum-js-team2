import { Link } from "react-router-dom";
import "./ButtonLink.css";

type ButtonLinkProps = {
  text: string;
  variant: "primary" | "secondary";
  path: string;
};

export function ButtonLink({ text, variant, path }: ButtonLinkProps) {
  return (
    <Link to={path} className={`button-link button-link-${variant}`}>
      {text}
    </Link>
  );
}
