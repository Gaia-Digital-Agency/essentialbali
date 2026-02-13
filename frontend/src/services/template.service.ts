import apiClient from "../api"
import { ApiResponse } from "../types/api.type"
import { BaseTemplateType, TemplateType } from "../types/template.type"

type GetTemplateByUrlProps = {
    id: number,
    url: string,
    content: string
}

const getTemplateByUrl = async (url: string) => {
    try {
        const getTemplate = await apiClient.get<ApiResponse<GetTemplateByUrlProps>>(`templating/query?url=${url}`)
        if(getTemplate.status == 200) {
            return getTemplate.data
        }
    } catch (e) {
        // console.log(e)
    }
}
const createTemplate = async (url: string, template: TemplateType, content: string) => {
    try {
        const create = await apiClient.post<ApiResponse<{data: string, status_code: number, status: string}>>('templating', {
            url,
            content,
            template
        })

        if(create.data.status_code == 200) {
            return true
        } else {
            throw Error()
        }
    } catch(e) {
        console.log(e)
    }
}

const editTemplate = async (url: string, template: TemplateType, content: string) => {
    try {
        const getId = await getTemplateByUrl(url)
        if(getId?.data?.id && getId.status_code == 200) {
            const edit = await apiClient.put<ApiResponse<BaseTemplateType<string>>>(`templating/${getId.data?.id}`, {
                url,
                template,
                content
            })
            if(edit.data.status_code == 200) return true
            return false
        }
        return false
    } catch (e) {
        console.log(e)
    }
}

const editTemplateByUrl = async (url: string, template: TemplateType, content: string) => {
    try {
        const urlParams = new URLSearchParams()
        urlParams.append('url', url)
        const edit = await apiClient.put<ApiResponse<BaseTemplateType<string>>>('templating/edit/?' + urlParams.toString(), {
            url: url,
            content: content,
            template: template
        })
        if(edit.data.status_code == 200) {
            return true
        }
    } catch(e) {
        console.log(e)
    }
}

const deleteTemplate = async (url: string) => {
    try {
        const urlParams = new URLSearchParams()
        urlParams.append('url', url)
        const deleteId = await apiClient.delete(`templating/?${urlParams.toString()}`)
        if(deleteId) {
            return true
        }
    } catch(e) {
        console.log(e)
    }
}

export {getTemplateByUrl, createTemplate, editTemplate, editTemplateByUrl, deleteTemplate}