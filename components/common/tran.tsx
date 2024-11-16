'use client';

import React from 'react';

import { useI18n } from '@/i18n/client';

type Props = {
  className?: string;
  text: string;
  style?: React.CSSProperties;
  args?: Record<string, any>;
};

function InternalTran({ className, text, args, style }: Props): React.ReactNode {
  const t = useI18n();

  return (
    <span className={className} style={style} suppressHydrationWarning>
      {t(text, args)}
    </span>
  );
}

const Tran = React.memo(InternalTran);

export default Tran;
