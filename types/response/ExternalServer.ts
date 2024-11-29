import { Like } from '@/types/response/Like';

export type ExternalServer = {
  id: string;
  name: string;
  online: boolean;
  address: string;
  mapName: string;
  description: string;
  wave: number;
  players: number;
  playerLimit: number;
  version: number;
  versionType: string;
  mode: string;
  modeName: string;
  ping: number;
  port: number;
  likes: number;
  dislikes: number;
  userLike: Like;
  lastOnlineTime: number;
  createdAt: number;
};
