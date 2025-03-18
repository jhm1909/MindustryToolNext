import { Suspense } from 'react';

import ColorText from '@/components/common/color-text';
import ErrorScreen from '@/components/common/error-screen';
import Tran from '@/components/common/tran';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Skeleton } from '@/components/ui/skeleton';
import IdUserCard from '@/components/user/id-user-card';

import { serverApi } from '@/action/action';
import { isError } from '@/lib/utils';
import { getServerPlayers } from '@/query/server';
import { Player } from '@/types/response/Player';

type PlayersCardProps = {
  id: string;
};

const localeToFlag: Record<string, string> = {
  AD: '🇦🇩',
  AE: '🇦🇪',
  AF: '🇦🇫',
  AG: '🇦🇬',
  AI: '🇦🇮',
  AL: '🇦🇱',
  AM: '🇦🇲',
  AO: '🇦🇴',
  AQ: '🇦🇶',
  AR: '🇦🇷',
  AS: '🇦🇸',
  AT: '🇦🇹',
  AU: '🇦🇺',
  AW: '🇦🇼',
  AX: '🇦🇽',
  AZ: '🇦🇿',
  BA: '🇧🇦',
  BB: '🇧🇧',
  BD: '🇧🇩',
  BE: '🇧🇪',
  BF: '🇧🇫',
  BG: '🇧🇬',
  BH: '🇧🇭',
  BI: '🇧🇮',
  BJ: '🇧🇯',
  BL: '🇧🇱',
  BM: '🇧🇲',
  BN: '🇧🇳',
  BO: '🇧🇴',
  BQ: '🇧🇶',
  BR: '🇧🇷',
  BS: '🇧🇸',
  BT: '🇧🇹',
  BV: '🇧🇻',
  BW: '🇧🇼',
  BY: '🇧🇾',
  BZ: '🇧🇿',
  CA: '🇨🇦',
  CC: '🇨🇨',
  CD: '🇨🇩',
  CF: '🇨🇫',
  CG: '🇨🇬',
  CH: '🇨🇭',
  CI: '🇨🇮',
  CK: '🇨🇰',
  CL: '🇨🇱',
  CM: '🇨🇲',
  CN: '🇨🇳',
  CO: '🇨🇴',
  CR: '🇨🇷',
  CU: '🇨🇺',
  CV: '🇨🇻',
  CW: '🇨🇼',
  CX: '🇨🇽',
  CY: '🇨🇾',
  CZ: '🇨🇿',
  DE: '🇩🇪',
  DJ: '🇩🇯',
  DK: '🇩🇰',
  DM: '🇩🇲',
  DO: '🇩🇴',
  DZ: '🇩🇿',
  EC: '🇪🇨',
  EE: '🇪🇪',
  EG: '🇪🇬',
  EH: '🇪🇭',
  ER: '🇪🇷',
  ES: '🇪🇸',
  ET: '🇪🇹',
  FI: '🇫🇮',
  FJ: '🇫🇯',
  FK: '🇫🇰',
  FM: '🇫🇲',
  FO: '🇫🇴',
  FR: '🇫🇷',
  GA: '🇬🇦',
  GB: '🇬🇧',
  GD: '🇬🇩',
  GE: '🇬🇪',
  GF: '🇬🇫',
  GG: '🇬🇬',
  GH: '🇬🇭',
  GI: '🇬🇮',
  GL: '🇬🇱',
  GM: '🇬🇲',
  GN: '🇬🇳',
  GP: '🇬🇵',
  GQ: '🇬🇶',
  GR: '🇬🇷',
  GS: '🇬🇸',
  GT: '🇬🇹',
  GU: '🇬🇺',
  GW: '🇬🇼',
  GY: '🇬🇾',
  HK: '🇭🇰',
  HM: '🇭🇲',
  HN: '🇭🇳',
  HR: '🇭🇷',
  HT: '🇭🇹',
  HU: '🇭🇺',
  ID: '🇮🇩',
  IE: '🇮🇪',
  IL: '🇮🇱',
  IM: '🇮🇲',
  IN: '🇮🇳',
  IO: '🇮🇴',
  IQ: '🇮🇶',
  IR: '🇮🇷',
  IS: '🇮🇸',
  IT: '🇮🇹',
  JE: '🇯🇪',
  JM: '🇯🇲',
  JO: '🇯🇴',
  JP: '🇯🇵',
  KE: '🇰🇪',
  KG: '🇰🇬',
  KH: '🇰🇭',
  KI: '🇰🇮',
  KM: '🇰🇲',
  KN: '🇰🇳',
  KP: '🇰🇵',
  KR: '🇰🇷',
  KW: '🇰🇼',
  KY: '🇰🇾',
  KZ: '🇰🇿',
  LA: '🇱🇦',
  LB: '🇱🇧',
  LC: '🇱🇨',
  LI: '🇱🇮',
  LK: '🇱🇰',
  LR: '🇱🇷',
  LS: '🇱🇸',
  LT: '🇱🇹',
  LU: '🇱🇺',
  LV: '🇱🇻',
  LY: '🇱🇾',
  MA: '🇲🇦',
  MC: '🇲🇨',
  MD: '🇲🇩',
  ME: '🇲🇪',
  MF: '🇲🇫',
  MG: '🇲🇬',
  MH: '🇲🇭',
  MK: '🇲🇰',
  ML: '🇲🇱',
  MM: '🇲🇲',
  MN: '🇲🇳',
  MO: '🇲🇴',
  MP: '🇲🇵',
  MQ: '🇲🇶',
  MR: '🇲🇷',
  MS: '🇲🇸',
  MT: '🇲🇹',
  MU: '🇲🇺',
  MV: '🇲🇻',
  MW: '🇲🇼',
  MX: '🇲🇽',
  MY: '🇲🇾',
  MZ: '🇲🇿',
  NA: '🇳🇦',
  NC: '🇳🇨',
  NE: '🇳🇪',
  NF: '🇳🇫',
  NG: '🇳🇬',
  NI: '🇳🇮',
  NL: '🇳🇱',
  NO: '🇳🇴',
  NP: '🇳🇵',
  NR: '🇳🇷',
  NU: '🇳🇺',
  NZ: '🇳🇿',
  OM: '🇴🇲',
  PA: '🇵🇦',
  PE: '🇵🇪',
  PF: '🇵🇫',
  PG: '🇵🇬',
  PH: '🇵🇭',
  PK: '🇵🇰',
  PL: '🇵🇱',
  PM: '🇵🇲',
  PN: '🇵🇳',
  PR: '🇵🇷',
  PS: '🇵🇸',
  PT: '🇵🇹',
  PW: '🇵🇼',
  PY: '🇵🇾',
  QA: '🇶🇦',
  RE: '🇷🇪',
  RO: '🇷🇴',
  RS: '🇷🇸',
  RU: '🇷🇺',
  RW: '🇷🇼',
  SA: '🇸🇦',
  SB: '🇸🇧',
  SC: '🇸🇨',
  SD: '🇸🇩',
  SE: '🇸🇪',
  SG: '🇸🇬',
  SH: '🇸🇭',
  SI: '🇸🇮',
  SJ: '🇸🇯',
  SK: '🇸🇰',
  SL: '🇸🇱',
  SM: '🇸🇲',
  SN: '🇸🇳',
  SO: '🇸🇴',
  SR: '🇸🇷',
  SS: '🇸🇸',
  ST: '🇸🇹',
  SV: '🇸🇻',
  SX: '🇸🇽',
  SY: '🇸🇾',
  SZ: '🇸🇿',
  TC: '🇹🇨',
  TD: '🇹🇩',
  TF: '🇹🇫',
  TG: '🇹🇬',
  TH: '🇹🇭',
  TJ: '🇹🇯',
  TK: '🇹🇰',
  TL: '🇹🇱',
  TM: '🇹🇲',
  TN: '🇹🇳',
  TO: '🇹🇴',
  TR: '🇹🇷',
  TT: '🇹🇹',
  TV: '🇹🇻',
  TW: '🇹🇼',
  TZ: '🇹🇿',
  UA: '🇺🇦',
  UG: '🇺🇬',
  UM: '🇺🇲',
  US: '🇺🇸',
  UY: '🇺🇾',
  UZ: '🇺🇿',
  VA: '🇻🇦',
  VC: '🇻🇨',
  VE: '🇻🇪',
  VG: '🇻🇬',
  VI: '🇻🇮',
  VN: '🇻🇳',
  VU: '🇻🇺',
  WF: '🇼🇫',
  WS: '🇼🇸',
  XK: '🇽🇰',
  YE: '🇾🇪',
  YT: '🇾🇹',
  ZA: '🇿🇦',
  ZM: '🇿🇲',
  ZW: '🇿🇼',
};
export default localeToFlag;
export async function PlayersCard({ id }: PlayersCardProps) {
  const players = await serverApi((axios) => getServerPlayers(axios, id));
  if (isError(players)) {
    return <ErrorScreen error={players} />;
  }

  return (
    <div className="grid gap-1">
      {players
        .sort((a, b) => a.team.name.localeCompare(b.team.name))
        .map((player) => (
          <PlayerCard key={player.uuid} player={player} />
        ))}
    </div>
  );
}

