import React, { useEffect, useState } from "react"
import { createTemplate, editTemplateByUrl, getTemplateByUrl } from "../../../services/template.service"
import Button from "../../../components/ui/button/Button"
import { useNavigationPrompt } from "../../../hooks/useNavigationPrompt"
import ComponentCard from "../../../components/common/ComponentCard"
import { getAllCategory } from "../../../services/category.service"
import { TrashBinIcon } from "../../../icons"
// import Draggable from 'react-draggable'
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd'
import { useNotification } from "../../../context/NotificationContext"
import ReactSelect from 'react-select'
import { Category } from "../../../types/category.type"
import { useTaxonomies } from "../../../context/TaxonomyContext"

type MenuProps = {label: string, url: string, linkCategory: number}

type MenuRenderProps = {
    id: number, 
    menu: MenuProps, 
    onChange: (index: number, type: "label" | "linkCategory" | "url", value: string | number) => void,
    availableCategories: {label: string, value: number}[],
    onDelete: (index: number) => void
}

const transformCategories = (categories: Category[] | undefined) => {
    if(!categories) return
    const map = new Map()
    const roots = []

    for (const cat of categories) {
        map.set(cat.id, { label: cat.title, value: cat.id, children: [] })
    }

    for (const cat of categories) {
        const node = map.get(cat.id)
        if (cat.id_parent === 0 || cat.id_parent === null) {
            roots.push(node)
        } else {
            const parent = map.get(cat.id_parent)
            if (parent) parent.children.push(node)
        }
    }


    return roots.map(cat => {
        if (cat.children.length > 0) {
            return {
                label: cat.label,
                options: [
                    { label: cat.label, value: cat.value, level: 0 },
                    ...cat.children.map((c: {value: string, label: string}) => ({
                        label: c.label,
                        value: c.value,
                        level: 1
                    }))
                ]
            }
        }
        return { label: cat.label, value: cat.value, level: 0 }
    })
}

const MenuRender = ({id, menu, onChange, onDelete}: MenuRenderProps) => {
    const {taxonomies} = useTaxonomies()
    const changeHandler = (type: "label" | "linkCategory" | "url", val?: string | number | null) => {
        if(val) {
            onChange(id, type, val)
        }
    }
    return (
        <>
                <div className="menu-edit flex items-center">
                    {/* <div className="input-wrapper">
                        <Input value={menu.label} onChange={(e) => {changeHandler("label", e.target.value)}} placeholder={menu.linkCategory ? availableCategories.find(cat => cat.value == menu.linkCategory)?.label : ''}></Input>
                    </div> */}
                    <div className="input-wrapper">
                        <ReactSelect className="w-100" required options={transformCategories(taxonomies.categories)} placeholder="Select Category" value={{value: menu.linkCategory, label: taxonomies.categories?.find(cat => (cat.id == menu.linkCategory))?.title, level: taxonomies.categories?.find(cat => (cat.id == menu.linkCategory))?.id_parent ? 1 : 0}} onChange={(newValue) => {changeHandler('linkCategory', newValue?.value)}} classNames={{
                            option: (props) => {
                                if(props.data?.level == 1) {
                                    return 'text-front-small ml-2 before-dash'
                                }
                                return ''
                            }
                        }} />
                        {/* <Input value={menu.linkCategory} onChange={(e) => {changeHandler("linkCategory", e.target.value)}}></Input> */}
                        {/* <Select options={availableCategories} onChange={(e) => {changeHandler("linkCategory", typeof e == 'string' ? parseInt(e) : e)}} defaultValue={menu.linkCategory ? `${menu.linkCategory}` : ''}></Select> */}
                    </div>
                    {/* <div className="input-wrapper">
                        <Input value={menu.url} disabled={!!menu.linkCategory} onChange={(e) => {changeHandler("url", e.target.value)}}></Input>
                    </div> */}
                    <div className="input-wrapper">
                        <div className="icon-delete pl-4">
                            <div onClick={() => {onDelete(id)}} className="delete cursor-pointer w-[32px] h-[32px] flex justify-center items-center border border-black rounded-full">
                                <TrashBinIcon className=""></TrashBinIcon>
                            </div>
                        </div>
                    </div>
                </div>
        </>
    )
}

// const getItems = (count: number) =>
//     Array.from({ length: count }, (v, k) => k).map(k => ({
//         id: `item-${k}`,
//         content: `item ${k}`
// }));

  

// a little function to help us with reordering the result
const reorder = (list: MenuProps[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const grid = 8

const getItemStyle = (isDragging: boolean, draggableStyle: object) => ({
    // some basic styles to make the items look a bit nicer
    // userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "#f1f1f1",

    // styles we need to apply on draggables
    ...draggableStyle
});
const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? "lightblue" : "white",
    padding: grid,
    width: 800
});

