import apiClient from "../api"
import { ApiResponse } from "../types/api.type"
import { ApplyJobDataProps, GetAllApplicantResponse } from "../types/job.type"


export const applyJob = async (id: number, data: ApplyJobDataProps) => {
    const formData = new FormData()
    formData.append('fileCV', data.fileCV, data.fileCV.name)
    formData.append('applicant_email', data.applicant_email)
    formData.append('phone', data.phone)
    
    const apply = await apiClient.post<ApiResponse<{applicant_email: string, file: string}>>(`job/apply/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })

    if(apply.data.status_code == 200) {
        return true
    } else {
        return false
    }
}

export const getAllApplicant = async (page : number, limit: number) => {
    try {
        const response = await apiClient.get<GetAllApplicantResponse>("/job/applicant?page=" + page + "&limit=" + limit)
        return response.data
    } catch (error) {
        console.error(error)
        throw error;
    }
}