import type { LigneApprovisionnement } from './LigneApprovisionnement';

export interface Approvisionnement {
  id: number;
  date: string;
  reference: string;
  fournisseurId: number;
  lignes: LigneApprovisionnement[];
}