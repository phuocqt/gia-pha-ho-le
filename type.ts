import type { ExtNode } from "relatives-tree/lib/types";

export interface NodeItem extends ExtNode {
  name?: string;
  birthday?: string;
  deathday?: string;
  note?: string;
  address?: string;
  birthPlace?: string;
  phoneNum?: string;
  email?: string;
  file?: File;
  isAlive?: boolean;
  childType?: string;
  momId?: string;
}
