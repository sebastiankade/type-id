import { EntityConfig, Maybe, Config, Instance, Prefix, ID } from "./types";
import { generateId, MAX_SUFFIX_LENGTH } from "./defaults";

export const configure = <T extends string | symbol>(
  entityConfigs: Record<T, EntityConfig>,
  config: Config = {},
): Instance<T> => {
  // Apply the defaults
  const finalConfig = {
    generateId,
    defaultLength: MAX_SUFFIX_LENGTH,
    ...config,
  };

  const typeToPrefix = {} as Record<T, Prefix>;
  const typeToLength = {} as Record<T, number>;
  const prefixToType = {} as Record<Prefix, T>;

  Object.entries(entityConfigs).forEach(([type, config]) => {
    const [prefix, length] = Array.isArray(config)
      ? config
      : [config, finalConfig.defaultLength];

    typeToPrefix[type as T] = prefix;
    typeToLength[type as T] = length;
    prefixToType[prefix] = type as T;
  });

  const prefixes = Object.keys(prefixToType).join("|");
  const buildRegex = (exact: boolean = false) => {
    const pattern = `${exact ? "^" : "\\b"}(${prefixes})_[a-zA-Z0-9]{4,}${exact ? "$" : "\\b"}`;
    return new RegExp(pattern, "g");
  };

  const HUMAN_ID_REGEX = buildRegex(false);
  const HUMAN_ID_REGEX_EXACT = buildRegex(true);

  const newId = (type: T, suffix?: string): ID => {
    const prefix = typeToPrefix[type];
    if (!prefix) throw new Error(`Unknown entity type: ${String(type)}`);
    const id = suffix || finalConfig.generateId(typeToLength[type]);
    return `${prefix}_${id}`;
  };

  const toType = (id: Maybe<ID>): Maybe<T> => {
    if (!id) return undefined;
    return prefixToType[id.split("_")[0]] as Maybe<T>;
  };

  const toPrefix = (type: T): Prefix => typeToPrefix[type];

  const toUniqPart = (id: Maybe<ID>): Maybe<string> => {
    if (!id) return undefined;
    const parts = id.split("_");
    return parts.length < 2 ? undefined : parts.slice(1).join("_");
  };

  const isTypeId = (id: Maybe<string>): boolean =>
    !!id && !!id.match(HUMAN_ID_REGEX_EXACT);

  const isTypeOf = (id: string, type: T): boolean => toType(id) === type;

  const extractIds = (text: string): string[] =>
    text.match(HUMAN_ID_REGEX)?.filter(Boolean) ?? [];

  return {
    HUMAN_ID_REGEX,
    HUMAN_ID_REGEX_EXACT,
    newId,
    toPrefix,
    toUniqPart,
    toType,
    isTypeId,
    isTypeOf,
    extractIds,
  };
};
