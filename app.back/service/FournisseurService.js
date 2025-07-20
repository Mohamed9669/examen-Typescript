const API_URL = 'http://localhost:3000/fournisseurs';

export async function getFournisseurs() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function getFournisseur(id) {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
}

export async function addFournisseur(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
} 