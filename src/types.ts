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
  isTypeId: (id: Maybe<string>) => boolean;
  toUniqPart: (id: Maybe<ID>) => Maybe<string>;
  isTypeOf: (id: string, type: T) => boolean;
  extractIds: (text: string) => ID[];
}
