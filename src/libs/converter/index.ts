export const converter = {
  unit: (str: string) => {
    return { value: Number(str.replaceAll(/[^\d]+/g, '')), unit: str.replaceAll(/\d+/g, '') };
  },
  rgb: (str: string): string => {
    if (str.match(/^rgba\(/)) return str;
    else return str.replace(/^rgb\(/, '').replace(/\)$/, '');
  },
  imp: (str: string) => {
    return { value: str.replace(/!important/, ''), important: str.includes('!important') };
  },
  prop: (prop: string, key: string): string => {
    return `${prop}${key.includes('\\') ? '' : '-'}${key}`;
  },
};

export type Converter = typeof converter;
