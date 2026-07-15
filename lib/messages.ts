export const MESSAGES = [
  "Contribution accepted.",
  "The Archive exists.",
  "Access denied.",
  "Only one side will open the gate.",
  "Something valuable is locked.",
];

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);
