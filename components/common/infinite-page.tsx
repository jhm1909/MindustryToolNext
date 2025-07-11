'use client';

import { AxiosInstance } from 'axios';
import React, { JSXElementConstructor, ReactElement, ReactNode, Suspense, useCallback, useMemo, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroller';



import EndOfPage from '@/components/common/end-of-page';
import ErrorMessage from '@/components/common/error-message';
import LoadingSpinner from '@/components/common/loading-spinner';
import NoResult from '@/components/common/no-result';

import useInfinitePageQuery from '@/hooks/use-infinite-page-query';
import useSearchQuery from '@/hooks/use-search-query';
import { QuerySchema } from '@/types/schema/search-query';

import { QueryKey } from '@tanstack/react-query';

import { z } from 'zod/v4';


type InfinitePageProps<T, P extends QuerySchema, P2> = {
	className?: string;
	queryKey: QueryKey;
	paramSchema: P;
	params?: P2;
	loader?: ReactElement<any, string | JSXElementConstructor<any>>;
	noResult?: ReactNode;
	end?: ReactNode;
	skeleton?: {
		amount: number;
		item: ReactNode;
	};
	reversed?: boolean;
	enabled?: boolean;
	initialData?: T[];
	initialParams?: z.infer<P>;
	queryFn: (axios: AxiosInstance, params: z.infer<P> & P2) => Promise<T[]>;
	children: (data: T[]) => ReactNode;
};

const InfinitePage = <T, P extends QuerySchema, P2 extends Record<string, any> = Record<string, any>>({
	className,
	queryKey,
	paramSchema,
	loader,
	noResult,
	end,
	skeleton,
	reversed,
	initialData,
	initialParams,
	enabled,
	params,
	queryFn,
	children,
}: InfinitePageProps<T, P, P2>) => {
	const p = useSearchQuery(paramSchema, params) as z.infer<P> & P2;
	const componentRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, error, isError, hasNextPage, isFetching, fetchNextPage } = useInfinitePageQuery(
		queryFn,
		p,
		queryKey,
		JSON.stringify(p) === JSON.stringify(initialParams) ? initialData : undefined,
		enabled,
	);

	const loadMore = useCallback(
		(_: number) => {
			fetchNextPage();
		},
		[fetchNextPage],
	);

	noResult = useMemo(() => noResult ?? <NoResult className="flex w-full items-center justify-center" />, [noResult]);

	loader = useMemo(
		() =>
			!loader && !skeleton ? (
				<LoadingSpinner key="loading" className="col-span-full flex h-full w-full items-center justify-center" />
			) : undefined,
		[loader, skeleton],
	);

	const loadingSkeleton = useMemo(
		() =>
			skeleton
				? Array(skeleton.amount)
						.fill(1)
						.map((_, index) => <React.Fragment key={index}>{skeleton.item}</React.Fragment>)
				: undefined,
		[skeleton],
	);

	end = useMemo(() => end ?? <EndOfPage />, [end]);

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	if (isLoading || !data) {
		return (
			<div
				ref={componentRef}
				className={
					className ?? 'grid w-full grid-cols-[repeat(auto-fill,minmax(min(var(--preview-size),100%),1fr))] justify-center gap-2'
				}
			>
				{loader ? loader : loadingSkeleton}
			</div>
		);
	}

	if (!data.pages || data.pages[0].length === 0) {
		return noResult;
	}

	return (
		<div className="w-full" ref={componentRef}>
			<InfiniteScroll
				className={
					className ?? 'grid w-full grid-cols-[repeat(auto-fill,minmax(min(var(--preview-size),100%),1fr))] justify-center gap-2'
				}
				loadMore={loadMore}
				hasMore={hasNextPage}
				loader={loader}
				useWindow={false}
				threshold={400}
				getScrollParent={() => {
					if (!componentRef.current) return null;

					return (componentRef.current.closest('.scroll-container') ||
						componentRef.current.getElementsByClassName('scroll-container')[0]) as HTMLElement;
				}}
				isReverse={reversed}
			>
				<Suspense fallback={skeleton && loadingSkeleton}>
					{children(data.pages.flatMap((page) => page))}
					{isFetching && skeleton && loadingSkeleton}
					{!hasNextPage && end}
				</Suspense>
			</InfiniteScroll>
		</div>
	);
};

export default InfinitePage;
