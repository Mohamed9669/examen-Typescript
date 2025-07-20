const API_URL = 'http://localhost:3000/articles';

export async function getArticles() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function getArticle(id) {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
}

export async function addArticle(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
} 