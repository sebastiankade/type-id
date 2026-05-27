# entity-id

A tiny TypeScript utility for creating and managing typed, prefixed human-readable IDs (e.g. `task_a3f9bc12`, `tm_x8k2`).

Schema-first: define your entity types and prefixes once via `configure()`, get back a fully typed toolkit.

## Install

```sh
npm install entity-id
```

## Quick start

```typescript
import { configure } from "entity-id";

const ids = configure({
  task:    "task",
  user:    ["tm", 6],      // [prefix, idLength] — shorter IDs for users
  project: "proj",
});

// Generate IDs
const taskId = ids.newId("task");           // "task_a3f9bc12"
const userId = ids.newId("user");           // "tm_x8k2f1"
const projId = ids.newId("project");        // "proj_9bc1a3f2"

// With your own suffix
ids.newId("task", "my-custom-suffix");      // "task_my-custom-suffix"

// Inspect IDs
ids.toType("task_a3f9bc12");               // "task"
ids.toType("unknown_foo");                  // undefined
ids.toPrefix("user");                       // "tm"
ids.toUniqPart("task_a3f9bc12");           // "a3f9bc12"

// Validate
ids.isId("task_a3f9bc12");                 // true
ids.isId("random string");                  // false
ids.isTypeId("task")("task_a3f9bc12");     // true
ids.isTypeId("task")("proj_9bc1a3f2");     // false

// Filter arrays by type
const mixed = ["task_aaa11111", "proj_bbb22222", "task_ccc33333"];
mixed.filter(ids.isTypeId("task"));         // ["task_aaa11111", "task_ccc33333"]

// Extract IDs from text
ids.extractIds("See task_a3f9bc12 and proj_9bc1a3f2 for context.");
// ["task_a3f9bc12", "proj_9bc1a3f2"]
```

## API

### `configure(entityConfigs, config?)`

Main entry point. Returns a fully typed `Instance<T>`.

**`entityConfigs`**: `Record<T, string | [string, number]>`

Maps each entity type to its prefix, or a `[prefix, idLength]` tuple for per-type length control.

```typescript
configure({
  task:    "task",        // uses defaultLength
  user:    ["tm", 6],     // always 6 chars
  project: "proj",
});
```

**`config`** (optional):

| Option | Default | Description |
|--------|---------|-------------|
| `defaultLength` | `8` | Random suffix character count |
| `generateId` | `Math.random().toString(36)` | Custom `(length: number) => string` — inject `nanoid` or `crypto.randomUUID` here |

```typescript
import { nanoid } from "nanoid";

const ids = configure(
  { task: "task" },
  { generateId: (len) => nanoid(len) }
);
```

### Methods on `Instance<T>`

| Method | Description |
|--------|-------------|
| `newId(type, suffix?)` | Generate a new ID; optionally provide your own suffix |
| `toType(id)` | Extract entity type from ID string (`undefined` if unknown) |
| `toPrefix(type)` | Get the prefix string for a type |
| `isId(id)` | Returns `true` if string matches any registered prefix pattern |
| `isTypeId(type)(id)` | Curried type predicate — useful for array `.filter()` |
| `toUniqPart(id)` | Extract the unique suffix after the prefix |
| `extractIds(text)` | Find all valid IDs embedded in a longer text string |
| `HUMAN_ID_REGEX` | Compiled global `RegExp` for matching IDs inline in text |
| `HUMAN_ID_REGEX_EXACT` | Compiled global `RegExp` for exact full-string matching |

## License

MIT
