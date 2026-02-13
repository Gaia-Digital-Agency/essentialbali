import React, { useEffect, useRef, useState } from "react";
import { createTemplate, editTemplateByUrl, getTemplateByUrl } from "../../../services/template.service";
import { useNotification } from "../../../context/NotificationContext";
import Button from "../../../components/ui/button/Button";

const FooterTemplate: React.FC = () => {
    const [templateContent, setTemplateContent] = useState<any>()
    const isTemplateAvailable = useRef<boolean>(false)
    const {setNotification} = useNotification()
    const TEMPLATE_URL = '/footer'

    useEffect(() => {
        (async () => {
            const get = await getTemplateByUrl('/footer')
            if(get?.status_code == 200 && get?.data?.content) {
                setTemplateContent(JSON.parse(get.data.content))
                isTemplateAvailable.current = true
            }
        })()
    }, [])

    const createHandler = async () => {
        const create = await createTemplate(TEMPLATE_URL, 'Footer', JSON.stringify(templateContent))
        if(create) {
            setNotification({message: 'Action success', type: 'neutral'})
        } else {
            setNotification({message: 'Action failed', type: 'fail'})
        }
    }

    const editHandler = async () => {
        const edit = await editTemplateByUrl(TEMPLATE_URL, 'Footer', JSON.stringify(templateContent))
        if(edit) {
            setNotification({message: 'Action success', type: 'neutral'})
        } else {
            setNotification({message: 'Action failed', type: 'fail'})
        }
    }


    const saveHandler = () => {
        if(isTemplateAvailable.current) return editHandler()
        createHandler()
    }

    return (
        <>
            <Button onClick={saveHandler}>Save</Button>
        </>
    )
}

export default FooterTemplate