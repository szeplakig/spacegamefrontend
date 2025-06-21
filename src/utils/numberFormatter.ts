// utils/numberFormatter.ts
export const formatNumber = (value: number): string => {
  const absValue = value;
  let formattedNumber;

  if (absValue < 1_000) {
    formattedNumber = absValue.toString();
  } else if (absValue < 1_000_000) {
    formattedNumber = (absValue / 1_000).toFixed(1) + "K";
  } else if (absValue < 1_000_000_000) {
    formattedNumber = (absValue / 1_000_000).toFixed(1) + "M";
  } else if (absValue < 1_000_000_000_000) {
    formattedNumber = (absValue / 1_000_000_000).toFixed(1) + "B";
  } else {
    formattedNumber = absValue.toExponential(2);
  }

  return formattedNumber;
};
