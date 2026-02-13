import React, {useState, useRef} from "react"
import { SearchIcon } from "../../icons"
import { useNavigate } from "react-router"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

type SearchBarProps = {
    search: string,
    setSearch: (val: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({search, setSearch}) => {
    // return <></>
    const navigate = useNavigate()
    const [isMobileActive, setIsMobileActive] = useState<boolean>(false)
    const formRef = useRef<HTMLFormElement>(null)

    const BREAKPOINT = 1024

    const searchHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const submitHandler = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if(search)
        navigate(`/search?q=${search}`)
    }

    useGSAP(() => {
        const formEl = formRef.current
        if(!formEl) return
        const resizeHandler = () => {
            const windowWidth = window.innerWidth
            if(isMobileActive) return
            if(windowWidth<BREAKPOINT) {
                gsap.set(formEl, {
                    width: 0
                })
            } else {
                gsap.set(formEl, {
                    width: 'auto'
                })
            }
        }
        setTimeout(resizeHandler, 500)
        // resizeHandler()
        window.addEventListener('resize', resizeHandler)
        return () => {
            window.removeEventListener('resize', resizeHandler)
        }
    }, {scope: formRef})

    const {contextSafe} = useGSAP()

    const clickHandler = contextSafe(() => {
        const windowWidth = window.innerWidth
        const formEl = formRef.current
        if(windowWidth > BREAKPOINT || !formEl) return
        setIsMobileActive(true)
        gsap.to(formEl, {
            width: 'auto'
        })
    })

    const blurHandler = contextSafe(() => {
        const windowWidth = window.innerWidth
        const formEl = formRef.current
        if(windowWidth > BREAKPOINT || !formEl) return
        setIsMobileActive(false)
        gsap.to(formEl, {
            width: '0'
        })
    })

    return (
        <>
        <div className="input-wrapper relative max-w-[320px] border border-[#eaeaea] w-full" onClick={clickHandler}>
            <form action="#" onSubmit={submitHandler} ref={formRef} className="overflow-hidden">
                <input type="text" suppressHydrationWarning={true} value={search} onChange={searchHandler} className="p-4 w-full placeholder:text-[#b3b3b3]" placeholder="Search for..." onBlur={blurHandler} />
            </form>
            <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
        </>
    )
}
export default SearchBar