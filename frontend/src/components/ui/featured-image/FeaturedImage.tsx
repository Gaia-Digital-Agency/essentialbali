import React from "react";
import { ImageIcon } from "lucide-react";

type FeaturedImageProps = {
  url: string;
  alt?: string;
  ratio?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  width?: string;
};

const FeaturedImage: React.FC<FeaturedImageProps> = ({
  url,
  alt = "",
  ratio = "16/9",
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-gray-50 group"
      style={{ aspectRatio: ratio }}
    >
      {url && url !== "#" ? (
        <img
          src={url}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
          <div className="p-3 rounded-full bg-gray-200">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
          <span className="text-sm font-medium">No Image</span>
        </div>
      )}
    </div>
  );
};

export default FeaturedImage;
