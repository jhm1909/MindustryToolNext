'use client';

import { ThumbsUpIcon } from 'lucide-react';

import { ButtonProps } from '@/components/ui/button';
import { useLike } from '@/context/like-context';
import { cn } from '@/lib/utils';

type LikeButtonProps = Omit<ButtonProps, 'title'>;

export default function LikeButton({ className, ...props }: LikeButtonProps) {
  const { handleAction, likeData, isLoading } = useLike();

  return (
    <button
      className={cn('flex h-9 min-w-9 transiton-colors  items-center justify-center rounded-md border border-border p-2 hover:bg-success hover:text-background dark:hover:text-foreground', className, {
        'bg-success text-background dark:text-foreground': likeData?.state === 1,
      })}
      title="like"
      size="icon"
      variant="outline"
      {...props}
      disabled={isLoading}
      onClick={() => handleAction('LIKE')}
    >
      <ThumbsUpIcon className="size-5" />
    </button>
  );
}
