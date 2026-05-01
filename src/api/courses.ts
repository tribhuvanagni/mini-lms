import { apiClient } from './client';
import { retry } from '@/utils/retry';
import type { ListResponse } from '@/types/api';

// these come back as generic "user" and "product" shapes from freeapi
export interface RawUser {
  id: number;
  login: { uuid: string };
  name: { first: string; last: string };
  email: string;
  picture: { large: string; medium: string; thumbnail: string };
  location: { city: string; country: string };
}

export interface RawProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export const coursesApi = {
  getInstructors: (limit = 20) =>
    retry(() =>
      apiClient.get<ListResponse<RawUser>>('/api/v1/public/randomusers', {
        params: { limit, page: 1 },
      })
    ),

  getProducts: (limit = 20) =>
    retry(() =>
      apiClient.get<ListResponse<RawProduct>>('/api/v1/public/randomproducts', {
        params: { limit, page: 1 },
      })
    ),
};
