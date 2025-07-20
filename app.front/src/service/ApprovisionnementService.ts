import type { Approvisionnement } from '../model/Approvisionnement';

const API_URL = 'http://localhost:3000/approvisionnements';

export async function getApprovisionnements(): Promise<Approvisionnement[]> {
  const res = await fetch(API_URL);
  return res.json();
}

export async function addApprovisionnement(data: Omit<Approvisionnement, 'id'>): Promise<Approvisionnement> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
} 