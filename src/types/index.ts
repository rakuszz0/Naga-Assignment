import { FastifyRequest, RouteGenericInterface, RouteShorthandOptions } from 'fastify';

export interface JWTPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: JWTPayload;
  }
}

export interface BaseRoute extends RouteGenericInterface {
  Querystring?: {
    page?: number;
    limit?: number;
  };
}

export interface GetTodosRoute extends BaseRoute {
  Querystring?: {
    page?: number;
    limit?: number;
  };
}

export interface GetTodoRoute extends BaseRoute {
  Params: {
    id: number;
  };
}

export interface CreateTodoRoute extends BaseRoute {
  Body: {
    title: string;
    description?: string;
  };
}

export interface UpdateTodoRoute extends BaseRoute {
  Params: {
    id: number;
  };
  Body: {
    title?: string;
    description?: string;
    is_done?: boolean;
  };
}

export interface DeleteTodoRoute extends BaseRoute {
  Params: {
    id: number;
  };
}

export interface RegisterRoute extends BaseRoute {
  Body: {
    name: string;
    email: string;
    password: string;
  };
}

export interface LoginRoute extends BaseRoute {
  Body: {
    email: string;
    password: string;
  };
}

export interface ProfileRoute extends BaseRoute {
  // Empty interface untuk route tanpa params/body
}


export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  is_done: boolean;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  user_name?: string;
}

export interface TodoInput {
  title: string;
  description?: string;
  is_done?: boolean;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  is_done?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserResponse;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}