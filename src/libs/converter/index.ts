export const converter = {
  unit: (str: string) => {
    return { value: Number(str.replaceAll(/[^\d]+/g, '')), unit: str.replaceAll(/\d+/g, '') };
  },
  imp: (str: string) => {
    return { value: str.replace(/!important/, ''), important: str.includes('!important') };
  },
  wrap: (str: string) => {
    if (str === '（') return '(';
    if (str === '）') return ')';
    if (str === '(') return '（';
    if (str === ')') return '）';
    return str;
  },
};

export type Converter = typeof converter;
