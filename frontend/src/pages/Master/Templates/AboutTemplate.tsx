import React, {useState, useEffect} from "react";
import { AboutContentProps } from "../../../components/front/About";
import { getTemplateByUrl, createTemplate, editTemplate } from "../../../services/template.service";
import ComponentCard from "../../../components/common/ComponentCard";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Label from "../../../components/form/Label";
import { AdminFeaturedImage } from "../../../components/ui/featured-image/FeaturedImage";
import { AssetMedia } from "../../../types/media.type";
import Button from "../../../components/ui/button/Button";
import { useNotification } from "../../../context/NotificationContext";

const AboutTemplate: React.FC = () => {
    const [content, setContent] = useState<AboutContentProps>({title: '', description: '', link: '', image: {url: '', alt: ''}})
    const [isTemplateAvailable, setIsTemplateAvailable] = useState<boolean>(false)

    const {setNotification} = useNotification()
    const TEMPLATE_SLUG = '/about'
    // const {isOpen, closeModal, openModal} = useModal()

    useEffect(() => {
        (async () => {
            const getTemplate = await getTemplateByUrl(TEMPLATE_SLUG)
            if(getTemplate?.data?.content && getTemplate.status_code == 200){
                setContent(JSON.parse(getTemplate.data.content))
                setIsTemplateAvailable(true)
            }
            
        })()
    }, [])

    const titleChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent(prev => ({...prev, title: e.target.value}))
    }
    const descriptionChangeHandler = (e:string) => {
        console.log(e)
        setContent(prev => ({...prev, description: e}))
    }
    const linkChangeHandler = (e:React.ChangeEvent<HTMLInputElement>) => {
        setContent(prev => ({...prev, link: e.target.value}))
    }
    const imageSaveHandler = (file: AssetMedia) => {
        if(!file) return
        setContent(prev => ({...prev, image: {url: file.path, alt: content.image.alt}}))
    }


    const renderImage = () => {
        return <AdminFeaturedImage onSave={imageSaveHandler} url={content.image.url ?? ''} />
    }

    const setNotificationHandler = (_message: string = 'Action Success', _type: 'fail' | 'neutral' = 'neutral') => {
        setNotification({type: _type, message: _message, isClosed: false})
    }

    const saveTemplateHandler = async () => {
        try {
            if(isTemplateAvailable) {
                const edit = await editTemplate(TEMPLATE_SLUG, 'About', JSON.stringify(content))
                if(edit) {
                    setNotificationHandler()
                    return
                }
                setNotificationHandler('Failed', 'fail')
            } else {
                const create = await createTemplate(TEMPLATE_SLUG, 'About', JSON.stringify(content))
                if(create) {
                    setNotificationHandler()
                    return
                }
                setNotificationHandler('Failed', 'fail')
            }
        } catch (e) {
            console.log(e)
        }
    }
    return (
        <>
            <ComponentCard>
                <div className="grid grid-cols-12 items-center gap-x-10">
                    <div className="col-span-6">
                        <div className="input-wrapper mb-8">
                            <Label>Title</Label>
                            <Input onChange={titleChangeHandler} value={content.title} placeholder="Title" />
                        </div>
                        <div className="input-wrapper mb-8">
                            <Label>Description</Label>
                            <TextArea onChange={descriptionChangeHandler} value={content.description} placeholder="Description" />
                        </div>
                        <div className="input-wrapper mb-8">
                            <Label>Link</Label>
                            <Input onChange={linkChangeHandler} value={content.link} placeholder="Link" />
                        </div>
                    </div>

                    <div className="col-span-6">
                        <div className="input-wrapper mb-8">
                            <Label>Image</Label>
                            {renderImage()}
                        </div>
                    </div>

                </div>
            </ComponentCard>
            <Button onClick={saveTemplateHandler}>Save</Button>
        </>
    )
}

export default AboutTemplate