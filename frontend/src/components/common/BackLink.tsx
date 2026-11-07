import { Link } from "react-router-dom";
import "./BackLink.css";
import { CaretLeftIcon } from "@phosphor-icons/react";

type BackLinkProps = {
  pathDestination: string;
  pathName: string;
};

export function BackLink({ pathDestination, pathName }: BackLinkProps) {
  return (
    <Link to={{ pathname: pathDestination }} className="backlink-section">
      <CaretLeftIcon size={16} weight="bold" aria-hidden="true" />
      {pathName}
    </Link>
  );
}
