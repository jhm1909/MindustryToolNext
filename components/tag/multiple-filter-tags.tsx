import React from 'react';
import { useCookies } from 'react-cookie';



import { FilterTag } from '@/components/tag/filter-tags';
import TagIcon from '@/components/tag/tag-icon';
import { TagName } from '@/components/tag/tag-name';
import { Separator } from '@/components/ui/separator';



import { SHOW_TAG_NAME_PERSISTENT_KEY, SHOW_TAG_NUMBER_PERSISTENT_KEY } from '@/constant/constant';
import { cn } from '@/lib/utils';
import { TagGroup } from '@/types/response/TagGroup';


type MultipleFilerTagsProps = {
	group: TagGroup;
	selectedValue: FilterTag[];
	handleTagGroupChange: (value: FilterTag[]) => void;
};

export default function MultipleFilerTags({ group, selectedValue, handleTagGroupChange }: MultipleFilerTagsProps) {
	const [{ showTagName, showTagNumber }] = useCookies([SHOW_TAG_NAME_PERSISTENT_KEY, SHOW_TAG_NUMBER_PERSISTENT_KEY]);

	const handleClick = (value: FilterTag) => {
		const index = selectedValue.map((v) => v.name).indexOf(value.name);
		if (index === -1) {
			handleTagGroupChange([...selectedValue, value]);
		} else {
			handleTagGroupChange([...selectedValue.slice(0, index), ...selectedValue.slice(index + 1)]);
		}
	};

	return (
		<div className="flex w-full flex-wrap justify-start py-2 gap-1">
			<TagName className="whitespace-nowrap text-lg capitalize">{`group-${group.name}`}</TagName>
			<Separator className="border-[1px]" orientation="horizontal" />
			{group.values.map((value) => (
				<button
					className={cn(
						'capitalize flex hover:scale-105 transition-all items-center bg-secondary gap-1 md:hover:bg-brand md:hover:text-brand-foreground text-muted-foreground data-[state=on]:bg-brand data-[state=on]:text-brand-foreground px-2 border border-border py-2 rounded-lg md:hover:border-brand',
						{
							'bg-brand text-brand-foreground border-brand': selectedValue.map((v) => v.name).includes(value.name),
						},
					)}
					type="button"
					key={value.name}
					onClick={() => handleClick(value)}
				>
					<TagIcon>{value.icon}</TagIcon>
					{(!value.icon || showTagName) && <TagName>{`${group.name}_${value.name}`}</TagName>}
					{showTagNumber && `(${value.count})`}
				</button>
			))}
		</div>
	);
}
