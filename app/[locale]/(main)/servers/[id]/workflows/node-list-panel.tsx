import { ArrowLeft, ArrowRight, PlayIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import React from 'react';
import { useDrag } from 'react-dnd';

import ErrorMessage from '@/components/common/error-message';
import Tran from '@/components/common/tran';
import Divider from '@/components/ui/divider';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Skeletons from '@/components/ui/skeletons';

import { WorkflowNodeType } from '@/types/response/WorkflowContext';

import useWorkflowNodeTypes from '@/hooks/use-workflow-nodes';

import { groupBy } from '@/lib/utils';

export default function NodeListPanel() {
	const [filter, setFilter] = useState('');

	return (
		<div className="space-y-2 flex flex-col h-full overflow-hidden">
			<div>
				<h2 className="text-base">
					<Tran text="logic.Workflow-list" defaultValue="Workflow list" />
				</h2>
				<Input placeholder="Search" value={filter} onChange={(event) => setFilter(event.currentTarget.value)} />
			</div>
			<Divider />
			<section className="h-full overflow-y-auto space-y-2">
				<WorkflowGroups filter={filter} />
			</section>
		</div>
	);
}

function WorkflowGroups({ filter }: { filter: string }) {
	const [data, { isLoading, isError, error }] = useWorkflowNodeTypes();

	const nodeGroups = useMemo(
		() =>
			groupBy(
				Object.values(data ?? {}).filter(({ name }) => name.toLowerCase().includes(filter.toLowerCase())),
				(k) => k.group,
			),
		[data, filter],
	);

	if (isError) {
		return <ErrorMessage error={error} />;
	}

	if (isLoading) {
		return (
			<Skeletons number={10}>
				<Skeleton className="h-16 w-full" />
			</Skeletons>
		);
	}

	return nodeGroups
		.sort((a, b) => a.key.localeCompare(b.key))
		.map((group, index) => (
			<React.Fragment key={group.key}>
				<WorkflowGroup group={group} />
				{index !== nodeGroups.length - 1 && <Divider />}
			</React.Fragment>
		));
}

function WorkflowGroup({ group: { key, value } }: { group: { key: string; value: WorkflowNodeType[] } }) {
	return (
		<div className="space-y-1">
			<h3 className="text-base capitalize">{key}</h3>
			{value
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((node) => (
					<WorkflowItem key={node.name} item={node} />
				))}
		</div>
	);
}

function WorkflowItem({ item: { name, color, fields, outputs } }: { item: WorkflowNodeType }) {
	const ref = useRef<HTMLDivElement>(null);

	const [_, drag] = useDrag({
		type: 'workflow',
		item: () => {
			return { id: name };
		},
		collect: (monitor: any) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	drag(ref);

	const consumers = fields.filter(({ consumer }) => consumer);
	const producers = fields.filter(({ producer }) => producer);

	return (
		<div className="p-2 bg-secondary/50 border rounded-md capitalize cursor-pointer select-none space-y-1" ref={ref}>
			<span className="font-semibold" style={{ color }}>
				{name}
			</span>
			{consumers.length > 0 && (
				<section className="flex gap-1 flex-wrap items-center text-xs">
					<ArrowRight className="size-4" />
					{consumers.map(({ name }) => (
						<span key={name} className="border border-emerald-400 text-white bg-emerald-800/50 rounded-full px-1.5">
							{name}
						</span>
					))}
				</section>
			)}
			{producers.length > 0 && (
				<section className="flex gap-1 flex-wrap items-center text-xs">
					<ArrowLeft className="size-4" />
					{producers.map(({ name }) => (
						<span key={name} className="border border-emerald-400 text-white bg-emerald-800/50 rounded-full px-1.5">
							{name}
						</span>
					))}
				</section>
			)}
			{outputs.length > 0 && (
				<section className="flex gap-1 flex-wrap items-center text-xs">
					<PlayIcon className="size-4" />
					{outputs.map(({ name }) => (
						<span
							className="border  border-white/70 text-white backdrop-blur-sm backdrop-brightness-75 rounded-full px-1.5"
							key={name}
						>
							{name}
						</span>
					))}
				</section>
			)}
		</div>
	);
}
