export type Faction = "red" | "blue";
export type Screen = "boot" | "assigned" | "main";

export type GateRow = {
  id: number;
  red: number;
  blue: number;
  target: number;
  gate_open: boolean;
  winner: string | null;
};
