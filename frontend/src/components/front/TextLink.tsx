import React from "react"
import { Link } from "react-router"

type TextLinkProps = {
    text?: string,
    link?: string,
    color?: 'black' | 'gray' | 'white',
    uppercase?: boolean
}

const TextLink: React.FC<TextLinkProps> = ({text = 'Read More', link = null, color = 'black', uppercase = false}) => {

    const colorClass = () => {
        if(color == 'black') {
            return 'text-front-black decoration-front-black'
        }
        if(color == 'gray') {
            return 'text-front-soft-gray decoration-front-soft-gray'
        }
        if(color == 'white') {
            return 'text-white decoration-white'
        }
    }

    const renderText = (
        <p className={`inline-block text-front-small tracking-[.2em] transition hover:text-front-red hover:decoration-front-red decoration-solid underline ${colorClass()}${uppercase ? ' uppercase' : ''}`}>{text}</p>
    )

    if(link) {
        return (
            <Link to={link}>
                {renderText}
            </Link>
        )
    }
    return renderText
}

export default TextLink