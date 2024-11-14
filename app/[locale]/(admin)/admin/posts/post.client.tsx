'use client';

import React, { useState } from 'react';

import InfinitePage from '@/components/common/infinite-page';
import UploadPostPreviewCard from '@/components/post/upload-post-preview-card';
import NameTagSearch from '@/components/search/name-tag-search';
import useTags from '@/hooks/use-tags';
import { getPostUploads } from '@/query/post';
import useSearchQuery from '@/hooks/use-search-query';
import { ItemPaginationQuery } from '@/query/search-query';
import { Post } from '@/types/response/Post';

type Props = {
  posts: Post[];
};

export default function Client({ posts }: Props) {
  const {
    searchTags: { post },
  } = useTags();
  const params = useSearchQuery(ItemPaginationQuery);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div>
      <div className="relative flex h-full flex-col gap-2 overflow-y-auto p-2" ref={(ref) => setContainer(ref)}>
        <NameTagSearch tags={post} />
        <InfinitePage
          className="grid w-full grid-cols-[repeat(auto-fill,minmax(min(450px,100%),1fr))] justify-center gap-2"
          params={params}
          queryKey={['posts', 'upload']}
          getFunc={getPostUploads}
          initialData={posts}
          container={() => container}
        >
          {(data) => <UploadPostPreviewCard key={data.id} post={data} />}
        </InfinitePage>
      </div>
    </div>
  );
}
