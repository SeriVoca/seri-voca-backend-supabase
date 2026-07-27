import * as userRepository from "./user.repository.ts";
import { AppError } from "@/shared/errors/app-error.ts";
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
): Promise<UserProfileDTO> => {
  // 가입 시 자동 생성되므로 행이 없다면 데이터 오류다. 추적을 위해 userId를 로그에 남긴다
  const profile = await userRepository.findProfileById(userId);
  if (!profile) {
    throw new AppError("USER_PROFILE_MISSING", {
      cause: new Error(`인증된 사용자(${userId})의 user 행이 없습니다`),
    });
  }

  return UserMapper.toDTO(UserMapper.toDomain(profile));
};
