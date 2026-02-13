// import React, {createContext, PropsWithChildren, useState, useRef, useEffect, useContext} from "react"
// import { useGSAP } from "@gsap/react"
// import { CloseIcon } from "../icons"

// type NotificationContextProps = {
//     setNotification: ({message, type}: NotificationProps) => void
// }

// type NotificationProps = {
//     type: "fail" | "neutral",
//     message: string,
//     isClosed?: boolean
// }

// const NotificationElement: React.FC<NotificationProps> = (notif) => {
//     const notifRef = useRef<HTMLDivElement>(null)

//     useEffect(() => {
//         const notifEl = notifRef.current
//         if(!notifEl) return
//         setTimeout(() => {
//             notifEl.style.display = 'none'
//         }, 7500)
//     }, [])

//     const {contextSafe} = useGSAP({scope: notifRef})

//     const onIconClick = contextSafe(() => {
//         const notifEl = notifRef.current
//         if(!notifEl) return
//         notifEl.style.display = 'none'
//     })

//     let _className = 'pl-10 pr-6 py-4 flex gap-x-4 items-center z-[200] relative '
//     if(notif.type == 'fail') {
//         _className += 'bg-front-red text-white'
//     }
//     if(notif.type == 'neutral') {
//         _className += 'bg-front-black text-white'
//     }

//     return (
//         <>
//             <div ref={notifRef} className={_className}>{notif.message} <CloseIcon className='cursor-pointer' onClick={onIconClick} /></div>
//         </>
//     )
// }

// const NotificationContext = createContext<NotificationContextProps>({
//     setNotification: () => {
//         return
//     }
// })

// export const NotificationProvider: React.FC<PropsWithChildren> = ({children}) => {
//     const [notification, setStateNotification] = useState<NotificationProps[]>([])

//     const setNotification = ({message, type} : NotificationProps) => {
//         setStateNotification(prev => ([...prev, {message: message, type: type, isClosed: false}]))
//     }
//     return (
//         <NotificationContext.Provider value={{setNotification}}>
//             {children}
//             {
//                 <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-999999">
//                     {notification.map((notif) => (
//                         <NotificationElement message={notif.message} type={notif.type} />
//                     ))}
//                 </div>
//             }
//         </NotificationContext.Provider>
//     )
// }

// export const useNotification = () => useContext( NotificationContext )



import React, {
    createContext,
    PropsWithChildren,
    useState,
    useContext,
    useEffect
} from "react"
import { CloseIcon } from "../icons"

type Notification = {
    id: number
    type: "fail" | "neutral"
    message: string,
    isClosed?: boolean
}

type NotificationContextProps = {
    setNotification: (n: Omit<Notification, "id">) => void
}

const NotificationContext = createContext<NotificationContextProps>({
    setNotification: () => {}
})


const NotificationElement: React.FC<Notification & { onClose: () => void }> = ({
    message,
    type,
    onClose
}) => {

    useEffect(() => {
        const timer = setTimeout(onClose, 5000)
        return () => clearTimeout(timer)
    }, [])

    const className =
        "pl-10 pr-6 py-4 flex gap-x-4 items-center relative rounded shadow-lg " +
        (type === "fail"
            ? "bg-front-red text-white"
            : "bg-front-black text-white")

    return (
        <div className={className}>
            {message}
            <CloseIcon className="cursor-pointer" onClick={onClose} />
        </div>
    )
}


export const NotificationProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [list, setList] = useState<Notification[]>([])

    const setNotification = ({ message, type }: Omit<Notification, "id">) => {
        setList(prev => [
            ...prev,
            {
                id: Date.now(),
                message,
                type
            }
        ])
    }

    const removeNotification = (id: number) => {
        setList(prev => prev.filter(n => n.id !== id))
    }

    return (
        <NotificationContext.Provider value={{ setNotification }}>
            {children}

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999999] flex flex-col gap-3">
                {list.map(notif => (
                    <NotificationElement
                        key={notif.id}
                        {...notif}
                        onClose={() => removeNotification(notif.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    )
}

export const useNotification = () => useContext(NotificationContext)
