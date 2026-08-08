export function parseJsonSnapshot<TSnapshot>(
  value: TSnapshot | string
): TSnapshot {
  if (typeof value === "string") {
    return JSON.parse(value) as TSnapshot;
  }

  return value;
}

export function serializeSnapshot(
  value: unknown
) {
  return JSON.stringify(value);
}
