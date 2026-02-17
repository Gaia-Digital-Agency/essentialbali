import React, { useRef, useEffect } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Link } from "react-router-dom"
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL

type ImageProps = {
    url?: string,
    ratio?: string,
    mobileRatio?: string,
    link?: string,
    overlay?: boolean,
    alt?: string,
    isLazy?: boolean
    fetchPriority?: "high" | "auto" | "low" | undefined,
    fit?: 'cover' | 'contain',
    noRatio?: boolean,
    width?: string
    height?: string
}

const Image: React.FC<ImageProps> = ({ url, ratio = "78%", mobileRatio, link, overlay = false, alt = '', isLazy = true, fetchPriority = 'low', fit = 'cover', noRatio = false, width, height }) => {
    const imageRef = useRef<HTMLDivElement | null>(null)
    const { contextSafe } = useGSAP({ scope: imageRef })
    const theUrl = url ?? `${IMAGE_URL}/logo.png`
    // const isUrl = url != `${IMAGE_URL}/uploads/placeholder.png`

    const onMouseEnter = contextSafe(() => {
        const imageEl = imageRef.current
        if(imageEl) {
            gsap.to(imageEl.querySelector(".overlay"), {
                opacity: overlay ? 0.6 : 0.4
            })
        }
    })

    const onMouseLeave = contextSafe(() => {
        const imageEl = imageRef.current
        if(imageEl) {
            gsap.to(imageEl.querySelector(".overlay"), {
                opacity: overlay ? 0.4 : 0
            })
        }
    })

    useEffect(() => {
        const imageEl = imageRef.current
        if (!imageEl) return

        const applyPadding = () => {
            if(noRatio) {
                gsap.set(imageEl, {paddingTop: 'unset'})
                return
            }
            const isMobile = window.innerWidth < 768
            const targetPadding = isMobile ? (mobileRatio || ratio) : ratio
            gsap.set(imageEl, { paddingTop: targetPadding })
        }

        applyPadding()
        window.addEventListener("resize", applyPadding)
        return () => window.removeEventListener("resize", applyPadding)
    }, [mobileRatio, ratio, url])

    useEffect(() => {
        const imageEl = imageRef.current
        if(imageEl) {
            imageEl.style.aspectRatio = 'auto'
        }
    }, [])

    const theImage = () => {
        // if(isLazy) {
        //     return (
        //         <>
        //             {/* <LazyLoadImage src={theUrl} effect="opacity" fetchPriority={fetchPriority} className={`absolute inset-0 w-full h-full z-[1] ${isUrl ? 'object-cover' : 'object-contain'}`} alt={alt} /> */}
        //         </>
        //     )
        // }
        return <img src={theUrl} fetchPriority={fetchPriority} width={width ?? undefined} height={height ?? undefined} style={{objectFit: fit}} loading={isLazy ? "lazy" : 'eager'} className={`absolute inset-0 w-full h-full z-[1]`} alt={alt} />
    }

    const content = () => {
        return (
            <div
                ref={imageRef}
                className="image-container relative"
                onMouseEnter={link ? onMouseEnter : undefined}
                onMouseLeave={link ? onMouseLeave : undefined}
                style={{ aspectRatio: width && height ? `${width} / ${height}` : undefined }}
                >
                <div
                    className="overlay absolute inset-0 w-full h-full bg-front-navy z-[2]"
                    style={{ opacity: overlay ? 0.6 : 0 }}
                ></div>
                {theImage()}
            </div>
        )
    }

    return link ? <Link aria-label={alt} to={link}>{content()}</Link> : content()
}

export default Image