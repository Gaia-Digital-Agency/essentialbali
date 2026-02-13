// import React, { PropsWithChildren, useState } from "react";

// // interface TabContentProps {
// //   id: string;
// //   title: string;
// //   isActive: boolean;
// // }

// interface CustomTabWithUnderlineChildProps extends PropsWithChildren {
//   title: string
// }

// export const CustomTabWithUnderlineChild: React.FC<CustomTabWithUnderlineChildProps> = ({children}) => {

//   return (
//     <>
//       {children}
//     </>
//   )
// }

// export const CustomTabWithUnderline: React.FC<PropsWithChildren> = ({children}) => {
//   const [activeIndex, setActiveIndex] = useState<number>(0)
//   const childArray = React.Children.toArray(children)

//   return (
//     <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-800">
//       <div className="border-b border-gray-200 dark:border-gray-800">
//         <nav className="-mb-px flex space-x-2 overflow-x-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
//             {
//               childArray.map((child, index) => {

//                 return (
//                   <button
//                     className={`inline-flex items-center border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
//                         activeIndex === index
//                         ? "text-brand-500 dark:text-brand-400 border-brand-500 dark:border-brand-400"
//                         : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//                     }`}
//                     onClick={() => {setActiveIndex(index)}}
//                     key={`tab-underline-${index}`}
//                     >
//                     {child.props.title}
//                 </button>
//                 )
//               })
//             }
//         </nav>
//       </div>

//       <div className="pt-4 dark:border-gray-800">

//         <div>
//           {/* <h3 className="mb-1 text-xl font-medium text-gray-800 dark:text-white/90">
//             {childArray[activeIndex].props.title}
//           </h3> */}
//           {childArray[activeIndex]}
//         </div>

//       </div>
//     </div>
//   );
// };

// // export default TabWithUnderline;



import React, { PropsWithChildren, useState, ReactElement } from "react"

interface CustomTabWithUnderlineChildProps extends PropsWithChildren {
    title: string
}

export const CustomTabWithUnderlineChild: React.FC<CustomTabWithUnderlineChildProps> = ({
    children,
}) => {
    return <>{children}</>
}

export const CustomTabWithUnderline: React.FC<PropsWithChildren> = ({ children }) => {
    const [activeIndex, setActiveIndex] = useState<number>(0)

    const childArray = React.Children.toArray(children).filter(
        (child): child is ReactElement<CustomTabWithUnderlineChildProps> =>
            React.isValidElement(child)
    )

    return (
        <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-2 overflow-x-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
                    {childArray.map((child, index) => (
                        <button
                            className={`inline-flex items-center border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                                activeIndex === index
                                    ? "text-brand-500 dark:text-brand-400 border-brand-500 dark:border-brand-400"
                                    : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                            onClick={() => setActiveIndex(index)}
                            key={`tab-underline-${index}`}
                        >
                            {child.props.title}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="pt-4 dark:border-gray-800">
                <div>{childArray[activeIndex]}</div>
            </div>
        </div>
    )
}
