export const converter = {
  unit: (str: string) => {
    return { value: Number(str.replaceAll(/[^\d]+/g, '')), unit: str.replaceAll(/\d+/g, '') };
  },
  rgb: (str: string): string => {
    if (str.match(/^rgba\(/)) return str;
    else return str.replace(/^rgb\(/, '').replace(/\)$/, '');
  },
  prop: (prop: string, key: string): string => {
    return `${prop}${key.includes('\\') ? '' : '-'}${key}`;
  },
};
