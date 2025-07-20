import { getFournisseurs } from '../service/FournisseurService';
import { getArticles } from '../service/ArticleService';
import { addApprovisionnement, getApprovisionnements } from '../service/ApprovisionnementService';
import type { Article } from '../model/Article';
import type { Fournisseur } from '../model/Fournisseur';
import type { LigneApprovisionnement } from '../model/LigneApprovisionnement';

function showToast(message: string) {
  let toast = document.createElement('div');
  toast.className = 'fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

function genererReference(dernierNumero: number): string {
  const num = (dernierNumero + 1).toString().padStart(3, '0');
  return `APPRO-${num}`;
}

export function render() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <h1 class="text-2xl font-bold mb-4">Nouvel approvisionnement</h1>
    <form id="form-appro" class="space-y-4">
      <div>
        <label class="block">Référence</label>
        <input type="text" id="ref" class="border p-2 w-full bg-gray-100" readonly />
      </div>
      <div>
        <label class="block">Fournisseur</label>
        <select id="fournisseur" class="border p-2 w-full"></select>
      </div>
      <div>
        <label class="block">Articles</label>
        <div id="lignes-articles"></div>
        <button type="button" id="add-ligne" class="mt-2 px-2 py-1 bg-blue-500 text-white rounded">Ajouter un article</button>
      </div>
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">Enregistrer</button>
    </form>
    <style>
      @keyframes fade-in { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: none; } }
      .animate-fade-in { animation: fade-in 0.3s; transition: opacity 0.5s; }
    </style>
  `;

  let articles: Article[] = [];
  let fournisseurs: Fournisseur[] = [];
  let lignes: LigneApprovisionnement[] = [];
  let refCourante = '';

  getApprovisionnements().then(appros => {
    let maxNum = 0;
    appros.forEach(a => {
      const match = a.reference.match(/APPRO-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    refCourante = genererReference(maxNum);
    const refInput = document.getElementById('ref') as HTMLInputElement;
    if (refInput) refInput.value = refCourante;
  });

  getFournisseurs().then(data => {
    fournisseurs = data;
    const select = document.getElementById('fournisseur') as HTMLSelectElement;
    select.innerHTML = fournisseurs.map(f => `<option value="${f.id}">${f.nom}</option>`).join('');
  });
  getArticles().then(data => {
    articles = data;
    addLigne(); 
  });

  function getPrixArticle(articleId: number): number {
    return articles.find(a => a.id === articleId)?.prix ?? 0;
  }

  function addLigne() {
    const lignesDiv = document.getElementById('lignes-articles');
    if (!lignesDiv) return;
    const idx = lignes.length;
    const articleId = articles[0]?.id || 0;
    lignes.push({ articleId, quantite: 1 });
    const ligneId = `ligne-${idx}`;
    const selectOptions = articles.map(a => `<option value="${a.id}">${a.nom}</option>`).join('');
    const prix = getPrixArticle(articleId);
    const html = `
      <div class="flex gap-2 mb-2 items-center" id="${ligneId}">
        <select class="article-select border p-1" data-idx="${idx}">${selectOptions}</select>
        <input type="number" min="1" value="1" class="quantite-input border p-1 w-20" data-idx="${idx}" />
        <span class="prix-article text-sm text-gray-700" data-idx="${idx}">${prix.toFixed(2)} €</span>
        <button type="button" class="remove-ligne bg-red-500 text-white px-2 rounded" data-idx="${idx}">X</button>
      </div>
    `;
    lignesDiv.insertAdjacentHTML('beforeend', html);
  }

  
  document.getElementById('add-ligne')?.addEventListener('click', () => {
    addLigne();
  });

  
  document.getElementById('lignes-articles')?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('remove-ligne')) {
      const idx = Number(target.getAttribute('data-idx'));
      lignes.splice(idx, 1);
      document.getElementById(`ligne-${idx}`)?.remove();
    }
  });

  
  document.getElementById('lignes-articles')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const idx = Number(target.getAttribute('data-idx'));
    if (target.classList.contains('article-select')) {
      lignes[idx].articleId = Number(target.value);
      
      const prixSpan = document.querySelector(`.prix-article[data-idx='${idx}']`) as HTMLSpanElement;
      if (prixSpan) prixSpan.textContent = getPrixArticle(Number(target.value)).toFixed(2) + ' €';
    } else if (target.classList.contains('quantite-input')) {
      lignes[idx].quantite = Number(target.value);
    }
  });

  
  document.getElementById('form-appro')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ref = (document.getElementById('ref') as HTMLInputElement).value;
    const fournisseurId = Number((document.getElementById('fournisseur') as HTMLSelectElement).value);
    const date = new Date().toISOString().slice(0, 10);
    const lignesValides = lignes.filter(l => l.articleId && l.quantite > 0);
    if (!ref || !fournisseurId || lignesValides.length === 0) {
      showToast('Veuillez remplir tous les champs et ajouter au moins un article.');
      return;
    }
    await addApprovisionnement({ reference: ref, fournisseurId, date, lignes: lignesValides });
    showToast('Approvisionnement enregistré !');
    render();
  });
} 