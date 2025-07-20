import { render as renderNew } from './pages/NewAppro'
import { render as renderList } from './pages/ListeAppro'

document.getElementById("link-new")?.addEventListener("click", (e) => {
  e.preventDefault();
  renderNew();
});
document.getElementById("link-list")?.addEventListener("click", (e) => {
  e.preventDefault();
  renderList();
});

// Affichage par défaut
renderList(); 