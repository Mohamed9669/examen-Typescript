import type { Fournisseur } from '../model/Fournisseur';

const API_URL = 'http://localhost:3000/fournisseurs';

export async function getFournisseurs(): Promise<Fournisseur[]> {
  const res = await fetch(API_URL);
  return res.json();
} 