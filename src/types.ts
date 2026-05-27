export type Maybe<T> = T | undefined;
export type ID = string;
export type Prefix = string;
export type EntityConfig = Prefix | [Prefix, number];

export interface Config {
  generateId?: (length: number) => string;
  defaultLength?: number;
}

export interface Instance<T> {
  HUMAN_ID_REGEX: RegExp;
  HUMAN_ID_REGEX_EXACT: RegExp;
  newId: (type: T, suffix?: string) => ID;
  toType: (id: Maybe<ID>) => Maybe<T>;
  toPrefix: (type: T) => Prefix;
  isId: (id: Maybe<string>) => boolean;
  toUniqPart: (id: Maybe<ID>) => Maybe<string>;
  isTypeId: (type: T) => (id: string) => boolean;
  extractIds: (text: string) => ID[];
}
