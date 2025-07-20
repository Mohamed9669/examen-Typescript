import { getApprovisionnements, deleteApprovisionnement } from '../service/ApprovisionnementService';
import { getFournisseurs } from '../service/FournisseurService';
import { getArticles } from '../service/ArticleService';
import { render as renderNewAppro } from './NewAppro';
import type { Approvisionnement } from '../model/Approvisionnement';
import type { Fournisseur } from '../model/Fournisseur';
import type { Article } from '../model/Article';

function formatMontant(montant: number): string {
  return montant.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' FCFA';
}

function showToast(message: string, color = 'bg-green-600') {
  let toast = document.createElement('div');
  toast.className = `fixed top-6 right-6 ${color} text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

function showDetailModal(app: Approvisionnement, fournisseur: string, articles: Article[]) {
  const montantTotal = app.lignes.reduce((sum, l) => {
    const art = articles.find(a => a.id === l.articleId);
    return sum + (art ? art.prix * l.quantite : 0);
  }, 0);
  const articlesStr = app.lignes.map(l => {
    const art = articles.find(a => a.id === l.articleId);
    if (!art) return '';
    return `<li>${art.nom} (x${l.quantite}) - ${art.prix.toFixed(2)} FCFA</li>`;
  }).join('');
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] relative animate-fade-in">
      <button class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold close-modal">&times;</button>
      <h2 class="text-xl font-bold mb-4">Détail de l'approvisionnement</h2>
      <div class="mb-2"><b>Référence :</b> ${app.reference}</div>
      <div class="mb-2"><b>Date :</b> ${app.date}</div>
      <div class="mb-2"><b>Fournisseur :</b> ${fournisseur}</div>
      <div class="mb-2"><b>Articles :</b>
        <ul class="list-disc ml-6">${articlesStr}</ul>
      </div>
      <div class="mb-2"><b>Montant total :</b> <span class="font-semibold">${formatMontant(montantTotal)}</span></div>
    </div>
    <style>
      .animate-fade-in { animation: fade-in 0.3s; }
      @keyframes fade-in { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: none; } }
    </style>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.close-modal')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
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
            <th class="px-4 py-3 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody id="table-appros"></tbody>
      </table>
    </div>
    <style>
      .action-btn { display: inline-flex; align-items: center; justify-content: center; width: 2.2rem; height: 2.2rem; border-radius: 0.375rem; margin-right: 0.2rem; }
      .action-view { background: #2563eb; color: #fff; }
      .action-edit { background: #facc15; color: #000; }
      .action-delete { background: #ef4444; color: #fff; }
      .action-btn svg { width: 1.1rem; height: 1.1rem; }
    </style>
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
    if (fournisseurs.length === 0 || articles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red-500">Aucun fournisseur ou article chargé !</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(app => {
      const fournisseur = fournisseurs.find(f => String(f.id) === String(app.fournisseurId))?.nom || '';
      const articlesStr = app.lignes.map(l => {
        const art = articles.find(a => a.id === l.articleId);
        if (!art) return '';
        return `${art.nom} (x${l.quantite})`;
      }).join(', ');
      const montantTotal = app.lignes.reduce((sum, l) => {
        const art = articles.find(a => a.id === l.articleId);
        return sum + (art ? art.prix * l.quantite : 0);
      }, 0);
      return `<tr class="border-b hover:bg-gray-50 transition" data-id="${app.id}">
        <td class="px-4 py-2">${app.reference}</td>
        <td class="px-4 py-2">${app.date}</td>
        <td class="px-4 py-2">${fournisseur}</td>
        <td class="px-4 py-2">${articlesStr}</td>
        <td class="px-4 py-2 text-right font-semibold">${formatMontant(montantTotal)}</td>
        <td class="px-4 py-2 text-center">
          <button class="action-btn action-view" title="Détail" data-id="${app.id}"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
          <button class="action-btn action-edit" title="Modifier"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4 1a1 1 0 01-1.263-1.263l1-4a4 4 0 01.828-1.414z"/></svg></button>
          <button class="action-btn action-delete" title="Supprimer" data-id="${app.id}"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6"/></svg></button>
        </td>
      </tr>`;
    }).join('');
  }

  document.getElementById('filtre-ref')?.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value.toLowerCase();
    const filtered = approvisionnements.filter(a => a.reference.toLowerCase().includes(value));
    afficherTable(filtered);
  });

  document.getElementById('btn-nouveau')?.addEventListener('click', (e) => {
    e.preventDefault();
    renderNewAppro();
  });

  
  document.getElementById('table-appros')?.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    console.log('Clic détecté sur le tableau', target);
    if (target.closest('.action-delete')) {
      const btn = target.closest('.action-delete') as HTMLElement;
      const id = btn.getAttribute('data-id');
      if (!id) return;
      
      try {
        await deleteApprovisionnement(id); 
        approvisionnements = approvisionnements.filter(a => String(a.id) !== String(id));
        afficherTable(approvisionnements);
        showToast('Suppression réussie !', 'bg-red-600');
      } catch {
        showToast('Erreur lors de la suppression', 'bg-red-600');
      }
    }

    if (target.closest('.action-view')) {
      console.log('Clic sur bouton détail');
      const btn = target.closest('.action-view') as HTMLElement;
      const id = btn.getAttribute('data-id');
      console.log('ID trouvé pour détail :', id);
      if (!id) return;
      const app = approvisionnements.find(a => String(a.id) === String(id));
      console.log('Approvisionnement trouvé :', app);
      if (!app) return;
      const fournisseur = fournisseurs.find(f => String(f.id) === String(app.fournisseurId))?.nom || '';
      console.log('Fournisseur trouvé :', fournisseur);
      showDetailModal(app, fournisseur, articles);
      console.log('Modal devrait être affiché');
    }
        if (target.closest('.action-edit')) {
      const btn = target.closest('tr');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (!id) return;
      const app = approvisionnements.find(a => String(a.id) === String(id));
      if (!app) return;
      import('./NewAppro').then(module => {
        module.render(app);
      });
    }
  });
} 