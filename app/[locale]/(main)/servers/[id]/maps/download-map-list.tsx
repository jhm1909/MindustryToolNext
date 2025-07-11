'use client';

import { motion } from 'framer-motion';

import ColorText from '@/components/common/color-text';
import GridPaginationList from '@/components/common/grid-pagination-list';
import InfinitePage from '@/components/common/infinite-page';
import LoadingSpinner from '@/components/common/loading-spinner';
import { GridLayout, ListLayout, PaginationLayoutSwitcher } from '@/components/common/pagination-layout';
import PaginationNavigator from '@/components/common/pagination-navigator';
import { Preview, PreviewDescription, PreviewHeader, PreviewImage } from '@/components/common/preview';
import ScrollContainer from '@/components/common/scroll-container';
import Tran from '@/components/common/tran';
import NameTagSearch from '@/components/search/name-tag-search';
import PreviewSkeleton from '@/components/skeleton/preview.skeleton';
import { toast } from '@/components/ui/sonner';

import env from '@/constant/env';
import useClientApi from '@/hooks/use-client';
import useQueriesData from '@/hooks/use-queries-data';
import useServerMaps from '@/hooks/use-server-maps';
import { getMapCount, getMaps } from '@/query/map';
import { createServerMap } from '@/query/server';
import { Map } from '@/types/response/Map';
import { ItemPaginationQuery } from '@/types/schema/search-query';

import { useMutation } from '@tanstack/react-query';

import { useParams } from 'next/navigation';

export default function DownloadMapList() {
	const { id } = useParams() as { id: string };
	const maps = useServerMaps(id);
	const added = maps.data ?? [];

	return (
		<div className="flex h-full flex-col gap-2 overflow-hidden">
			<NameTagSearch type="map" />
			<ScrollContainer className="flex h-full w-full flex-col gap-2" id="download-map">
				<ListLayout>
					<InfinitePage
						paramSchema={ItemPaginationQuery}
						queryKey={['map']}
						queryFn={(axios, params) => getMaps(axios, params)}
						skeleton={{
							amount: 20,
							item: <PreviewSkeleton />,
						}}
					>
						{(page) =>
							page
								.filter((map) => !added.some((a) => a.filename.startsWith(map.id)))
								.map((map) => <AddServerMapCard key={map.id} map={map} />)
						}
					</InfinitePage>
				</ListLayout>
				<GridLayout>
					<GridPaginationList
						paramSchema={ItemPaginationQuery}
						queryKey={['map']}
						queryFn={getMaps}
						skeleton={{
							amount: 20,
							item: <PreviewSkeleton />,
						}}
					>
						{(page) =>
							page
								.filter((map) => !added.some((a) => a.filename.startsWith(map.id)))
								.map((map) => <AddServerMapCard key={map.id} map={map} />)
						}
					</GridPaginationList>
				</GridLayout>
			</ScrollContainer>
			<div className="flex justify-end gap-2 mt-auto">
				<PaginationLayoutSwitcher />
				<GridLayout>
					<PaginationNavigator numberOfItems={getMapCount} queryKey={['maps', 'total']} />
				</GridLayout>
			</div>
		</div>
	);
}

type AddServerMapCardProps = {
	map: Map;
};

function AddServerMapCard({ map }: AddServerMapCardProps) {
	const { name } = map;

	const { id } = useParams() as { id: string };
	const axios = useClientApi();

	const { invalidateByKey } = useQueriesData();

	const { mutate, isPending } = useMutation({
		mutationKey: ['server', id, 'map', map.id],
		mutationFn: (mapId: string) => createServerMap(axios, id, { mapId }),
		onSuccess: () => {
			toast.success(<Tran text="server.add-map-success" />);
		},
		onError: (error) => {
			toast.error(<Tran text="server.add-map-fail" />, { error });
		},
		onSettled: () => {
			invalidateByKey(['server', id, 'map']);
		},
	});

	return (
		<motion.button
			layout
			className="relative h-full w-full overflow-hidden p-0"
			disabled={isPending}
			onClick={() => mutate(map.id)}
		>
			<Preview className="group relative flex flex-col justify-between hover:border-brand">
				<PreviewImage
					className="h-full"
					src={`${env.url.image}/map-previews/${map.id}${env.imageFormat}`}
					errorSrc={`${env.url.image}/map-previews/${map.id}${env.imageFormat}`}
					alt={name}
				/>
				<PreviewDescription>
					<PreviewHeader className="h-12">
						<ColorText text={name} />
					</PreviewHeader>
				</PreviewDescription>
			</Preview>
			{isPending && (
				<div className="absolute inset-0 z-10 backdrop-brightness-50 flex items-center justify-center">
					<LoadingSpinner className="m-auto" />
				</div>
			)}
		</motion.button>
	);
}
