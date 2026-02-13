import React, {useContext, createContext, PropsWithChildren, useState} from "react"
import {Modal} from 'rsuite'

type PopupContextProps = {
    popupData: any
    setOpen: (state?: boolean) => void
}


interface PopupProviderProps extends PropsWithChildren {
    popupData: any,
}

const PopupContext = createContext<PopupContextProps>({popupData: {}, setOpen: () => {}})

export const ContentProvider: React.FC<PopupProviderProps> = ({children, popupData}) => {
    const [open, setStateOpen] = useState<boolean>(false)

    const setOpen = (state: boolean = false) => {
        setStateOpen(state)
    }
    const closeHandler = () => {
        setStateOpen(false)
    }
    return (
        <PopupContext.Provider value={{popupData, setOpen}}>
            <Modal open={open} onClose={closeHandler}>
                <Modal.Body>
                    <div className="content-wrapper" dangerouslySetInnerHTML={{__html: popupData}}></div>
                </Modal.Body>
            </Modal>
            {children}
        </PopupContext.Provider>
    )
}

export const usePopup = () => useContext(PopupContext)