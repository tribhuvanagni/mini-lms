export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: {
    url: string;
    localPath: string;
  };
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role?: 'USER';
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
