import React, { ReactNode, useMemo } from 'react';



import { cn, getColor } from '@/lib/utils';


const COLOR_REGEX = /\[([#a-zA-Z0-9]*)\]|\u001b\[([0-9]+)m/g;

type ColorTextProps = {
  text?: string;
  className?: string;
};

export default function ColorText({ text, className }: ColorTextProps) {
  const result = useMemo(() => render(text), [text]);

  return <span className={cn(className)}>{result}</span>;
}

function render(text?: string) {
  if (!text) return <></>;

  const index = text.search(COLOR_REGEX);
  let key = 0;

  if (index < 0) return <span>{text}</span>;

  const result: ReactNode[] = [];

  if (index !== 0) {
    key = add(result, text.substring(0, index), '', key);
    text = text.substring(index);
  }

  const arr = text.match(COLOR_REGEX);

  if (!arr) return <span>{text}</span>;

  while (arr.length > 0) {
    let color = arr[0].toLocaleLowerCase();
    color = color.substring(1, color.length - 1);

    if (color.startsWith('#')) {
      color = color.padEnd(7, '0');
    } else {
      color = getColor(color);
    }

    if (arr.length === 1) {
      if (color) {
        key = add(result, text.substring(arr[0].length), color, key);
      } else {
        key = add(result, text, '', key);
      }
      break;
    }

    const nextIndex = text.indexOf(arr[1], arr[0].length);

    if (color) {
      key = add(result, text.substring(arr[0].length, nextIndex), color, key);
    } else {
      key = add(result, text.substring(0, nextIndex), '', key);
    }
    text = text.substring(nextIndex);
    arr.shift();
  }

  return result;
}
function add(result: ReactNode[], text: string, color: string, key: number) {
  const r = breakdown(text, color, key);
  result.push(...r.result);
  key = r.key;
  return key;
}

function breakdown(text: string, color: string, key: number) {
  if (text === '[]') {
    return { result: [], key };
  }

  const s = text.split('\n');
  const r = [];
  key += 1;

  if (s.length === 1) {
    return {
      result: [
        <span key={key} style={{ color: color }}>
          {text}
        </span>,
      ],
      key,
    };
  }

  r.push(
    <span key={key} style={{ color: color }}>
      {s[0]}
    </span>,
  );

  for (let i = 1; i < s.length; i++) {
    key += 1;
    r.push(<br key={key} />);

    key += 1;
    r.push(
      <span key={key} style={{ color: color }}>
        {s[i]}
      </span>,
    );
  }
  return { result: r, key };
}
