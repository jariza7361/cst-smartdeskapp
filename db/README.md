# Database Migrations

## Prechecks
- Confirm you are connected to the correct database instance and schema.

## Apply
Run:

```sh
psql < db/migrations/2025-08-14_add_change.sql
```

## Roll back
If supported, run:

```sh
psql < db/migrations/2025-08-14_add_change.down.sql
```

Review the `.down.sql` file for notes when automatic rollback is not feasible.
