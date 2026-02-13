import React, { useEffect, useState } from "react";
import { getTemplateByUrl } from "../../services/template.service";

const FrontHeader: React.FC = () => {

    const [content, setContent] = useState<string>('')
    useEffect(() => {
        (async() => {
            const getTemplate = await getTemplateByUrl('/header')
            if(getTemplate?.status_code == 200 && typeof getTemplate.data == 'string') setContent(getTemplate.data)
        })()
    }, [])

    useEffect(() => {
        
    }, [content])

    const renderMenu = () => {
        
        return (
            <></>
        )
    }

    if(content)
    return (
        <>
            {renderMenu()}
        </>
    )
}

export default FrontHeader