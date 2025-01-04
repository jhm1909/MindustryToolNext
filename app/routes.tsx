import { ReactNode, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

import { IconNotification } from '@/components/common/icon-notification';
import {
  AnalyticIcon,
  BoxIcon,
  ChartIcon,
  ChatIcon,
  CmdIcon,
  CommentIcon,
  CrownIcon,
  DocumentIcon,
  FileIcon,
  GlobIcon,
  HomeIcon,
  LogIcon,
  MapIcon,
  MindustryGptIcon,
  PluginIcon,
  PostIcon,
  RatioIcon,
  SchematicIcon,
  ServerIcon,
  VerifyIcon,
} from '@/components/common/icons';
import Tran from '@/components/common/tran';

import { useLocaleStore } from '@/context/locale-context';
import { useSocket } from '@/context/socket-context';
import useClientApi from '@/hooks/use-client';
import useClientQuery from '@/hooks/use-client-query';
import useNotification from '@/hooks/use-notification';
import useSearchQuery from '@/hooks/use-search-query';
import { Filter, cn } from '@/lib/utils';
import { isError } from '@/lib/utils';
import { getMapUploadCount } from '@/query/map';
import { getPluginUploadCount } from '@/query/plugin';
import { getPostUploadCount } from '@/query/post';
import { getSchematicUploadCount } from '@/query/schematic';
import { TranslationPaginationQuery } from '@/query/search-query';
import { getTranslationDiffCount } from '@/query/translation';
import { useVerifyCount } from '@/zustand/verify-count-store';

import { useQueries } from '@tanstack/react-query';

export type PathGroup = {
  key: string;
  name: ReactNode;
  paths: Path[];
  filter?: Filter;
};

export type SubPath =
  | string
  | {
      path: string;
      name: ReactNode;
      icon: ReactNode;
      enabled?: boolean;
      filter?: Filter;
    }[];

export type Path = {
  path: SubPath;
  name: ReactNode;
  icon: ReactNode;
  enabled?: boolean;
  filter?: Filter;
};

export const groups: readonly PathGroup[] = [
  {
    key: 'user',
    name: '',
    paths: [
      {
        path: '/', //
        name: <Tran text="home" />,
        icon: <HomeIcon />,
      },
      {
        path: '/schematics', //
        name: <Tran text="schematic" />,
        icon: <SchematicIcon />,
      },
      {
        path: '/maps',
        name: <Tran text="map" />,
        icon: <MapIcon />,
      },
      {
        name: <Tran text="plugin" />,
        path: '/plugins',
        icon: <PluginIcon />,
      },
      {
        path: '/posts', //
        name: <Tran text="post" />,
        icon: <PostIcon />,
      },
      {
        path: '/servers', //
        name: <Tran text="server" />,
        icon: <ServerIcon />,
      },
      {
        path: '/logic', //
        name: <Tran text="logic" />,
        icon: <CmdIcon />,
      },
      {
        path: '/chat', //
        name: <Tran text="chat" />,
        icon: <ChatIconPath />,
      },
      {
        path: '/mindustry-gpt', //
        name: <Tran text="mindustry-gpt" />,
        icon: <MindustryGptIcon />,
      },
      {
        name: <Tran text="rank" />,
        path: '/rank',
        icon: <CrownIcon />,
      },
      {
        name: <Tran text="ratio" />,
        path: '/ratio',
        icon: <RatioIcon />,
      },
    ],
  },
  {
    key: 'admin',
    name: <Tran text="admin" />,
    paths: [
      {
        name: <Tran text="dashboard" />,
        path: '/admin',
        icon: <ChartIcon />,
        filter: { authority: 'VIEW_DASH_BOARD' },
      },
      {
        name: <Tran text="setting" />,
        path: '/admin/setting',
        icon: <BoxIcon />,
        filter: { any: [{ authority: 'EDIT_USER_ROLE' }, { authority: 'EDIT_USER_AUTHORITY' }, { authority: 'MANAGE_TAG' }, { authority: 'VIEW_SETTING' }] },
      },
      {
        name: <Tran text="log" />,
        path: '/logs',
        icon: <LogIcon />,
        filter: { authority: 'VIEW_LOG' },
      },
      {
        name: <Tran text="comment" />,
        path: '/admin/comments',
        icon: <CommentIcon />,
        filter: { authority: 'MANAGE_COMMENT' },
      },
      {
        name: <VerifyPath />,
        filter: {
          any: [
            {
              authority: 'VERIFY_SCHEMATIC',
            },
            {
              authority: 'VERIFY_MAP',
            },
            {
              authority: 'VERIFY_POST',
            },
            {
              authority: 'VERIFY_PLUGIN',
            },
          ],
        },
        path: [
          {
            name: <SchematicPath />,
            path: '/admin/schematics',
            icon: <SchematicIcon />,
            filter: { authority: 'VERIFY_SCHEMATIC' },
          },
          {
            name: <MapPath />,
            path: '/admin/maps',
            icon: <MapIcon />,
            filter: { authority: 'VERIFY_MAP' },
          },
          {
            name: <PostPath />,
            path: '/admin/posts',
            icon: <PostIcon />,
            filter: { authority: 'VERIFY_POST' },
          },
          {
            name: <PluginPath />,
            path: '/admin/plugins',
            icon: <PluginIcon />,
            filter: { authority: 'VERIFY_PLUGIN' },
          },
        ],
        icon: <VerifyPathIcon />,
      },
      {
        name: <Tran text="server" />,
        path: '/admin/servers',
        icon: <ServerIcon />,
        filter: { authority: 'VIEW_ADMIN_SERVER' },
      },
      {
        name: <TranslationPath />,
        path: '/translation',
        icon: <TranslationPathIcon />,
        filter: { authority: 'VIEW_TRANSLATION' },
      },
      {
        name: <Tran text="file" />,
        path: '/files',
        icon: <FileIcon />,
        filter: { authority: 'VIEW_FILE' },
      },
      {
        name: <Tran text="analytic" />,
        path: 'https://analytic.mindustry-tool.com',
        icon: <AnalyticIcon />,
        filter: { authority: 'VIEW_DASH_BOARD' },
      },
      {
        name: 'MindustryGPT',
        icon: <MindustryGptIcon />,
        filter: { authority: 'VIEW_DOCUMENT' },
        path: [
          {
            name: 'Document',
            path: '/mindustry-gpt/documents',
            icon: <DocumentIcon />,
          },
        ],
      },
    ],
  },
];

function VerifyPathIcon() {
  const axios = useClientApi();

  const set = useVerifyCount((data) => data.set);

  const [{ data: schematicCount }, { data: mapCount }, { data: postCount }, { data: pluginCount }] = useQueries({
    queries: [
      {
        queryFn: () => getSchematicUploadCount(axios, {}),
        queryKey: ['schematics', 'total', 'upload'],
        placeholderData: 0,
      },
      {
        queryFn: () => getMapUploadCount(axios, {}),
        queryKey: ['maps', 'total', 'upload'],
        placeholderData: 0,
      },
      {
        queryFn: () => getPostUploadCount(axios, {}),
        queryKey: ['posts', 'total', 'upload'],
        placeholderData: 0,
      },
      {
        queryFn: () => getPluginUploadCount(axios, {}),
        queryKey: ['plugins', 'total', 'upload'],
        placeholderData: 0,
      },
    ],
  });

  useEffect(() => set({ schematicCount, mapCount, postCount, pluginCount }), [mapCount, postCount, schematicCount, pluginCount, set]);

  const total = (schematicCount || 0) + (mapCount || 0) + (postCount || 0) + (pluginCount || 0);

  return (
    <IconNotification number={total}>
      <VerifyIcon />
    </IconNotification>
  );
}

function VerifyPath() {
  return <Tran text="verify" />;
}

function SchematicPath() {
  const schematicCount = useVerifyCount((data) => data.schematicCount);

  return (
    <>
      <Tran text="schematic" />
      {schematicCount > 0 && <span> ({schematicCount})</span>}
    </>
  );
}
function MapPath() {
  const mapCount = useVerifyCount((data) => data.mapCount);

  return (
    <>
      <Tran text="map" />
      {mapCount > 0 && <span> ({mapCount})</span>}
    </>
  );
}
function PostPath() {
  const postCount = useVerifyCount((data) => data.postCount);

  return (
    <>
      <Tran text="post" />
      {postCount > 0 && <span> ({postCount})</span>}
    </>
  );
}
function PluginPath() {
  const pluginCount = useVerifyCount((data) => data.pluginCount);

  return (
    <>
      <Tran text="plugin" />
      {pluginCount > 0 && <span> ({pluginCount})</span>}
    </>
  );
}

function TranslationPath() {
  return <Tran text="translation" />;
}

function TranslationPathIcon() {
  const params = useSearchQuery(TranslationPaginationQuery);
  const { currentLocale } = useLocaleStore();

  if (params.language === params.target) {
    params.target = currentLocale;
  }

  const { data } = useClientQuery({
    queryKey: ['translations', 'diff', 'total', params.language, params.target],
    queryFn: (axios) => getTranslationDiffCount(axios, params),
    placeholderData: 0,
  });

  return (
    <IconNotification number={data}>
      <GlobIcon />
    </IconNotification>
  );
}

function ChatIconPath() {
  const { socket } = useSocket();
  const { postNotification } = useNotification();
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [lastMessage] = useLocalStorage('LAST_MESSAGE_GLOBAL', '');

  useEffect(() => {
    try {
      socket
        .onRoom('GLOBAL')
        .await({ method: 'LAST_MESSAGE' })
        .then((newestMessage) => {
          if (isError(newestMessage)) {
            return;
          }

          setHasNewMessage(newestMessage && newestMessage.id !== lastMessage);
        });
    } catch (e) {
      console.error(e);
    }

    return socket.onRoom('GLOBAL').onMessage('MESSAGE', (message) => {
      if ('error' in message) {
        return;
      }

      postNotification(message.content, message.userId);
    });
  }, [socket, postNotification, lastMessage]);

  return (
    <div className="relative">
      <ChatIcon />
      <span className={cn('absolute -right-2 -top-2 hidden h-3 w-3 animate-ping rounded-full bg-red-500 opacity-75', { 'inline-flex': hasNewMessage })} />
      <span className={cn('absolute -right-2 -top-2 hidden h-3 w-3 rounded-full bg-red-500 opacity-75', { 'inline-flex ': hasNewMessage })} />
    </div>
  );
}
