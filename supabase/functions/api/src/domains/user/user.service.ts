import * as userRepository from "./user.repository.ts";
import { supabase } from "../../utils/supabase.ts";
import { UserProfile, UserProfileDTO, UserProfileRow } from "./user.types.ts";

export class UserMapper {
  static toDomain(row: UserProfileRow): UserProfile {
    return {
      id: row.id,
      email: row.email,
      nickname: row.nickname,
      avatar_url: row.avatar_url,
    };
  }

  static toDTO(domain: UserProfile): UserProfileDTO {
    return {
      id: domain.id,
      email: domain.email,
      nickname: domain.nickname,
      avatar_url: domain.avatar_url,
    };
  }
}

export const getUserProfile = async (
  userId: string,
): Promise<UserProfile | null> => {
  const profile = await userRepository.findProfileById(userId);
  if (!profile) return null;

  return UserMapper.toDTO(UserMapper.toDomain(profile));
};
