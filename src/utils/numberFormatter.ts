// utils/numberFormatter.ts
export const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  let formattedNumber;

  if (absValue < 1_000) {
    formattedNumber = absValue.toString();
  } else if (absValue < 1_000_000) {
    formattedNumber = (absValue / 1_000).toFixed(1) + "K";
  } else if (absValue < 1_000_000_000) {
    formattedNumber = (absValue / 1_000_000).toFixed(2) + "M";
  } else if (absValue < 1_000_000_000_000) {
    formattedNumber = (absValue / 1_000_000_000).toFixed(2) + "B";
  } else {
    formattedNumber = absValue.toExponential(2);
  }

  return value < 0 ? `-${formattedNumber}` : formattedNumber;
};
