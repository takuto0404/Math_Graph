"use client";

import katex from "katex";

type FormulaProps = {
  latex: string;
  block?: boolean;
  className?: string;
};

export function Formula({ latex, block = false, className }: FormulaProps) {
  const html = katex.renderToString(latex, {
    displayMode: block,
    throwOnError: false,
    strict: "ignore",
  });

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
