import postcss from 'postcss';
import type * as PostCSS from 'postcss';

import { REGEXP } from './libs/regexp';
import { Converter, converter } from './libs/converter';

type Plugin = (decl: PostCSS.Declaration, opts: Required<Options>) => void;
type Options = { skip?: string; breakpoints?: string[] };

const defaults: Required<Options> = {
  skip: '-',
  breakpoints: ['1000px', '750px'],
};
const SPLIT_REGEXP = REGEXP.SPLIT('|');

const sortBreakpoints = (breakpoints?: string[]): string[] => {
  if (!breakpoints) return defaults.breakpoints;
  return breakpoints.sort((a, b) => converter.unit(b).value - converter.unit(a).value);
};

type Responsive = {
  value: string;
  max?: string;
  min?: string;
};

const plugin: Plugin = (decl, { skip, breakpoints }) => {
  if (!decl.prop.match(/^\-{2}/) && decl.value.match(SPLIT_REGEXP)) {
    const values = decl.value.split(SPLIT_REGEXP);
    if (!values.find((value) => value !== skip)) {
      // if all values are skip, skip this decl
      decl.parent?.remove();
      return;
    }
    const bps = breakpoints.map((bp) => converter.unit(bp));
    const responsives: Responsive[] = values.map((value, i) => {
      if (value === skip) return { value };
      const numable = values.slice(i + 1).findIndex((v) => v !== skip);
      const minIdx = numable !== -1 ? numable + i : i;
      const min = i !== values.length - 1 ? `(min-width: ${bps[minIdx].value + 1}${bps[minIdx].unit || 'px'})` : '';
      const max = i === 0 ? '' : `(max-width: ${bps[i - 1].value}${bps[i - 1].unit || 'px'})`;
      return { value, min, max };
    });

    responsives.map(({ value: v, min, max }, i) => {
      if (v === skip) return;
      const and = min && max ? ' and ' : '';
      const mediaQuery = postcss.atRule({ name: 'media', params: `${min}${and}${max}` });
      const { value, important } = converter.imp(v);
      const newDecl = postcss.decl({
        prop: decl.prop,
        value,
        important: (decl.important && i === values.length - 1) || important,
      });
      mediaQuery.append(newDecl);
      decl.after(mediaQuery);
    });
    decl.remove();
  }
};

module.exports = (opts: Options): PostCSS.Plugin => {
  const options: Required<Options> = {
    ...defaults,
    ...opts,
    breakpoints: sortBreakpoints(opts.breakpoints),
  };

  return {
    postcssPlugin: 'postcss-responsive-easier',
    Once: (root) => {
      root.walkDecls((child) => {
        if (child.type === 'decl') plugin(child, options);
      });
    },
  };
};

module.exports.postcss = true;
