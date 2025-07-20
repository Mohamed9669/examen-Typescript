import { getApprovisionnements } from '../service/ApprovisionnementService';
import { getFournisseurs } from '../service/FournisseurService';
import { getArticles } from '../service/ArticleService';
import { render as renderNewAppro } from './NewAppro';
import type { Approvisionnement } from '../model/Approvisionnement';
import type { Fournisseur } from '../model/Fournisseur';
import type { Article } from '../model/Article';

function formatMontant(montant: number): string {
  return montant.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' FCFA';
}

export function render() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Gestion des Approvisionnements</h1>
      <button id="btn-nouveau" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition">+ Nouvel approvisionnement</button>
    </div>
    <div class="bg-white rounded shadow p-4 mb-6">
      <div class="mb-2 font-semibold text-gray-700">Filtres et recherche</div>
      <div class="flex items-center gap-2">
        <div class="relative w-full max-w-xs">
          <input type="text" id="filtre-ref" placeholder="Rechercher..." class="border rounded pl-10 pr-2 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200" />
          <span class="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z" /></svg>
          </span>
        </div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white rounded shadow">
        <thead>
          <tr class="bg-gray-100 text-gray-700 text-left">
            <th class="px-4 py-3 font-semibold">Référence</th>
            <th class="px-4 py-3 font-semibold">Date</th>
            <th class="px-4 py-3 font-semibold">Fournisseur</th>
            <th class="px-4 py-3 font-semibold">Articles</th>
            <th class="px-4 py-3 font-semibold text-right">Montant total</th>
          </tr>
        </thead>
        <tbody id="table-appros"></tbody>
      </table>
    </div>
  `;

  let approvisionnements: Approvisionnement[] = [];
  let fournisseurs: Fournisseur[] = [];
  let articles: Article[] = [];

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
        if (!art) return '';
        return `${art.nom} (x${l.quantite})`;
      }).join(', ');
      const montantTotal = app.lignes.reduce((sum, l) => {
        const art = articles.find(a => a.id === l.articleId);
        return sum + (art ? art.prix * l.quantite : 0);
      }, 0);
      return `<tr class="border-b hover:bg-gray-50 transition">
        <td class="px-4 py-2">${app.reference}</td>
        <td class="px-4 py-2">${app.date}</td>
        <td class="px-4 py-2">${fournisseur}</td>
        <td class="px-4 py-2">${articlesStr}</td>
        <td class="px-4 py-2 text-right font-semibold">${formatMontant(montantTotal)} fcfa</td>
      </tr>`;
    }).join('');
  }

  // J'ai filtrer par référence
  document.getElementById('filtre-ref')?.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value.toLowerCase();
    const filtered = approvisionnements.filter(a => a.reference.toLowerCase().includes(value));
    afficherTable(filtered);
  });

  document.getElementById('btn-nouveau')?.addEventListener('click', (e) => {
    e.preventDefault();
    renderNewAppro();
  });
} 