import type { Article } from '../model/Article';

const API_URL = 'http://localhost:3000/articles';

//chaque article doi
export async function getArticles(): Promise<Article[]> {
  const res = await fetch(API_URL);
  return res.json();
} 