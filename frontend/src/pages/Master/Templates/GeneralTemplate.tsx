import React, { useEffect, useState } from "react"
import { createTemplate, editTemplateByUrl, getTemplateByUrl } from "../../../services/template.service"
import Button from "../../../components/ui/button/Button"
import { useNavigationPrompt } from "../../../hooks/useNavigationPrompt"
import ComponentCard from "../../../components/common/ComponentCard"
import { getAllCategory } from "../../../services/category.service"
import { TrashBinIcon, MoreDotIcon } from "../../../icons"
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
        <div className="flex items-center gap-4 w-full">
            {/* Drag Handle */}
            <div className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors">
                <MoreDotIcon className="w-5 h-5" />
            </div>

            {/* Content Area */}
            <div className="flex-1 flex items-center gap-4">
                <div className="input-wrapper flex-1">
                    <ReactSelect 
                        className="w-full text-sm" 
                        required 
                        options={transformCategories(taxonomies.categories)} 
                        placeholder="Select Category" 
                        value={{
                            value: menu.linkCategory, 
                            label: taxonomies.categories?.find(cat => (cat.id == menu.linkCategory))?.title, 
                            level: taxonomies.categories?.find(cat => (cat.id == menu.linkCategory))?.id_parent ? 1 : 0
                        }} 
                        onChange={(newValue) => {changeHandler('linkCategory', newValue?.value)}} 
                        classNames={{
                            control: () => "border-gray-300 rounded-lg hover:border-brand-500 focus:ring-brand-500 min-h-[42px]",
                            option: (props) => {
                                if(props.data?.level == 1) {
                                    return 'text-front-small ml-2 before-dash text-sm'
                                }
                                return 'text-sm'
                            }
                        }} 
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="shrink-0">
                <button 
                    onClick={() => {onDelete(id)}} 
                    className="w-10 h-10 flex justify-center items-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100"
                    title="Delete Menu"
                    type="button"
                >
                    <TrashBinIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
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



const getItemStyle = (isDragging: boolean, draggableStyle: object) => ({
    // some basic styles to make the items look a bit nicer
    padding: '16px 20px',
    marginBottom: '12px',
    borderRadius: '12px',
    border: '1px solid',
    borderColor: isDragging ? '#e5e7eb' : '#f3f4f6',

    // change background colour if dragging
    background: isDragging ? "#f9fafb" : "#ffffff",
    boxShadow: isDragging ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",

    // styles we need to apply on draggables
    ...draggableStyle
});
const getListStyle = () => ({
    background: "transparent",
    padding: '4px',
    width: '100%',
    minHeight: '100px'
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
        <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-9">
                <ComponentCard title="Header Navigation" desc="Manage the primary navigation menu displayed in the header. Drag to reorder.">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={getListStyle()}
                                    className={`transition-colors duration-200 rounded-xl ${snapshot.isDraggingOver ? 'bg-gray-50/50 outline-dashed outline-2 outline-gray-200 outline-offset-4' : ''}`}
                                >
                                    {menuHeaderTemplate.length === 0 ? (
                                        <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                            <p className="text-gray-500 text-sm mb-4">No menu items added yet. Click 'Add Menu' to start.</p>
                                        </div>
                                    ) : (
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
                                                                )}}
                                                                className="group relative"
                                                            >
                                                                <MenuRender id={i} menu={menu} onDelete={deleteHandler} onChange={menuChangeHandler} availableCategories={availableCategories} />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                )
                                            }
                                        })
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <Button 
                            onClick={addMenuHandler} 
                            variant="outline" 
                            className="w-full sm:w-auto hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 hover:ring-brand-200 transition-all"
                            startIcon={<span className="text-lg leading-none pb-0.5">+</span>}
                        >
                            Add New Menu Item
                        </Button>
                    </div>
                </ComponentCard>
            </div>
            <div className="col-span-3">
                <div className="sticky top-6">
                    <ComponentCard title="Actions" desc="Save changes before leaving">
                        <div className="flex flex-col gap-3">
                            <Button onClick={saveHandler} className="w-full text-center justify-center">Save Changes</Button>
                        </div>
                    </ComponentCard>
                </div>
            </div>
        </div>
        </>
    )
}

export default GeneralTemplate