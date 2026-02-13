import { ApiResponse } from "./auth.type";

export type ApplyJobDataProps = {
  applicant_email: string;
  fileCV: File;
  phone: string;
};

export interface ApplicantProps {
  id: number;
  applicant_email: string;
  phone: string | null;
  file: string;
  article_id?: number;
  article_title?: string;
  article_meta_data?: object;
}

export interface PaginationInterface {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface getAllApplicantBaseResponse {
  pagination: PaginationInterface;
  applicant: ApplicantProps[];
}

export type GetAllApplicantResponse = ApiResponse<getAllApplicantBaseResponse>;
