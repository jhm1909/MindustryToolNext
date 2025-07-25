import { XIcon } from 'lucide-react';
import React, { HTMLAttributes, useCallback } from 'react';



import TagIcon from '@/components/tag/tag-icon';
import { TagName } from '@/components/tag/tag-name';



import { cn } from '@/lib/utils';
import { DetailTagDto, Tag, Tags } from '@/types/response/Tag';


type TagBadgeProps = HTMLAttributes<HTMLSpanElement> & {
	tag: DetailTagDto;
	onDelete?: (tag: Tag) => void;
};

export default TagBadge;

function TagBadge({ tag: tagDetail, className, onDelete, ...props }: TagBadgeProps) {
	const tag = Tags.parseString(tagDetail);
	const { name, icon, color, value } = tag;

	const hasDelete = !!onDelete;

	const handleOnDelete = useCallback(
		(value: Tag) => {
			if (onDelete) onDelete(value);
		},
		[onDelete],
	);

	return (
		<div
			className={cn(
				'flex cursor-pointer items-center gap-0.5 flex-nowrap whitespace-nowrap rounded-full px-2 py-1 text-center text-xs text-brand-foreground group',
				className,
			)}
			style={{ backgroundColor: color }}
			onClick={() => handleOnDelete(tag)}
			{...props}
		>
			<TagIcon>{icon}</TagIcon>
			<TagName>{`${name}_${value}`}</TagName>
			{hasDelete && <XIcon className="size-4 group-hover:block group-focus:block hidden" />}
		</div>
	);
}
