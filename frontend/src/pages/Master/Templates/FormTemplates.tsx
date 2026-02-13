import React, { useEffect } from "react"

const FormTemplate: React.FC = () => {

    // const [availableTemplate, setAvailableTemplate] = useState<{value: string, label: string, schema: {}}[]>([])
    // const [selectedSchema, setSelectedSchema] = useState<{}>({})

    useEffect(() => {
        (async () => {
            // const allTemplate = await getAllAvailableTemplate()
            // if(allTemplate) {
            //     Object.keys(allTemplate).forEach(key => {
            //         const ke = key as keyof typeof allTemplate 
            //         setAvailableTemplate(prev => {
            //             return [...prev, {value: ke, label: ke, schema: allTemplate[ke].schema}]
            //         })
            //     })
            // }
        })()
    }, [])

    // const schemaRender = () => {
    //     if(!selectedSchema) return

    //     selectedSchema.
    // }

    return (
        <></>
    )
}

export default FormTemplate