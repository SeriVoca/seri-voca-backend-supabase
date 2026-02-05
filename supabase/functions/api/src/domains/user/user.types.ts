export type UserRole = 'USER' | 'ADMIN';

// DB Layer

export interface UserRow {
  id: string;
  nickname: string;
  email: string;
  avatar_url: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Query Layer

export interface UserProfileRow {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string;
}

// Domain Layer

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string;
}

// DTO Layer

export interface UserProfileDTO {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string;
}