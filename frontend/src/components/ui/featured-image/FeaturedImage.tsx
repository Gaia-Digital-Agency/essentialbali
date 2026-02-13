// import React, { useEffect, useRef } from "react";
// import { Modal } from "../modal";
// import Media from "../../media/Media";
// import { useModal } from "../../../hooks/useModal";
// import { AssetMedia } from "../../../types/media.type";
// import Badge from "../badge/Badge";

// type FeaturedImageProps = {
//   url: string;
//   alt?: string;
//   ratio?: string;
//   onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
//   width?: string;
// };

// const FeaturedImage: React.FC<FeaturedImageProps> = ({
//   url,
//   alt = "",
//   ratio = "78%",
// }) => {
//   return (
//     <>
//       <div
//         className="image-wrapper relative border-2 border-gray-400"
//         style={{ paddingTop: ratio }}
//       >
//         {/* jika url ada, maka tag img bg-gray-200 */}
//         {url !== "#" ? (
//           <img
//             src={url}
//             alt={alt}
//             className="absolute inset-0 h-full w-full object-cover p-1 bg-gray-200"
//           />
//         ) : (
//           <div className="absolute inset-0 h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
//             No Image
//           </div>
//         )}
//         {/* <img
//           src={url}
//           alt={alt}
//           className="absolute inset-0 h-full w-full object-cover p-1 "
//         /> */}
//       </div>
//     </>
//   );
// };

// export const AdminFeaturedImage: React.FC<
//   FeaturedImageProps & { onSave: (file: AssetMedia) => void }
// > = ({ url, alt, onSave, ratio, width = "100%" }) => {
//   const { isOpen, closeModal, openModal } = useModal(false);

//   const parentHoverRef = useRef<HTMLDivElement | null>(null);
//   useEffect(() => {
//     if (!parentHoverRef.current) return;
//     const enterHandler = () => {
//       parentHoverRef.current
//         ?.querySelector(".hover-items")
//         ?.classList.add("active");
//     };
//     const leaveHandler = () => {
//       parentHoverRef.current
//         ?.querySelector(".hover-items")
//         ?.classList.remove("active");
//     };

//     const clickHandler = openModal;

//     parentHoverRef.current.addEventListener("mouseenter", enterHandler);
//     parentHoverRef.current.addEventListener("mouseleave", leaveHandler);
//     parentHoverRef.current.addEventListener("click", clickHandler);
//     return () => {
//       parentHoverRef.current?.removeEventListener("mouseleave", clickHandler);
//       parentHoverRef.current?.removeEventListener("mouseenter", enterHandler);
//       parentHoverRef.current?.removeEventListener("mouseleave", leaveHandler);
//     };
//   }, []);

//   const saveHandler = (file: AssetMedia) => {
//     closeModal();
//     onSave(file);
//   };

//   const opacityStyles = {
//     "--tw-bg-opacity": 0.4,
//   } as React.CSSProperties;

//   return (
//     <>
//       <div
//         ref={parentHoverRef}
//         className="relative hoverable"
//         style={{ width }}
//       >
//         <div className="hover-items absolute inset-0 z-10">
//           <div className="overlay bg-black" style={opacityStyles}></div>
//           <div className="items flex w-full h-full items-center justify-center">
//             <Badge size="md">Edit</Badge>
//           </div>
//         </div>
//         <FeaturedImage
//           url={url}
//           alt={alt}
//           ratio={ratio ?? "78%"}
//           width={width}
//         />
//       </div>
//       <Modal className="mx-32 p-5 lg:p-10" isOpen={isOpen} onClose={closeModal}>
//         <Media onSave={saveHandler}></Media>
//       </Modal>
//     </>
//   );
// };

// export default FeaturedImage;



import React from "react";
import { Modal } from "../modal";
import Media from "../../media/Media";
import { useModal } from "../../../hooks/useModal";
import { AssetMedia } from "../../../types/media.type";
import Badge from "../badge/Badge";
import { ImageIcon } from "lucide-react";
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL

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

export const AdminFeaturedImage: React.FC<
  FeaturedImageProps & { onSave: (file: AssetMedia) => void }
> = ({ url, alt, onSave, ratio, width = "100%" }) => {
  const { isOpen, closeModal, openModal } = useModal(false);

  const saveHandler = (file: AssetMedia) => {
    closeModal();
    onSave(file);
  };

  return (
    <>
      <div
        className="relative group cursor-pointer"
        style={{ width }}
        onClick={openModal}
      >
        <FeaturedImage url={String(url).startsWith(API_URL) ? url : API_URL + "/" + url} alt={alt} ratio={ratio} width={width} />

        {/* Hover Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] rounded-2xl">
          <Badge
            size="md"
          >
            Edit
          </Badge>
        </div>
      </div>

      {/* Modal */}
      <Modal
        className="mx-8 lg:mx-32 p-6 lg:p-10"
        isOpen={isOpen}
        onClose={closeModal}
      >
        <Media onSave={saveHandler} />
      </Modal>
    </>
  );
};

export default FeaturedImage;
