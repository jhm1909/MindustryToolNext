import Image from 'next/image';
import React from 'react';

import { EditIcon } from '@/components/common/icons';
import InternalLink from '@/components/common/internal-link';
import Tran from '@/components/common/tran';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { EllipsisButton } from '@/components/ui/ellipsis-button';
import UserAvatar from '@/components/user/user-avatar';
import UserRoleCard from '@/components/user/user-role';
import { useSession } from '@/context/session-context.client';
import ProtectedElement from '@/layout/protected-element';
import { User } from '@/types/response/User';

type Props = {
  user: User;
};

export default function UserDetail({ user }: Props) {
  const { session } = useSession();
  const { name, roles, stats, thumbnail } = user;
  const exp = stats?.EXP ?? 0;
  const level = Math.floor(Math.sqrt(exp));

  const nextLevel = level + 1;
  const levelExp = level * level;
  const nextLevelExp = nextLevel * nextLevel;
  const levelUpExp = nextLevelExp - levelExp;
  const currentExp = nextLevelExp - exp;

  const progress = (currentExp / levelUpExp) * 100;

  const style = thumbnail ? { backgroundImage: thumbnail } : undefined;

  return (
    <div className="relative flex flex-col gap-2 rounded-md bg-card bg-cover bg-center p-2" style={style}>
      {thumbnail && (
        <Dialog>
          <DialogTrigger>
            <Image className="max-h-[80vh] w-full object-cover" src={`${thumbnail}`} width={1920} height={1080} alt={name} />
          </DialogTrigger>
          <DialogContent className="max-h-full max-w-full overflow-y-auto">
            <Image src={`${thumbnail}`} width={1920} height={1080} alt={name} />
          </DialogContent>
        </Dialog>
      )}
      <div className="relative flex gap-2 bg-card bg-cover bg-center p-2">
        <UserAvatar className="h-20 w-20" user={user} />
        <EllipsisButton className="absolute right-2 top-2 aspect-square border-none bg-transparent">
          <ProtectedElement session={session} filter={{ authorId: user.id }}>
            <InternalLink variant="command" href="/users/@me/setting">
              <EditIcon />
              <Tran text="edit" />
            </InternalLink>
          </ProtectedElement>
        </EllipsisButton>
        <div className="flex h-full w-full flex-col justify-between">
          <span className="text-2xl capitalize">{name}</span>
          <UserRoleCard className="text-2xl" roles={roles} />
          <span className="font-bold">LV.{level}</span>
          <div className="flex w-full items-center gap-1 text-xs">
            <div className="h-3 max-h-3 w-full overflow-hidden rounded-full border">
              <div className="h-full w-full rounded-full bg-success" style={{ width: `${progress}%` }} />
            </div>
            {currentExp}/{levelUpExp}
          </div>
        </div>
      </div>
    </div>
  );
}
