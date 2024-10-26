import React from 'react';

import UploadSchematicDetailCard from '@/components/schematic/upload-schematic-detail-card';
import { getSchematicUpload } from '@/query/schematic';
import { Metadata } from 'next/dist/types';
import env from '@/constant/env';
import Tran from '@/components/common/tran';
import BackButton from '@/components/ui/back-button';
import { isError } from '@/lib/utils';
import { serverApi } from '@/action/action';
import ErrorScreen from '@/components/common/error-screen';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const schematic = await serverApi((axios) => getSchematicUpload(axios, { id }));

  if (isError(schematic)) {
    return { title: 'Error' };
  }
  return {
    title: `${env.webName} > Schematic`,
    description: `${schematic.name} | ${schematic.description}`,
    openGraph: {
      title: schematic.name,
      description: schematic.description,
      images: `${env.url.image}schematic-previews/${schematic.id}${env.imageFormat}`,
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const schematic = await serverApi((axios) => getSchematicUpload(axios, { id }));

  if (isError(schematic)) {
    return <ErrorScreen error={schematic} />;
  }

  if (schematic.isVerified === true) {
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background">
        <Tran text="admin.item-has-been-verified" />
        <BackButton />
      </div>
    );
  }

  return <UploadSchematicDetailCard schematic={schematic} />;
}
