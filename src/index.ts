import postcss from 'postcss';
import type * as PostCSS from 'postcss';

import { REGEXP } from './libs/regexp';
import { Converter, converter } from './libs/converter';

type Plugin = (decl: PostCSS.Declaration, opts: Required<Options>) => void;
type Options = { skip?: string; breakpoints?: string[] };

const defaults: Required<Options> = { skip: '-', breakpoints: ['1000px', '750px'] };

const SPLIT_REGEXP = REGEXP.SPLIT('|');

type Responsive = {
  value: string;
  max?: string;
  min?: string;
};

const makeResponsive = (values: string[], skip: string, bps: ReturnType<Converter['unit']>[]): Responsive[] => {
  return values.map((value, i) => {
    if (value === skip) return { value };
    const numable = values.slice(i + 1).findIndex((v) => v !== skip);
    const minIdx = numable !== -1 ? numable + i : i;
    const min = i !== values.length - 1 ? `(min-width: ${bps[minIdx].value + 1}${bps[minIdx].unit || 'px'})` : '';
    const max = i === 0 ? '' : `(max-width: ${bps[i - 1].value}${bps[i - 1].unit || 'px'})`;
    return { value, min, max };
  });
};

const makeCalcResponsive = (formulas: string[], skip: string, bps: ReturnType<Converter['unit']>[]): Responsive[][] => {
  let maxSum = 0;
  let resObjIdx = 0;

  return formulas
    .filter((fomula, idx) => {
      if (
        !(formulas[idx + 1] && formulas[idx + 1].match(SPLIT_REGEXP)) &&
        !(formulas[idx - 1] && formulas[idx - 1].match(SPLIT_REGEXP))
      ) {
        return fomula;
      }
    })
    .map((fomula) => {
      if (fomula.match(SPLIT_REGEXP)) {
        const values = fomula.split(SPLIT_REGEXP);

        if (values.length - 1 !== bps.length) {
          throw new Error(`You must set ${bps.length + 1} values for each breakpoint.`);
        }

        const sum = values.reduce((acc, cur, i) => (cur === skip ? acc : acc + i + 1), 0);

        if (resObjIdx !== 0 && maxSum !== sum) {
          throw new Error(
            'You must set a value for same breakpoint. If you want to set a value for a breakpoint, You can set like below.\n```\nfont-size: - | calc(100vw / 100 * 1px) | - ;\n```',
          );
        }

        maxSum = sum;
        resObjIdx++;

        return makeResponsive(values, skip, bps);
      }
      return [{ value: converter.wrap(fomula), min: '', max: '' }];
    });
};

const createMediaQuery = (min?: string, max?: string) => {
  const and = min && max ? ' and ' : '';
  return postcss.atRule({ name: 'media', params: `${min}${and}${max}` });
};

const plugin: Plugin = (decl, { skip, breakpoints }) => {
  if (!decl.prop.match(/^\-{2}/) && decl.value.match(SPLIT_REGEXP)) {
    const bps = breakpoints.map((bp) => converter.unit(bp)).sort((a, b) => b.value - a.value);
    const fnExist = decl.value.match(REGEXP.FN);
    const values = decl.value.split(SPLIT_REGEXP);
    const responsives: Responsive[] = [];

    if (!values.slice(1).some((v) => v.match(REGEXP.FN_NAME)) && fnExist) {
      const [, fn, params] = fnExist;
      const wrappedFormula = params
        .replaceAll(/\(/g, '（')
        .replaceAll(/\)/g, '）')
        .split(REGEXP.WRAP)
        .filter((formula, idx) => formula !== '');
      const calcResponsives = makeCalcResponsive(wrappedFormula, skip, bps);

      responsives.push(
        ...new Array(bps.length + 1).fill(null).map((_, idx) => {
          if (calcResponsives.find((r) => r[idx] && r[idx].value === skip)) return { value: skip };
          const min = calcResponsives.find((r) => (r[idx] || r[0]).min);
          const max = calcResponsives.find((r) => (r[idx] || r[0]).max);
          return {
            value: `${fn}(${calcResponsives.reduce((acc, curt) => acc + (curt[idx] || curt[0]).value, '')})`,
            min: (min && min[idx].min) || '',
            max: (max && max[idx].max) || '',
          };
        }),
      );
    } else {
      if (values.length - 1 !== bps.length) {
        throw new Error(`You must set ${bps.length + 1} values as breakpoints are ${breakpoints}`);
      }
      if (!values.find((value) => value !== skip)) {
        // if all values are skip, skip this decl
        decl.parent?.remove();
        return;
      }

      responsives.push(...makeResponsive(values, skip, bps));
    }

    responsives.map(({ value: v, min, max }, i) => {
      if (v === skip) return;
      const { value, important } = converter.imp(v);

      const mediaQuery = createMediaQuery(min, max);
      const newDecl = postcss.decl({
        prop: decl.prop,
        value,
        important: fnExist ? decl.important : (decl.important && i === bps.length) || important,
      });
      mediaQuery.append(newDecl);
      decl.after(mediaQuery);
    });
    decl.remove();
  }
};

module.exports = (opts: Options): PostCSS.Plugin => {
  const options = { ...defaults, ...opts };

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
