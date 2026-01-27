# Minimal Template

This is a [React Native](https://reactnative.dev/) project built with [Expo](https://expo.dev/) and [React Native Reusables](https://reactnativereusables.com).

It was initialized using the following command:

```bash
npx @react-native-reusables/cli@latest init -t design-prototypes
```

## Getting Started

To run the development server:

```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
```

This will start the Expo Dev Server. Open the app in:

- **iOS**: press `i` to launch in the iOS simulator _(Mac only)_
- **Android**: press `a` to launch in the Android emulator
- **Web**: press `w` to run in a browser

You can also scan the QR code using the [Expo Go](https://expo.dev/go) app on your device. This project fully supports running in Expo Go for quick testing on physical devices.

## Adding components

You can add more reusable components using the CLI:

```bash
npx react-native-reusables/cli@latest add [...components]
```

> e.g. `npx react-native-reusables/cli@latest add input textarea`

If you don't specify any component names, you'll be prompted to select which components to add interactively. Use the `--all` flag to install all available components at once.

## Project Features

- ⚛️ Built with [Expo Router](https://expo.dev/router)
- 🎨 Styled with [Tailwind CSS](https://tailwindcss.com/) via [Nativewind](https://www.nativewind.dev/)
- 📦 UI powered by [React Native Reusables](https://github.com/founded-labs/react-native-reusables)
- 🚀 New Architecture enabled
- 🔥 Edge to Edge enabled
- 📱 Runs on iOS, Android, and Web

## DataTable usage patterns

The DataTable is designed to work in both client-side and server-side modes.

### Client-side (local data)

```tsx
import * as React from 'react';
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  createSelectionColumn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type DataTableColumnDef,
  type SortingState,
} from '@/components/ui/data-table';

type Payment = { id: string; amount: number; status: string; email: string };

const columns: DataTableColumnDef<Payment>[] = [
  createSelectionColumn<Payment>(),
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'amount', header: 'Amount' },
];

function PaymentsTable({ data }: { data: Payment[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <DataTableToolbar table={table} filters={[{ columnId: 'email' }]} showViewOptions />
      <DataTable table={table} striped />
      <DataTablePagination table={table} />
    </>
  );
}
```

### Server-side (API-driven)

```tsx
import * as React from 'react';
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  createSelectionColumn,
  getCoreRowModel,
  useReactTable,
  type ColumnFiltersState,
  type DataTableColumnDef,
  type SortingState,
} from '@/components/ui/data-table';

type Payment = { id: string; amount: number; status: string; email: string };

const columns: DataTableColumnDef<Payment>[] = [
  createSelectionColumn<Payment>(),
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'amount', header: 'Amount' },
];

function PaymentsTableServer() {
  const [data, setData] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pageCount, setPageCount] = React.useState(-1); // unknown total pages
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  React.useEffect(() => {
    let isActive = true;
    setLoading(true);

    const sort = encodeURIComponent(JSON.stringify(sorting));
    const filters = encodeURIComponent(JSON.stringify(columnFilters));

    void fetch(
      `/api/payments?page=${pagination.pageIndex}&pageSize=${pagination.pageSize}&sort=${sort}&filters=${filters}`
    )
      .then((res) => res.json())
      .then((result) => {
        if (!isActive) return;
        setData(result.rows);
        setPageCount(result.pageCount ?? -1);
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [pagination, sorting, columnFilters]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <DataTableToolbar table={table} filters={[{ columnId: 'email' }]} showViewOptions />
      <DataTable table={table} loading={loading} striped />
      <DataTablePagination table={table} />
    </>
  );
}
```

## Learn More

To dive deeper into the technologies used:

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Nativewind Docs](https://www.nativewind.dev/)
- [React Native Reusables](https://reactnativereusables.com)

## Deploy with EAS

The easiest way to deploy your app is with [Expo Application Services (EAS)](https://expo.dev/eas).

- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Updates](https://docs.expo.dev/eas-update/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

---

If you enjoy using React Native Reusables, please consider giving it a ⭐ on [GitHub](https://github.com/founded-labs/react-native-reusables). Your support means a lot!
