'use client';

import { AxiosInstance } from 'axios';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';

import ErrorMessage from '@/components/common/error-message';
import LoadingSpinner from '@/components/common/loading-spinner';
import ScrollContainer from '@/components/common/scroll-container';
import Tran from '@/components/common/tran';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Divider from '@/components/ui/divider';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormGlobalErrorMessage,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';

import useClientApi from '@/hooks/use-client';

import { UploadState } from '@/constant/constant';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { z } from 'zod/v4';

const fetchFiles = async (axios: AxiosInstance, state: UploadState) => {
	const { data } = await axios.get('/upload', { params: { state } });
	return data as {
		path: string;
		message: string;
	}[];
};

const uploadFile = async (
	axios: AxiosInstance,
	file: File,
	onProgress?: (percent: number, loaded?: number, total?: number, elapsed?: number) => void,
) => {
	const formData = new FormData();
	formData.append('file', file);
	const startTime = Date.now();
	const { data } = await axios.post('/upload', formData, {
		data: formData,
		timeout: 1000 * 60 * 60,
		headers: { 'Content-Type': 'multipart/form-data' },
		onUploadProgress: (progressEvent) => {
			if (onProgress && progressEvent.total) {
				const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
				const elapsed = (Date.now() - startTime) / 1000;
				onProgress(percent, progressEvent.loaded, progressEvent.total, elapsed);
			}
		},
	});
	return data;
};

const uploadGithubUrl = async (axios: AxiosInstance, url: string) => {
	const formData = new FormData();
	formData.append('url', url);
	const { data } = await axios.post('/upload/github', formData, {
		data: formData,
		headers: { 'Content-Type': 'multipart/form-data' },
	});

	return data;
};

function useUpload(state: UploadState) {
	const axios = useClientApi();
	return useQuery({
		queryKey: ['admin-upload', state],
		queryFn: () => fetchFiles(axios, state),
		refetchInterval: 1000 * 3,
	});
}

export default function Page() {
	return (
		<ScrollContainer className="p-2 w-full items-center flex flex-col">
			<h2 className="text-xl font-bold mb-4">Upload Admin Panel</h2>
			<Dialog>
				<DialogTrigger>
					<Button>Upload</Button>
				</DialogTrigger>
				<DialogContent className="p-8">
					<FileUploadForm />
					<Divider />
					<GithubUrlUploadForm />
				</DialogContent>
			</Dialog>
			<div className="mt-6 space-y-2 w-full mx-auto max-w-xl flex justify-end">
				<RetryButton />
			</div>
			<div className="mt-6 space-y-2 w-full mx-auto max-w-xl">
				<List state="PROCESSING" />
				<List state="RETRY" />
				<List state="ERROR" />
				<List state="QUEUING" />
			</div>
		</ScrollContainer>
	);
}

