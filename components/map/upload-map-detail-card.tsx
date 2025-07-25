'use client';

import { Share2Icon } from 'lucide-react';
import React, { useState } from 'react';



import CopyButton from '@/components/button/copy.button';
import DownloadButton from '@/components/button/download.button';
import CommentSection from '@/components/common/comment-section';
import CreatedAt from '@/components/common/created-at';
import { Detail, DetailActions, DetailAuthor, DetailContent, DetailDescription, DetailHeader, DetailImage, DetailInfo, DetailTitle } from '@/components/common/detail';
import JsonDisplay from '@/components/common/json-display';
import ScrollContainer from '@/components/common/scroll-container';
import SizeCard from '@/components/common/size-card';
import Tran from '@/components/common/tran';
import { DeleteMapButton } from '@/components/map/delete-map.button';
import VerifyMapButton from '@/components/map/verify-map.button';
import TagSelector from '@/components/search/tag-selector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';



import env from '@/constant/env';
import { MapDetail } from '@/types/response/MapDetail';
import { TagGroup, TagGroups } from '@/types/response/TagGroup';

import { useParams } from 'next/navigation';


type UploadMapDetailCardProps = {
	map: MapDetail;
};

export default function UploadMapDetailCard({
	map: { id, name, tags, description, userId, width, height, createdAt, meta, itemId },
}: UploadMapDetailCardProps) {
	const [selectedTags, setSelectedTags] = useState<TagGroup[]>(TagGroups.parsTagDto(tags));

	const { locale } = useParams();

	const link = `${env.url.base}/${locale}/maps/${id}`;
	const imageUrl = `${env.url.image}/maps/${id}${env.imageFormat}`;
	const errorImageUrl = `${env.url.api}/maps/${id}/image`;
	const downloadUrl = `${env.url.api}/maps/${id}/download`;
	const downloadName = `{${name}}.msch`;

	return (
		<Detail>
			<CopyButton position="absolute" variant="ghost" data={link} content={link}>
				<Share2Icon />
			</CopyButton>
			<DetailContent>
				<DetailImage src={imageUrl} errorSrc={errorImageUrl} alt={name} />
				<DetailHeader>
					<DetailTitle className="border-b">{name}</DetailTitle>
					<Tabs defaultValue="info" className="flex overflow-hidden flex-col">
						<TabsList className="grid grid-cols-3 w-full">
							<TabsTrigger value="info">
								<Tran text="info" />
							</TabsTrigger>
							<TabsTrigger value="stats">
								<Tran text="stats" />
							</TabsTrigger>
							<TabsTrigger value="comment">
								<Tran text="comment" />
							</TabsTrigger>
						</TabsList>
						<TabsContent value="info">
							<DetailInfo>
								<DetailAuthor authorId={userId} />
								<SizeCard size={{ width, height }} />
								<DetailDescription>{description}</DetailDescription>
								<CreatedAt createdAt={createdAt} />
								<TagSelector type="map" value={selectedTags} onChange={setSelectedTags} />
							</DetailInfo>
						</TabsContent>
						<TabsContent value="stats">
							<ScrollContainer>
								<JsonDisplay json={meta} />
							</ScrollContainer>
						</TabsContent>
						<TabsContent value="comment">
							<CommentSection itemId={itemId} />
						</TabsContent>
					</Tabs>
					<DetailActions>
						<DownloadButton href={downloadUrl} fileName={downloadName} />
						<DeleteMapButton id={id} name={name} goBack />
						<VerifyMapButton id={id} name={name} selectedTags={selectedTags} />
					</DetailActions>
				</DetailHeader>
			</DetailContent>
		</Detail>
	);
}
