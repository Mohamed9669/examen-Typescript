import { getApprovisionnements } from '../service/ApprovisionnementService';
import { getFournisseurs } from '../service/FournisseurService';
import { getArticles } from '../service/ArticleService';
import type { Approvisionnement } from '../model/Approvisionnement';
import type { Fournisseur } from '../model/Fournisseur';
import type { Article } from '../model/Article';

export function render() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <h1 class="text-2xl font-bold mb-4">Liste des approvisionnements</h1>
    <div class="mb-4">
      <input type="text" id="filtre-ref" placeholder="Filtrer par référence..." class="border p-2 w-full max-w-xs" />
    </div>
    <table class="min-w-full bg-white">
      <thead>
        <tr>
          <th class="border px-4 py-2">Date</th>
          <th class="border px-4 py-2">Référence</th>
          <th class="border px-4 py-2">Fournisseur</th>
          <th class="border px-4 py-2">Articles</th>
        </tr>
      </thead>
      <tbody id="table-appros"></tbody>
    </table>
  `;

  let approvisionnements: Approvisionnement[] = [];
  let fournisseurs: Fournisseur[] = [];
  let articles: Article[] = [];

  // Chargement des données
  Promise.all([
    getApprovisionnements(),
    getFournisseurs(),
    getArticles()
  ]).then(([appr, fourns, arts]) => {
    approvisionnements = appr;
    fournisseurs = fourns;
    articles = arts;
    afficherTable(approvisionnements);
  });

  function afficherTable(data: Approvisionnement[]) {
    const tbody = document.getElementById('table-appros');
    if (!tbody) return;
    tbody.innerHTML = data.map(app => {
      const fournisseur = fournisseurs.find(f => f.id === app.fournisseurId)?.nom || '';
      const articlesStr = app.lignes.map(l => {
        const art = articles.find(a => a.id === l.articleId);
        return art ? `${art.nom} (x${l.quantite})` : '';
      }).join(', ');
      return `<tr>
        <td class="border px-4 py-2">${app.date}</td>
        <td class="border px-4 py-2">${app.reference}</td>
        <td class="border px-4 py-2">${fournisseur}</td>
        <td class="border px-4 py-2">${articlesStr}</td>
      </tr>`;
    }).join('');
  }

  // Filtrage par référence
  document.getElementById('filtre-ref')?.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value.toLowerCase();
    const filtered = approvisionnements.filter(a => a.reference.toLowerCase().includes(value));
    afficherTable(filtered);
  });
} 