// import React, { PropsWithChildren, useState } from "react"

// interface CustomVerticalTabsChildProps extends PropsWithChildren {
//     title: string,
//     level?: 0 | 1 | 2,
// }

// interface CustomVerticalTabsProps extends PropsWithChildren {
//     onClick: () => void
// }

// export const CustomVerticalTabsChild: React.FC<CustomVerticalTabsChildProps> = ({children}) => {
//     return (
//         <>
//             {children}
//         </>
//     )
// }

// export const CustomVerticalTabs: React.FC<CustomVerticalTabsProps> = ({children, onClick}) => {
//     const [activeIndex, setActiveIndex] = useState<number>(0)
//     const childArray = React.Children.toArray(children)
//     const levels = [
//         'pl-0',
//         'pl-2',
//         'pl-4'
//     ]

//     return (
//         <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-800">
//             <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
//                 {/* Sidebar Navigation */}
//                 <div className="overflow-x-auto pb-2 sm:w-[200px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-100 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-white dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
//                     <nav className="flex flex-row w-full sm:flex-col sm:space-y-2">
//                         {
//                             childArray.map((child, index) => {
//                                 return (
//                                     <div className={`w-full block ${levels[child.props.level]}`} key={`vertical-tab-${index}`}>
//                                         <button
//                                             className={`inline-flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out sm:p-3 ${
//                                                 activeIndex == index
//                                                 ? "text-brand-500 dark:bg-brand-400/20 dark:text-brand-400 bg-brand-50"
//                                                 : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//                                             }`}
//                                             onClick={() => {
//                                                 setActiveIndex(index)
//                                                 onClick()
//                                             }}
//                                             >
//                                             {child.props.title}
//                                         </button>
//                                     </div>
//                                 )
//                             })
//                         }
//                     </nav>
//                 </div>

//                 {/* Tab Content */}
//                 <div className="flex-1">
//                     {childArray[activeIndex]}
//                 </div>
//             </div>
//         </div>
//     )
// }


import React, { PropsWithChildren, useState, ReactElement } from "react"

interface CustomVerticalTabsChildProps extends PropsWithChildren {
    title: string
    level?: 0 | 1 | 2
}

interface CustomVerticalTabsProps {
    onClick: () => void
    children?: any
}

export const CustomVerticalTabsChild: React.FC<CustomVerticalTabsChildProps> = ({ children }) => {
    return <>{children}</>
}

export const CustomVerticalTabs: React.FC<CustomVerticalTabsProps> = ({ children, onClick }) => {
    const [activeIndex, setActiveIndex] = useState<number>(0)

    const levels = ["pl-0", "pl-2", "pl-4"]

    const childArray = React.Children.toArray(children).filter(
        (child): child is ReactElement<CustomVerticalTabsChildProps> =>
            React.isValidElement(child)
    )
    return (
        <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-800">
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                <div className="overflow-x-auto pb-2 sm:w-[200px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-100 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-white dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
                    <nav className="flex flex-row w-full sm:flex-col sm:space-y-2">
                        {childArray.map((child, index) => (
                            <div
                                className={`w-full block ${levels[child.props.level ?? 0]}`}
                                key={`vertical-tab-${index}`}
                            >
                                <button
                                    className={`inline-flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out sm:p-3 ${
                                        activeIndex === index
                                            ? "text-brand-500 dark:bg-brand-400/20 dark:text-brand-400 bg-brand-50"
                                            : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    }`}
                                    onClick={() => {
                                        setActiveIndex(index)
                                        onClick()
                                    }}
                                >
                                    {child.props.title}
                                </button>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="flex-1">{childArray[activeIndex]}</div>
            </div>
        </div>
    )
}
