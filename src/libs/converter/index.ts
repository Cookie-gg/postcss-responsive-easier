export const converter = {
  unit: (str: string) => {
    return { value: Number(str.replaceAll(/[^\d]+/g, '')), unit: str.replaceAll(/\d+/g, '') };
  },
  imp: (str: string) => {
    return { value: str.replace(/!important/, ''), important: str.includes('!important') };
  },
};

export type Converter = typeof converter;
