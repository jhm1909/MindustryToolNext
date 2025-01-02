import { Authority, Role } from '@/types/response/Role';

export type UserId = '@me' | string;

export type UserStats =
  | {
      EXP: number;
      DOWNLOAD_COUNT: number;
    }
  | undefined;

export type User = {
  id: string;
  name: string;
  imageUrl?: string | null;
  thumbnail?: string | null;
  roles: Role[];
  authorities: Authority[];
  stats: UserStats;
  isBanned: boolean;
};
