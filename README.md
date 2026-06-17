# typx-id

A tiny TypeScript utility for creating and managing type-prefixed, human-readable IDs (e.g. `t_01Jz4K8mA3f9bc`, `tm_x8k2f1`).

Schema-first: define your entity types and prefixes once via `configure()`, get back a fully typed toolkit.

Functional: Avoids using classes and OO mechanics. Does hold state in the config.

## Install

```sh
npm install type-id
```

## Quick start

**`src/ids.ts`** — define your entity types once:

```typescript
import { configure } from "type-id";

export const {
  newId,
  toType,
  toPrefix,
  toUniqPart,
  isTypeId,
  isTypeOf,
  extractIds,
} = configure({
  task: "t",
  user: ["tm", 6], // [prefix, idLength] — shorter IDs for users
  project: "p",
});
```

**Anywhere else in your project:**

```typescript
import { newId, toType, isTypeOf, extractIds } from "./ids";

// Generate IDs
const taskId = newId("task"); // "t_01Jz4K8mA3f9bc"
const userId = newId("user"); // "tm_x8k2f1"
const projId = newId("project"); // "p_01Jz4K8m9bc1a3"

// With your own suffix
newId("task", "my-custom-suffix"); // "t_my-custom-suffix"

// Inspect IDs
toType("t_01Jz4K8mA3f9bc"); // "task"
toType("unknown_foo"); // undefined

// Validate
isTypeId("t_01Jz4K8mA3f9bc"); // true
isTypeId("random string"); // false
isTypeOf("t_01Jz4K8mA3f9bc", "task"); // true
isTypeOf("p_01Jz4K8m9bc1a3", "task"); // false

// Extract IDs from text
extractIds("See t_01Jz4K8mA3f9bc and p_01Jz4K8m9bc1a3 for context.");
// ["t_01Jz4K8mA3f9bc", "p_01Jz4K8m9bc1a3"]
```

## API

### `configure(entityConfigs, config?)`

Main entry point. Returns a fully typed `Instance<T>`.

**`entityConfigs`**: `Record<T, string | [string, number]>`

Maps each entity type to its prefix, or a `[prefix, idLength]` tuple for per-type length control.

```typescript
configure({
  task: "t", // uses defaultLength
  user: ["tm", 6], // always 6 chars
  project: "p",
});
```

**`config`** (optional):

| Option          | Default                            | Description                                                                       |
| --------------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| `defaultLength` | `22`                               | Suffix character count (default is UUID-level entropy)                            |
| `generateId`    | time-ordered base62 (UUIDv7-style) | Custom `(length: number) => string` — inject `nanoid` or `crypto.randomUUID` here |

```typescript
import { nanoid } from "nanoid";

const ids = configure({ task: "t" }, { generateId: (len) => nanoid(len) });
```

### Methods on `Instance<T>`

| Method                 | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `newId(type, suffix?)` | Generate a new ID; optionally provide your own suffix          |
| `toType(id)`           | Extract entity type from ID string (`undefined` if unknown)    |
| `toPrefix(type)`       | Get the prefix string for a type                               |
| `isTypeId(id)`         | Returns `true` if string matches any registered prefix pattern |
| `isTypeOf(id, type)`   | Returns `true` if the ID belongs to the given type             |
| `toUniqPart(id)`       | Extract the unique suffix after the prefix                     |
| `extractIds(text)`     | Find all valid IDs embedded in a longer text string            |
| `HUMAN_ID_REGEX`       | Compiled global `RegExp` for matching IDs inline in text       |
| `HUMAN_ID_REGEX_EXACT` | Compiled global `RegExp` for exact full-string matching        |

## License

MIT
