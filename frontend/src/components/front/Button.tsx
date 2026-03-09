import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link } from "react-router";
import { ButtonChevron } from "../../icons";

type ButtonProps = {
  text: string;
  link?: string;
  bigger?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  borderOnly?: boolean;
  uppercase?: boolean;
  type?: string;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({
  text,
  link,
  bigger = false,
  onClick = () => {},
  uppercase = false,
  type = "primary",
  className = "",
  // borderOnly = false,
}) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const { contextSafe } = useGSAP({ scope: buttonRef });

  const mouseEnterHandler = contextSafe(() => {
    if (!buttonRef.current) return;
    const icon = buttonRef.current.querySelector(".icon");
    gsap.to(icon, {
      width: "auto",
      duration: 0.2,
    });
  });

  const mouseLeaveHandler = contextSafe(() => {
    if (!buttonRef.current) return;
    const icon = buttonRef.current.querySelector(".icon");
    gsap.to(icon, {
      width: "0px",
      duration: 0.2,
    });
  });

  const renderSVG = () => {
    // if(borderOnly) return <ButtonChevronBorder />
    return <ButtonChevron />;
  };

  const PrimaryButtonElement = () => {
    return (
      <div
        className={`button md:px-8 px-4 flex justify-center md:inline-flex text-front-body font-light cursor-pointer 
                            rounded-sm border !border-color-navy text-front-navy
                            hover:bg-front-navy hover:text-front-icewhite hover:border-front-navy
                            transition-all duration-300 ease-in-out
                            ${uppercase ? "uppercase " : ""}
                            ${bigger ? "py-4" : "py-3"} ${className}`}
        ref={buttonRef}
        onClick={onClick}
      >
        {text}
      </div>
    );
  };

  const PrimaryWhiteButtonElement = () => {
    return (
      <div
        className={`button md:px-8 px-4 flex justify-center md:inline-flex text-front-body font-light cursor-pointer 
                            rounded-sm border !border-color-icewhite text-front-icewhite
                            hover:bg-front-icewhite hover:text-front-navy hover:border-front-icewhite
                            transition-all duration-300 ease-in-out
                            ${uppercase ? "uppercase " : ""}
                            ${bigger ? "py-4" : "py-3"} ${className}`}
        ref={buttonRef}
        onClick={onClick}
      >
        {text}
      </div>
    );
  };

  const SecondaryButtonElement = () => {
    return (
      <div
        className={`button md:px-8 px-4 flex justify-center md:inline-flex text-front-body font-light cursor-pointer
                          rounded-[5px] border border-front-white text-front-icewhite
                          ${uppercase ? "uppercase " : ""}
                          ${bigger ? "py-4" : "py-3"} ${className}`}
        onMouseEnter={mouseEnterHandler}
        onMouseLeave={mouseLeaveHandler}
        ref={buttonRef}
        onClick={onClick}
      >
        {text}
        <div
          className="icon overflow-hidden"
          style={{ width: "0", color: "white" }}
        >
          <div className="inner pl-2">{renderSVG()}</div>
        </div>
      </div>
    );
  };

  let ComponentButton = SecondaryButtonElement;
  if (type === "primary") {
    ComponentButton = PrimaryButtonElement;
  } else if(type === "primary-white") {
    ComponentButton = PrimaryWhiteButtonElement
  }

  if (link) {
    return (
      <Link to={link}>
        <ComponentButton />
      </Link>
    );
  }
  return <ComponentButton />;
};

export default Button;
