// src/lib/types.ts

// API Response Envelope (Standard aus Phase C2)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Domain Models
export interface User {
  uid: number;
  username: string;
  email: string;
  name: string;
}

export interface Fahndung {
  uid: number;
  title: string;
  description: string;
  caseId: string;
  location: string;
  dateOfCrime: string; // ISO Date String YYYY-MM-DD
  isPublished: boolean;
  created: string;
  images?: FahndungImage[];
  categories?: FahndungCategory[];
}

export interface FahndungImage {
  uid: number;
  url: string;
  title: string;
  alternative: string;
}

export interface FahndungCategory {
  uid: number;
  title: string;
}

// Session Response
export interface SessionResponse {
  authenticated: boolean;
  user: User | null;
}
