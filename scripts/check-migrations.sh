#!/usr/bin/env bash
set -euo pipefail

shopt -s nullglob
files=(db/migrations/*.sql)

if [ ${#files[@]} -eq 0 ]; then
  echo "No migration files found" >&2
  exit 1
fi

status=0
for f in "${files[@]}"; do
  [[ "$f" == *.down.sql ]] && continue
  if ! grep -q "^-- UP" "$f"; then
    echo "Missing UP section in $f" >&2
    status=1
  fi
done

exit $status
