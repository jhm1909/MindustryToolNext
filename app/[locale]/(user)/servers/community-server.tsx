import { serverApi } from '@/action/action';
import ErrorScreen from '@/components/common/error-screen';
import InternalServerCard from '@/components/server/internal-server-card';
import { isError } from '@/lib/utils';
import { getInternalServers } from '@/query/server';

export async function CommunityServer() {
  const servers = await serverApi((axios) => getInternalServers(axios, { official: false }));

  if (isError(servers)) {
    return <ErrorScreen error={servers} />;
  }

  return servers.map((server) => <InternalServerCard server={server} key={server.port} />);
}