type PlayersCardSkeletonProps = {
  players: number;
};
export function PlayersCardSkeleton({ players }: PlayersCardSkeletonProps) {
  if (players === 0) {
    return undefined;
  }

  return Array(players)
    .fill(1)
    .map((_, index) => <Skeleton className="h-10 w-24" key={index} />);
}

type PlayerCardProps = {
  player: Player;
};

function getCountryCode(locale: string): string {
  const parts = locale.split('_');
  return parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase();
}
async function PlayerCard({ player: { locale, userId, name, team } }: PlayerCardProps) {
  locale = getCountryCode(locale ?? 'EN');

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex flex-col justify-between gap-1 px-4 py-1 hover:bg-secondary">
          <div className="flex text-lg justify-between gap-1">
            <ColorText className="font-semibold" text={name} />
            {locale && (localeToFlag[locale] ?? locale)}
            {userId && <IdUserCard id={userId} />}
          </div>
          <div className="border-b-4" style={{ borderColor: `#${team.color}` }} />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <Suspense>
          <ContextMenuItem>
            <Tran text="player.info" />
          </ContextMenuItem>
          <ContextMenuItem variant="destructive">
            <Tran text="player.kick" />
          </ContextMenuItem>
          <ContextMenuItem variant="destructive">
            <Tran text="player.ban" />
          </ContextMenuItem>
        </Suspense>
      </ContextMenuContent>
    </ContextMenu>
  );
}
