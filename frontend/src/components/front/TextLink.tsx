import React from "react";
import { Link } from "react-router";

type TextLinkProps = {
  text?: string;
  link?: string;
  color?: "black" | "gray" | "white";
  uppercase?: boolean;
};

const TextLink: React.FC<TextLinkProps> = ({
  text = "Read More",
  link = null,
  color = "black",
  uppercase = false,
}) => {
  const colorClass = () => {
    if (color == "black") {
      return "text-front-black decoration-front-charcoal-grey";
    }
    if (color == "gray") {
      return "text-front-soft-gray decoration-front-soft-gray";
    }
    if (color == "white") {
      return "text-white decoration-white";
    }
  };

  const renderText = (
    <p
      className={`inline-block 
                  text-front-small transition hover:text-front-charcoal-grey hover:decoration-front-charcoal-grey decoration-solid ${colorClass()} ${uppercase ? " uppercase" : "capitalize"}`}
    >
      {text}
    </p>
  );

  if (link) {
    return <Link to={link}>{renderText}</Link>;
  }
  return renderText;
};

export default TextLink;
