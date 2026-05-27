# type-id

A tiny TypeScript utility for creating and managing typed, prefixed human-readable IDs (e.g. `t_a3f9bc12`, `tm_x8k2`).

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
  isId,
  isTypeId,
  extractIds,
} = configure({
  task: "task",
  user: ["tm", 6], // [prefix, idLength] — shorter IDs for users
  project: "proj",
});
```

**Anywhere else in your project:**

```typescript
import { newId, toType, isTypeId, extractIds } from "./ids";

// Generate IDs
const taskId = newId("task"); // "task_01Jz4K8mA3f9bc"
const userId = newId("user"); // "tm_x8k2f1"
const projId = newId("project"); // "proj_01Jz4K8m9bc1a3"

// With your own suffix
newId("task", "my-custom-suffix"); // "task_my-custom-suffix"

// Inspect IDs
toType("task_01Jz4K8mA3f9bc"); // "task"
toType("unknown_foo"); // undefined

// Validate
isId("task_01Jz4K8mA3f9bc"); // true
isId("random string"); // false
isTypeId("task")("task_01Jz4K8mA3f9bc"); // true
isTypeId("task")("proj_01Jz4K8m9bc1a3"); // false

// Filter arrays by type
const mixed = ["task_aaa11111", "proj_bbb22222", "task_ccc33333"];
mixed.filter(isTypeId("task")); // ["task_aaa11111", "task_ccc33333"]

// Extract IDs from text
extractIds("See task_01Jz4K8mA3f9bc and proj_01Jz4K8m9bc1a3 for context.");
// ["task_01Jz4K8mA3f9bc", "proj_01Jz4K8m9bc1a3"]
```

## API

### `configure(entityConfigs, config?)`

Main entry point. Returns a fully typed `Instance<T>`.

**`entityConfigs`**: `Record<T, string | [string, number]>`

Maps each entity type to its prefix, or a `[prefix, idLength]` tuple for per-type length control.

```typescript
configure({
  task: "task", // uses defaultLength
  user: ["tm", 6], // always 6 chars
  project: "proj",
});
```

**`config`** (optional):

| Option          | Default                      | Description                                                                       |
| --------------- | ---------------------------- | --------------------------------------------------------------------------------- |
| `defaultLength` | `8`                          | Random suffix character count                                                     |
| `generateId`    | `Math.random().toString(36)` | Custom `(length: number) => string` — inject `nanoid` or `crypto.randomUUID` here |

```typescript
import { nanoid } from "nanoid";

const ids = configure({ task: "task" }, { generateId: (len) => nanoid(len) });
```

### Methods on `Instance<T>`

| Method                 | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `newId(type, suffix?)` | Generate a new ID; optionally provide your own suffix          |
| `toType(id)`           | Extract entity type from ID string (`undefined` if unknown)    |
| `toPrefix(type)`       | Get the prefix string for a type                               |
| `isId(id)`             | Returns `true` if string matches any registered prefix pattern |
| `isTypeId(type)(id)`   | Curried type predicate — useful for array `.filter()`          |
| `toUniqPart(id)`       | Extract the unique suffix after the prefix                     |
| `extractIds(text)`     | Find all valid IDs embedded in a longer text string            |
| `HUMAN_ID_REGEX`       | Compiled global `RegExp` for matching IDs inline in text       |
| `HUMAN_ID_REGEX_EXACT` | Compiled global `RegExp` for exact full-string matching        |

## License

MIT
