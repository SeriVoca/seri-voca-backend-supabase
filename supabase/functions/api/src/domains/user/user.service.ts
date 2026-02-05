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

export const getUserProfile = async (token: string) => {
  // 1. 인증 확인 (비대칭키 방식에서도 보안을 위해 getUser 권장)
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    token,
  );

  if (authError || !user) {
    throw new Error("UNAUTHORIZATION");
  }

  // 2. 프로필 조회
  const profile = await userRepository
    .findProfileById(user.id);

  // 3. 도메인 타입으로 변환 (FE가 쓰기 좋은 형태로 가공)
  return UserMapper.toDTO(UserMapper.toDomain(profile));
};
