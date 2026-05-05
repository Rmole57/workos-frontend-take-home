# WorkOS Frontend Take-Home — Users & Roles

A small dashboard for managing users and roles, built against the take-home Express API in [`server/`](./server).

## Tech stack

- **Vite + React 19 + TypeScript** — single-page app, no SSR needed.
- **Radix Themes** — UI library; matches the components linked from the Figma file (Tabs, Button, TextField, AlertDialog, …) and ships full keyboard / ARIA support.
- **TanStack Query + Table** — server state (caching, retries against the API's intentional 5% random 500s) and a headless row/header model so column definitions live as data and stay open to sortable / hide-able / selectable extensions.
- **React Router** — `/users` and `/roles` are real routes so tabs deep-link and the back button works; search and page also live in the URL.
- **Sonner** — minimal toasts for mutation feedback.

## Notable decisions

### TanStack Query for server state

What it gets us today:

- **Retry against the API's intentional 5% 500s** (`retry: 2` with backoff).
- **`placeholderData: keepPreviousData`** for paginated views — the previous page stays painted while the next one fetches, so page transitions don't blink to a skeleton.
- **Optimistic mutations with rollback** for delete user, edit user, edit role, and set-default. The UI reflects the change immediately; on failure the snapshot restores and a toast explains why.
- **Hierarchical query-key factories** (`userKeys.all`, `roleKeys.paged({ page, search })`). A single `invalidateQueries({ queryKey: roleKeys.all })` cascades to every cached page/search variant — no bookkeeping of which pages are live.

### TanStack Table for the table model

I picked the headless TanStack model on top of Radix Themes' table primitives because, in my opinion, sorting and filtering aren't really "nice-to-haves" on a list view; they're inevitably the next thing you'll be asked for. Without a structured column model, that future ask means rewriting the table. With it, it's plumbing UI into APIs that already exist (`getSortedRowModel`, `getFilteredRowModel`, column visibility, row selection).

What it gets us today:

- **Column definitions live as data** (`ColumnDef<T>[]`). Header, cell renderer, accessor, and meta props (e.g. the `aria-label` on the actions column) are co-located, so a column reads as one unit.
- **One `DataTable` for users *and* roles.** The shell is generic over `T`; only the `columns` array differs per page. Adding a column is appending an entry; removing is deleting one.
- **Module-augmented `ColumnMeta`** lets us pass Radix-shaped props (cell width, alignment, etc.) through column config without one-off branches in the renderer.

## Prerequisites

- Node 20+ (Vite 8 requires it; `nvm use --lts` if you have nvm)
- npm 10+

## Run it

The backend and frontend run as separate processes. Open two terminals.

**Terminal 1 — API (`http://localhost:3002`)**

```bash
cd server
npm install
npm run api
```

The API simulates 500ms–2s latency and a 5% chance of returning a `500`. To turn either off:

```bash
SERVER_SPEED=instant npm run api   # no latency
```

**Terminal 2 — Web client (`http://localhost:4173`)**

```bash
cd client
npm install
npm run start
```

## Useful scripts (in `client/`)

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Vite dev server with HMR                      |
| `npm run build`    | Type-check (`tsc -b`) and produce a prod bundle |
| `npm run preview`  | Serve the prod build locally                  |
| `npm run lint`     | ESLint over `src/`                            |
| `npm run start`   | Build, type-check, and serve the production bundle on `:4173` |

## Project layout

```
.
├── client/                # Vite + React UI (this is where the take-home work lives)
└── server/                # provided Express API — do not modify
```

## What I'd improve with more time

- **Roles parity with Users (create + delete).** Roles currently supports edit and set-default; users have full CRUD. Adding `<AddRoleDialog>` and `<DeleteRoleDialog>` would round it out using the same hooks/optimistic patterns the user CRUD already uses. One thing to note for role deletion is the backend reassigns the role's users to the new default server-side — that needs a confirm dialog that calls it out so the user isn't surprised.

- **Sortable headers + filter chips on the users table (especially "filter by role").** Worth flagging why I held off rather than just shipping client-side sort: the API doesn't expose `?sort=...` or `?filter=...`, and a client-only implementation has two unappealing options:

  - **Sort/filter the current page only** — gives a misleading "alphabetical" order that's actually "alphabetical *within this page*". A user looking for someone alphabetically lands on page 1 and is confused when the name turns out to be on page 4.
  - **Fetch all records and paginate client-side** — works correctly but throws away the point of server pagination and degrades as the dataset grows.

  The right move is to wait until the API takes those params and then enable the column features TanStack Table is already pre-positioned for (`getSortedRowModel`, `manualSorting: true`, etc.). The column-config refactor was done with this in mind.

- **Stable row count during delete refetch.** When you delete a user, the optimistic update removes the row, the table shrinks by one row's height, the refetch returns the next user to fill the gap, and the table grows back. It's a small but visible blip. Two reasonable fixes:

  - **Reserve vertical space during the delete refetch.** Render empty "spacer rows" so total tbody height is constant: when the rendered row count drops below `pageSize`, fill the remainder with `aria-hidden` empty rows.
  - **Don't remove optimistically.** Render the row in a "removing" state (dimmed, dropdown disabled) and let the refetch produce the final layout. Cheaper, slightly less optimistic-feeling.

- **Generate a full custom 12-step accent palette** from `#6565EC` instead of overriding only `--accent-9` on top of the iris scale. Currently hover/pressed states pull from iris; with a generated scale the entire interaction model would be on-brand. Radix has a [generator](https://www.radix-ui.com/colors/custom) that outputs the right values.

- **Custom page sizes.** Introduce page number count and custom page size selection in pagination table footer. At that point it would be worth extracting to a Pagination component.

- **Tests.** Component tests for the dialogs (delete confirmation, edit dialogs) and integration tests for the optimistic mutations + rollback paths via Vitest + Testing Library.
