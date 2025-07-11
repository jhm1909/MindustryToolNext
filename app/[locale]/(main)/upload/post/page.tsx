'use client';

import { SearchIcon } from 'lucide-react';
import { Fragment, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';



import ComboBox from '@/components/common/combo-box';
import LoadingScreen from '@/components/common/loading-screen';
import LoadingSpinner from '@/components/common/loading-spinner';
import NoResult from '@/components/common/no-result';
import Tran from '@/components/common/tran';
import { MarkdownData } from '@/components/markdown/markdown-editor';
import { SearchBar, SearchInput } from '@/components/search/search-input';
import TagSelector from '@/components/search/tag-selector';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Divider from '@/components/ui/divider';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';



import useClientApi from '@/hooks/use-client';
import useLanguages from '@/hooks/use-languages';
import useQueriesData from '@/hooks/use-queries-data';
import { useI18n } from '@/i18n/client';
import { createPost, getPost, translatePost } from '@/query/post';
import { getMePosts } from '@/query/user';
import CreatePostRequest from '@/types/request/CreatePostRequest';
import TranslatePostRequest from '@/types/request/TranslatePostRequest';
import { PostDetail } from '@/types/response/PostDetail';
import { TagGroup, TagGroups } from '@/types/response/TagGroup';

import { useMutation, useQuery } from '@tanstack/react-query';



import dynamic from 'next/dynamic';


const MarkdownEditor = dynamic(() => import('@/components/markdown/markdown-editor'));

type Shared = {
	title: string;
	setTitle: (data: string) => void;
	content: MarkdownData;
	setContent: (data: MarkdownData) => void;
	language: string;
	setLanguage: (data: string) => void;
};

export default function Page() {
	// If post is not undefined then its a translate request
	const [post, setPost] = useState<PostDetail>();
	const [title, setTitle] = useState<string>('');
	const [language, setLanguage] = useState('en');
	const [content, setContent] = useState<MarkdownData>({
		text: '',
		files: [],
	});

	function handlePostSelect(post: PostDetail) {
		setPost(post);
		setTitle(post.title);
		setContent({ text: post.content, files: [] });
	}

	function render() {
		if (post === undefined) {
			return (
				<Fragment>
					<div className="flex justify-between gap-2 items-center">
						<h2>
							<Tran text="post.upload" />
						</h2>
						<AddTranslationDialog onPostSelect={handlePostSelect} />
					</div>
					<Divider />
					<UploadPage
						shared={{
							title,
							setTitle,
							content,
							setContent,
							language,
							setLanguage,
						}}
					/>
				</Fragment>
			);
		}

		return (
			<Fragment>
				<div className="space-x-2 rounded-sm">
					<div className="flex justify-between gap-2 items-center">
						<h2>
							<Tran text="post.translate" />
						</h2>
						<div className="flex justify-between gap-2 items-center">
							<Button title="Upload" variant="secondary" onClick={() => setPost(undefined)}>
								<Tran text="upload.go-to-upload-page" />
							</Button>
							<AddTranslationDialog onPostSelect={handlePostSelect} />
						</div>
					</div>
					<Divider />
				</div>
				<TranslatePage
					post={post}
					shared={{
						title,
						setTitle,
						content,
						setContent,
						language,
						setLanguage,
					}}
				/>
			</Fragment>
		);
	}

	return <div className="flex h-full flex-col gap-2 overflow-hidden p-2">{render()}</div>;
}

function TranslatePage({
	post,
	shared: { title, setTitle, content, setContent, language, setLanguage },
}: {
	shared: Shared;
} & { post: PostDetail }) {
	const axios = useClientApi();

	const { invalidateByKey } = useQueriesData();
	const languages = useLanguages();
	const { t } = useI18n();

	const { mutate, isPending } = useMutation({
		mutationFn: (data: TranslatePostRequest) => translatePost(axios, data),
		onSuccess: () => {
			toast.success(<Tran text="upload.success" />);

			setTitle('');
			setContent({ text: '', files: [] });
		},
		onError(error) {
			toast.error(<Tran text="upload.fail" />, { error });
		},
		onSettled: () => {
			invalidateByKey(['posts']);
		},
	});

	function checkUploadRequirement() {
		if (!title) return <Tran text="upload.no-title" />;

		if (!content) return <Tran text="upload.no-content" />;

		if (!language) return <Tran text="upload.no-language" />;

		return true;
	}

	const uploadCheck = checkUploadRequirement();

	const validLanguages = languages
		.filter((language) => language !== post.lang)
		.map((value) => ({
			value,
			label: t(value),
		}));

	return (
		<div className="flex h-full overflow-hidden rounded-md">
			<div className="hidden h-full w-full flex-col justify-between gap-2 overflow-hidden md:flex">
				<div className="flex h-full flex-col gap-2 overflow-hidden rounded-md">
					<div className="space-y-1">
						<h4>
							<Tran text="upload.post-title" asChild />
						</h4>
						<Input
							className="w-full rounded-sm outline-none hover:outline-none"
							placeholder="Title"
							value={title}
							onChange={(event) => setTitle(event.currentTarget.value)}
						/>
					</div>
					<div className="space-y-1 h-full flex flex-col">
						<h4>
							<Tran text="upload.post-content" asChild />
						</h4>
						<MarkdownEditor value={content} onChange={(value) => setContent(value(content))} />
					</div>
				</div>
				<Divider />
				<div className="flex items-center justify-start gap-2">
					<ComboBox
						placeholder={t('select-language')}
						value={{ label: t(language || 'en'), value: language }}
						values={validLanguages}
						onChange={(value) => setLanguage(value ?? '')}
					/>
					<Button
						className="ml-auto"
						title="submit"
						variant="primary"
						disabled={isPending || uploadCheck !== true}
						onClick={() =>
							mutate({
								id: post.id,
								title,
								content,
								lang: language,
							})
						}
					>
						{uploadCheck === true ? <Tran text="upload" /> : uploadCheck}
					</Button>
				</div>
			</div>
			<span className="md:hidden">Mobile screen is not supported yet, please use a bigger screen</span>
		</div>
	);
}

function UploadPage({ shared: { title, setTitle, content, setContent, language, setLanguage } }: { shared: Shared }) {
	const [selectedTags, setSelectedTags] = useState<TagGroup[]>([]);
	const axios = useClientApi();

	const { invalidateByKey } = useQueriesData();

	const languages = useLanguages();
	const { t } = useI18n(['upload', 'common']);

	const { mutate, isPending } = useMutation({
		mutationFn: (data: CreatePostRequest) => createPost(axios, data),
		onSuccess: () => {
			toast.success(<Tran text="upload.success" />);
			setTitle('');
			setContent({ text: '', files: [] });
			setSelectedTags([]);
		},
		onError(error) {
			toast.error(<Tran text="upload.fail" />, { error });
		},
		onSettled: () => {
			invalidateByKey(['posts']);
		},
	});

	function checkUploadRequirement() {
		if (!title) return <Tran text="upload.no-title" />;

		if (!content) return <Tran text="upload.no-content" />;

		if (!language) return <Tran text="upload.no-language" />;

		if (selectedTags.length === 0) return <Tran text="upload.no-tags" />;

		return true;
	}

	const uploadCheck = checkUploadRequirement();

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-md">
			<div className="flex h-full w-full flex-col gap-2 overflow-hidden">
				<div className="flex h-full flex-col gap-2 overflow-hidden rounded-md">
					<div className="space-y-1">
						<h4>
							<Tran text="upload.post-title" asChild />
						</h4>
						<Input
							className="w-full rounded-sm  outline-none hover:outline-none"
							placeholder={t('title')}
							value={title}
							onChange={(event) => setTitle(event.currentTarget.value)}
						/>
					</div>
					<div className="space-y-1 h-full flex flex-col">
						<h4>
							<Tran text="upload.post-content" asChild />
						</h4>
						<MarkdownEditor value={content} onChange={(value) => setContent(value(content))} />
					</div>
				</div>
				<Divider />
				<div className="flex items-center justify-start gap-2">
					<ComboBox
						placeholder={t('select-language')}
						value={{ label: t(language || 'en'), value: language }}
						values={languages.map((value) => ({
							value,
							label: t(value),
						}))}
						onChange={(value) => setLanguage(value ?? '')}
					/>
					<TagSelector type="post" value={selectedTags} onChange={setSelectedTags} hideSelectedTag />
					<Button
						className="ml-auto"
						title="submit"
						variant="primary"
						disabled={isPending || uploadCheck !== true}
						onClick={() =>
							mutate({
								title,
								content,
								lang: language,
								tags: TagGroups.toString(selectedTags),
							})
						}
					>
						{uploadCheck === true ? <Tran text="upload" /> : uploadCheck}
					</Button>
				</div>
			</div>
		</div>
	);
}

