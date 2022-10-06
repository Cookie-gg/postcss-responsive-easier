export const REGEXP = {
  CUSTOM_PROPERTY: /^\-{2}/,
  // SPLIT: (syntax: string, flags?: string) => new RegExp(`\\s*\\${syntax}\\s*`, flags),
  SPLIT: /\s*\|\s*/,
  FN: /^(v?calc|v?rgb[a]?|var)\((.*?)\)$/,
  FN_NAME: /(v?calc|v?rgb[a]?|var)/,
  WRAP: /(（|）)/g,
};
