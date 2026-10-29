export const bespokeSizeOptions = ["30", "50", "100", "custom"] as const;

export type BespokeSizeOption = (typeof bespokeSizeOptions)[number];

export const bespokeSizeLabels: Record<BespokeSizeOption, string> = {
  "30": "30 مل",
  "50": "50 مل",
  "100": "100 مل",
  custom: "حجم مخصص",
};

export const bespokeConcentrations = ["edt", "edp", "extrait", "unsure"] as const;

export type BespokeConcentration = (typeof bespokeConcentrations)[number];

export const bespokeConcentrationLabels: Record<BespokeConcentration, string> = {
  edt: "EDT",
  edp: "EDP",
  extrait: "Extrait",
  unsure: "غير متأكد",
};

export function isBespokeSizeOption(value: string): value is BespokeSizeOption {
  return bespokeSizeOptions.some((option) => option === value);
}

export function isBespokeConcentration(value: string): value is BespokeConcentration {
  return bespokeConcentrations.some((option) => option === value);
}
