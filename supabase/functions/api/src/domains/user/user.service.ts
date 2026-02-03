import * as userRepository from "./user.repository.ts";
import { supabase } from "../../utils/supabase.ts";

export const getUserProfile = async (token: string) => {
  // 1. 인증 확인 (비대칭키 방식에서도 보안을 위해 getUser 권장)
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    token,
  );

  if (authError || !user) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. 프로필 조회
  const { data: profile, error: profileError } = await userRepository
    .findProfileById(user.id);

  if (profileError) {
    throw new Error(profileError.message);
  }

  // 3. 도메인 타입으로 변환 (FE가 쓰기 좋은 형태로 가공)
  return {
    email: profile.email,
    name: profile.nickname,
    profile_image_url: profile.avatar_url,
  };
};
