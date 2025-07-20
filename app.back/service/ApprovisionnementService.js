const API_URL = 'http://localhost:3000/approvisionnements';

export async function getApprovisionnements() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function getApprovisionnement(id) {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
}

export async function addApprovisionnement(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
} 