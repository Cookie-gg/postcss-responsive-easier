import postcss from 'postcss';
import type * as PostCSS from 'postcss';

import { REGEXP } from './libs/regexp';
import { converter } from './libs/converter';

type Plugin = (decl: PostCSS.Declaration, opts: Required<Options>) => void;
type Options = { skip?: string; breakpoints?: string[] };

const defaults: Required<Options> = {
  skip: '*',
  breakpoints: ['1000px', '750px'],
};
const SPLIT_REGEXP = REGEXP.SPLIT('|');

const plugin: Plugin = (decl, { skip, breakpoints }) => {
  if (!decl.prop.match(/^\-{2}/) && decl.value.match(SPLIT_REGEXP)) {
    const values = decl.value.split(SPLIT_REGEXP);
    const bps = breakpoints.map((bp) => converter.unit(bp));
    values.slice(1).map((value, i) => {
      if (value === skip) return;
      const mediaQuery = postcss.atRule({
        name: 'media',
        params: `${bps[i + 1] ? `(min-width: ${bps[i + 1].value + 1}${bps[i + 1].unit}) and ` : ''}(max-width: ${
          breakpoints[i]
        })`,
      });
      const newDecl = postcss.decl({
        prop: decl.prop,
        value,
        important: decl.important && i === values.length - 2,
      });
      mediaQuery.append(newDecl);
      decl.after(mediaQuery);
    });
    if (values[0] === skip) {
      decl.remove();
    } else decl.value = values[0];
    if (decl.important) decl.important = false;
  }
};

module.exports = (opts: Options): PostCSS.Plugin => {
  const options = { ...defaults, ...opts };
  return {
    postcssPlugin: 'postcss-responsive-easier',
    Rule: (rule) => {
      rule.each((child) => child.type === 'decl' && plugin(child, options));
    },
  };
};

module.exports.postcss = true;