type AddTranslationDialogProps = {
	onPostSelect: (post: PostDetail) => void;
};

function AddTranslationDialog({ onPostSelect }: AddTranslationDialogProps) {
	const [name, setName] = useDebounceValue('', 500);
	const axios = useClientApi();
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['me-posts', name],
		queryFn: () =>
			getMePosts(axios, {
				page: 0,
				name,
				size: 20,
				tags: [],
				sort: 'time_desc',
				status: 'VERIFIED',
			}),
	});

	const { mutate, isPending } = useMutation({
		mutationFn: (id: string) => getPost(axios, { id }),
		onSuccess: (data) => onPostSelect(data),
	});

	function render() {
		if (isLoading) {
			return <LoadingSpinner />;
		}

		if (isError) {
			return <span>{error?.message}</span>;
		}

		if (!data || data?.length === 0) {
			return <NoResult />;
		}

		return data?.map(({ id, title }) => (
			<Button
				className="h-full w-full items-center justify-start rounded-md border border-border text-start hover:bg-brand"
				variant="outline"
				key={id}
				title={title}
				onClick={() => mutate(id)}
			>
				{title.trim()}
			</Button>
		));
	}

	if (isPending) {
		return <LoadingScreen />;
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button title="upload.translate-post" variant="secondary">
					<Tran text="upload.translate-post" />
				</Button>
			</DialogTrigger>
			<DialogContent className="p-6">
				<DialogTitle>
					<Tran text="upload.select-post" />
				</DialogTitle>
				<div className="flex flex-col gap-2">
					<SearchBar>
						<SearchInput
							placeholder="upload.post-name"
							value={name}
							onChange={(value) => setName(value)}
							onClear={() => setName('')}
						/>
						<SearchIcon />
					</SearchBar>
					<div className="flex w-full flex-col gap-1">{render()}</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
