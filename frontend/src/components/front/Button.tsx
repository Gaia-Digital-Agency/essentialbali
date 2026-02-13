import React, {useRef} from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Link } from "react-router"
import { ButtonChevron, ButtonChevronBorder } from "../../icons"

type ButtonProps = {
    text: string
    link?: string,
    bigger?: boolean,
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void,
    borderOnly?: boolean,
    uppercase?: boolean
}

const Button: React.FC<ButtonProps> = ({text, link, bigger = false, onClick = () => {}, borderOnly = false, uppercase = false}) => {
    const buttonRef = useRef<HTMLDivElement | null>(null)

    const {contextSafe} = useGSAP({scope: buttonRef})

    const mouseEnterHandler = contextSafe(() => {
        if(!buttonRef.current) return
        const icon = buttonRef.current.querySelector('.icon')
        gsap.to(icon, {
            width: 'auto',
            duration: .2
        })
    })

    const mouseLeaveHandler = contextSafe(() => {
        if(!buttonRef.current) return
        const icon = buttonRef.current.querySelector('.icon')
        gsap.to(icon, {
            width: '0px',
            duration: .2
        })
    })

    const renderSVG = () => {
        if(borderOnly) return <ButtonChevronBorder />
        return <ButtonChevron />
    }

    const ButtonElement = () => {
        return (
            <div className={`button md:px-8 px-4 inline-flex text-front-body font-medium cursor-pointer ${uppercase ? 'uppercase ' : ''}${bigger ? 'py-4' : 'py-3'} ${borderOnly ? 'border border-front-red text-front-red' : 'bg-front-red text-white'}`} onMouseEnter={mouseEnterHandler} onMouseLeave={mouseLeaveHandler} ref={buttonRef} onClick={onClick}>
                {text}
                <div className="icon overflow-hidden" style={{width: '0'}}>
                    <div className="inner pl-2">
                        {renderSVG()}
                    </div>
                </div>
            </div>
        )
    }

    if(link) {
        return <Link to={link}><ButtonElement /></Link>
    }
    return <ButtonElement />
}

export default Button