const GeneralTemplate: React.FC = () => {
    const {setNotification} = useNotification()
    // const {setNotification} = useOutletContext<SetNotificationProps>()
    const [menuHeaderTemplate, setMenuHeaderTemplate] = useState<MenuProps[]>([])
    const [isTemplateAvailable, setIsTemplateAvailable] = useState<boolean>(false)
    const [availableCategories, setAvailableCategories] = useState<{label: string, value: number}[]>([])
    
    const {setBlock} = useNavigationPrompt()
    const TEMPLATE_URL = '/header'
    const TEMPLATE_TYPE = 'Header'
    const defaultMenuProps = {
        label: '',
        url: '',
        linkCategory: 0
    }

    useEffect(() => {
        (async () => {
            try {
                const getTemplate = await getTemplateByUrl(TEMPLATE_URL)
                if(getTemplate?.data?.content && getTemplate.status_code == 200) {
                    let temp = [] as MenuProps[]
                    const content = JSON.parse(getTemplate.data.content)
                    Object.keys(content).forEach(key => {
                        const ke = key as keyof typeof content
                        temp.push({label: content[ke]?.label, url: content[ke]?.url, linkCategory: content[ke]?.linkCategory})
                    })
                    setMenuHeaderTemplate(temp)
                    setIsTemplateAvailable(true)
                    // setMenuHeaderTemplate(getTemplate.data.content)
                } else {
                    setMenuHeaderTemplate([defaultMenuProps])
                }
            } catch(e) {
                console.log(e)
            }

            try {
                const getCategories = await getAllCategory()
                if(getCategories.data) {
                    setAvailableCategories(getCategories.data.map(val => {
                        return {value: val.id, label: val.title}
                    }))
                }
            } catch (e) {
                console.log(e)
            }
        })()
    }, [])

    const menuChangeHandler = (index: number, type: "label" | "linkCategory" | "url", value: string | number) => {
        const newArr = [...menuHeaderTemplate]
        newArr[index] = {...newArr[index], [type]: value}
        if(type == 'linkCategory') {
            newArr[index] = {...newArr[index], url: ''}
        }
        setMenuHeaderTemplate(newArr)
        setBlock(true)
    }

    const deleteHandler = (index: number) => {
        const newArr = [...menuHeaderTemplate].filter((val, i) => {
            console.log(index)
            if(i != index) return val
        })
        setMenuHeaderTemplate(newArr)
    }

    const saveHandler = async () => {
        if(isTemplateAvailable) {
            const edit = await editTemplateByUrl(TEMPLATE_URL, TEMPLATE_TYPE, JSON.stringify(menuHeaderTemplate))
            if(edit) {
                setNotification({message: 'Header menu saved', type: 'neutral'})
                setBlock(false)
            } else {
                setNotification({message: 'cant save the changes', type: 'fail'})
            }
        } else {
            const create = await createTemplate(TEMPLATE_URL, TEMPLATE_TYPE, JSON.stringify(menuHeaderTemplate))
            if(create) {
                setNotification({message: 'Success save header menu', type: 'neutral'})
                setIsTemplateAvailable(true)
                setBlock(false)
            }
        }
    }
    const addMenuHandler = () => {
        setMenuHeaderTemplate(prev => {
            return [...prev, defaultMenuProps]
        })
        setBlock(true)
    }

    const onDragEnd = (result: any) => {
        // dropped outside the list
        console.log(result)
        if (!result.destination) {
            return;
        }

        const items = reorder(
            menuHeaderTemplate,
            result.source.index,
            result.destination.index
        );
        console.log(items)
        setMenuHeaderTemplate(items)
    }
    return (
        <>
        <div className="grid grid-cols-12 gap-x-4">
            <div className="col-span-10">
                <ComponentCard title="Header Navigation">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver)}
                                >
                                    {
                                        menuHeaderTemplate.map((menu, i) => {
                                            if(menu) {
                                                return (
                                                    <Draggable key={`draggable-${i}`} draggableId={`draggable-${i}`} index={i}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{...getItemStyle(
                                                                    snapshot.isDragging,
                                                                    provided.draggableProps.style ?? {}
                                                                ), marginBottom: '1rem'}}
                                                            >
                                                                <MenuRender id={i} menu={menu} onDelete={deleteHandler} onChange={menuChangeHandler} availableCategories={availableCategories} />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <Button onClick={addMenuHandler}>Add Menu</Button>
                </ComponentCard>
            </div>
            <div className="col-span-2">
                <ComponentCard>
                    <div className="text-center">
                        <Button onClick={saveHandler}>Save</Button>
                    </div>
                </ComponentCard>
            </div>
        </div>
        </>
    )
}

export default GeneralTemplate