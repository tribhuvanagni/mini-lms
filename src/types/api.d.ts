export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// freeapi wraps list responses like this
export interface ListResponse<T> {
  data: {
    data: T[];
    page: number;
    limit: number;
    totalPages: number;
    nextPage: boolean;
  };
}