function FileUploadForm() {
	const queryClient = useQueryClient();
	const axios = useClientApi();

	const [progress, setProgress] = React.useState<number | null>(null);
	const [speed, setSpeed] = React.useState<number | null>(null);
	const [eta, setEta] = React.useState<number | null>(null);

	const form = useForm<{ file: File }>({
		defaultValues: {
			file: undefined,
		},
	});

	const mutation = useMutation({
		mutationFn: (file: File) =>
			uploadFile(axios, file, (percent, loaded, total, elapsed) => {
				setProgress(percent);
				if (loaded && total && elapsed && elapsed > 0) {
					const bytesPerSec = loaded / elapsed;
					setSpeed(bytesPerSec);
					const remaining = total - loaded;
					setEta(bytesPerSec > 0 ? remaining / bytesPerSec : null);
				}
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-upload'] });
			setProgress(null);
			setSpeed(null);
			setEta(null);
		},
		onError: (error) => {
			toast.error(error?.message);
			setProgress(null);
			setSpeed(null);
			setEta(null);
		},
	});
	const onSubmit = ({ file }: { file: File | null | undefined }) => {
		if (!file) return;

		const allowed = ['.msch', '.msav', '.zip'];
		if (!allowed.some((ext) => file.name.endsWith(ext))) {
			form.setError('file', { message: 'Only .msch, .msav, .zip files allowed' });
			return;
		}

		mutation.mutate(file);
		form.reset();
	};
	return (
		<Form {...form}>
			<header>
				<h3 className="font-semibold mb-2">Via .msav, .msch or .zip</h3>
			</header>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mb-4 space-y-2">
				<FormGlobalErrorMessage />
				<FormField
					control={form.control}
					name="file"
					render={({ field }) => (
						<FormItem>
							<FormLabel>File</FormLabel>
							<FormControl>
								<Input type="file" accept=".msch,.msav,.zip" onChange={(e) => field.onChange(e.target.files?.[0])} className="" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={mutation.isPending}>
					<Tran text="upload" />
				</Button>
			</form>
			{progress !== null && (
				<div className="w-full mt-2">
					<Progress value={progress} />
					<div className="text-xs text-gray-600 mt-1 text-right">
						{progress}%
						{speed !== null && (
							<span className="min-w-[40px]">
								| Speed: {speed > 1024 * 1024 ? (speed / 1024 / 1024).toFixed(2) + ' MB/s' : (speed / 1024).toFixed(2) + ' KB/s'}
							</span>
						)}
						<span className="min-w-[40px]">{eta !== null && eta > 0 && <> | ETA: {Math.ceil(eta)}s</>}</span>
					</div>
				</div>
			)}
		</Form>
	);
}

function GithubUrlUploadForm() {
	const queryClient = useQueryClient();
	const axios = useClientApi();

	const form = useForm<{ url: string }>({
		defaultValues: {
			url: '',
		},
		resolver: zodResolver(
			z.object({
				url: z
					.string()
					.url()
					.regex(/^https:\/\/github.com\/.+/),
			}),
		),
	});

	const mutation = useMutation({
		mutationFn: (url: string) => uploadGithubUrl(axios, url),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-upload'] }),
		onError: (error) => toast.error(error?.message),
	});
	const onSubmit = ({ url }: { url: string }) => {
		mutation.mutate(url);
		form.reset();
	};
	return (
		<Form {...form}>
			<header>
				<h3 className="font-semibold mb-2">Via Github Url</h3>
			</header>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mb-4 space-y-2">
				<FormGlobalErrorMessage />
				<FormField
					control={form.control}
					name="url"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Github Url</FormLabel>
							<FormControl>
								<Input {...field} placeholder="https://github.com/sharrlotte/MindustryToolNext" />
							</FormControl>
							<FormDescription>Url to github repository that contain schematics, maps</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={mutation.isPending}>
					<Tran text="upload" />
				</Button>
			</form>
		</Form>
	);
}

function List({ state }: { state: UploadState }) {
	const { data, isLoading, isError, error, isFetching } = useUpload(state);
	const axios = useClientApi();
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: (filename: string) =>
			axios.delete(`/upload`, {
				params: { path: filename },
			}),
		onError: (error) => {
			toast.error(error?.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-upload'], exact: false });
		},
	});

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <ErrorMessage error={error} />;

	if (!data?.length) return undefined;

	return (
		<div className="mt-6 space-y-1 w-full">
			<h3 className="font-semibold mb-2 space-x-2 flex">
				<span>{state}</span>
				<span className="text-muted-foreground">{data?.length}</span>
				{isFetching && <LoadingSpinner className="m-0" />}
			</h3>
			<div className="w-full space-y-1">
				{data?.map(({ path, message }) => (
					<div className="rounded-md border p-2 bg-card flex justify-between items-center" key={path}>
						<div className="grid">
							<span>{path}</span>
							<span className="text-muted-foreground text-xs">{message}</span>
						</div>
						<Button
							variant="destructive"
							onClick={() => {
								const filename = path.split('/').pop();
								if (!filename) {
									toast.error('Invalid filename');
								} else {
									mutate(filename);
								}
							}}
							disabled={isPending}
						>
							<Trash2 className="w-5 h-5" />
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}

function RetryButton() {
	const axios = useClientApi();
	const { mutate, isPending } = useMutation({
		mutationFn: () => axios.post('/upload/retry'),
		onSuccess: () => {
			toast.success('Retry upload queue');
		},
		onError: (error) => {
			toast.error(error?.message);
		},
	});

	return (
		<Button onClick={() => mutate()} disabled={isPending}>
			Retry
		</Button>
	);
}
