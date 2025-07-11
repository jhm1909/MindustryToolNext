'use client';

import { ArrowDownUpIcon, FileIcon, FolderIcon, LayoutGrid } from 'lucide-react';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { ReactNode, Suspense } from 'react';

import { CatchError } from '@/components/common/catch-error';
import ScrollContainer from '@/components/common/scroll-container';

import useQueryState from '@/hooks/use-query-state';

import { cn } from '@/lib/utils';

import dynamic from 'next/dynamic';

const SearchPanel = dynamic(() => import('@/app/[locale]/(main)/servers/[id]/workflows/search-panel'), {
	ssr: false,
});

const NodeListPanel = dynamic(() => import('@/app/[locale]/(main)/servers/[id]/workflows/node-list-panel'), {
	ssr: false,
});
const EventPanel = dynamic(() => import('@/app/[locale]/(main)/servers/[id]/workflows/event-panel'), {
	ssr: false,
});

type TabType = {
	id: string;
	icon: ReactNode;
	item: ReactNode;
};

const tabs: TabType[] = [
	{
		id: 'add',
		icon: <PlusIcon />,
		item: <NodeListPanel />,
	},
	{
		id: 'file',
		icon: <FileIcon />,
		item: <div></div>,
	},
	{
		id: 'search',
		icon: <SearchIcon />,
		item: <SearchPanel />,
	},
	{
		id: 'folder',
		icon: <FolderIcon />,
		item: <div></div>,
	},
	{
		id: 'event',
		icon: <ArrowDownUpIcon />,
		item: <EventPanel />,
	},
	{
		id: 'marketplace',
		icon: <LayoutGrid />,
		item: <div></div>,
	},
];

export default function WorkflowSideBar() {
	const [{ tab: currentTab }, setState] = useQueryState<{
		tab: string | null;
	}>({
		tab: '',
	});

	const setCurrentTab = (fn: (tab: string | null) => string | null) => {
		setState({ tab: fn(currentTab) });
	};

	return (
		<div className="h-full flex items-start overflow-hidden p-2 space-x-2 absolute top-0 left-0 z-50">
			<div className="flex gap-2 flex-col h-full">
				{tabs.map(({ id, icon }) => (
					<button
						key={id}
						className={cn(
							'cursor-pointer p-2 border bg-card size-12 rounded-md hover:bg-secondary flex items-center justify-center aspect-square',
							{
								'bg-secondary border': id === currentTab,
							},
						)}
						onClick={() => setCurrentTab((prev) => (prev === id ? null : id))}
					>
						{icon}
					</button>
				))}
			</div>
			{tabs
				.filter(({ id }) => id === currentTab)
				.map(({ id, item }) => (
					<ScrollContainer key={id} className="p-2 border bg-card rounded-md h-full min-w-72 w-72">
						<CatchError>
							<Suspense>{item}</Suspense>
						</CatchError>
					</ScrollContainer>
				))}
		</div>
	);
}
