import React, {useState, useEffect} from "react";
import { AboutContentProps } from "../../../components/front/About";
import { getTemplateByUrl, createTemplate, editTemplateByUrl } from "../../../services/template.service";
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
                const edit = await editTemplateByUrl(TEMPLATE_SLUG, 'About', JSON.stringify(content))
                if(edit) {
                    setNotificationHandler('Successfully updated About page!', 'neutral')
                    return
                }
                setNotificationHandler('Failed to update About page', 'fail')
            } else {
                const create = await createTemplate(TEMPLATE_SLUG, 'About', JSON.stringify(content))
                if(create) {
                    setNotificationHandler('Successfully created About page!', 'neutral')
                    return
                }
                setNotificationHandler('Failed to create About page', 'fail')
            }
        } catch (e) {
            console.error("Save Error:", e)
            setNotificationHandler('Internal Server Error', 'fail')
        }
    }
    return (
        <ComponentCard title="About Template Settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                <div className="space-y-6">
                    <div className="input-wrapper">
                        <Label>Title</Label>
                        <Input onChange={titleChangeHandler} value={content.title} placeholder="Enter title" />
                    </div>
                    <div className="input-wrapper">
                        <Label>Description</Label>
                        <TextArea onChange={descriptionChangeHandler} value={content.description} placeholder="Enter description" />
                    </div>
                    <div className="input-wrapper">
                        <Label>Link URL</Label>
                        <Input onChange={linkChangeHandler} value={content.link} placeholder="Enter link URL" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="input-wrapper">
                        <Label>Featured Image</Label>
                        <div className="mt-2">
                            {renderImage()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
                <Button onClick={saveTemplateHandler} className="w-full sm:w-1/4">
                    Save Changes
                </Button>
            </div>
        </ComponentCard>
    )
}

export default AboutTemplate