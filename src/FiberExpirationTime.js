export const NoWork = 0;
export const Sync = 1;
export const Never = 1073741823;

const UNIT_SIZE = 10;
const MAGIC_NUMBER_OFFSET = 2;

// 1 unit of expiration time represents 10ms.
export function msToExpirationTime(ms) {
  // Always add an offset so that we don't clash with the magic number for NoWork.
  return ((ms / UNIT_SIZE) | 0) + MAGIC_NUMBER_OFFSET;
}

function ceiling(num, precision) {
  return (((num / precision) | 0) + 1) * precision;
}

export function computeExpirationBucket(
  currentTime,
  expirationInMs,
  bucketSizeMs,
) {
  return ceiling(
    currentTime + expirationInMs / UNIT_SIZE,
    bucketSizeMs / UNIT_SIZE,
  );
}
