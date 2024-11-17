import { useRouter } from 'next/navigation';
import React from 'react';

import VerifyButton from '@/components/button/verify-button';
import Tran from '@/components/common/tran';
import useClientApi from '@/hooks/use-client';
import useQueriesData from '@/hooks/use-queries-data';
import { useToast } from '@/hooks/use-toast';
import { verifyMap } from '@/query/map';
import VerifyMapRequest from '@/types/request/VerifyMapRequest';
import TagGroup, { TagGroups } from '@/types/response/TagGroup';

import { useMutation } from '@tanstack/react-query';

type VerifyMapButtonProps = {
  id: string;
  name: string;
  selectedTags: TagGroup[];
};
export default function VerifyMapButton({ id, name, selectedTags }: VerifyMapButtonProps) {
  const { invalidateByKey } = useQueriesData();
  const { toast } = useToast();
  const { back } = useRouter();
  const axios = useClientApi();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VerifyMapRequest) => verifyMap(axios, data),
    onSuccess: () => {
      back();
      toast({
        title: <Tran text="verify-success" />,
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: <Tran text="verify-fail" />,
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      invalidateByKey(['maps']);
    },
  });

  return (
    <VerifyButton
      description={<Tran text="verify-alert" args={{ name }} />}
      isLoading={isPending}
      onClick={() =>
        mutate({
          id: id,
          tags: TagGroups.toStringArray(selectedTags),
        })
      }
    />
  );
}
