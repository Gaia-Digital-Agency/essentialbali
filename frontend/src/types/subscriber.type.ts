import { ApiResponse } from './api.type';

export interface NewsletterSubscriber {
  id: number;
  email: string;
  ip_address: string;
  user_agent: string;
  subscribed_at: string; // ISO date string
  unsubscribed_at: string | null;
  source: string;
  status_subscription: {
    status: number;
    description: string;
  };
}

export interface NewsletterPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface getAllSubscribersBaseResponse {
  pagination: NewsletterPagination;
  subscribers: NewsletterSubscriber[];
}

export type GetAllSubscribersResponse = ApiResponse<getAllSubscribersBaseResponse>;