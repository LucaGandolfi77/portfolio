// === PROJECTS RENDERER ===
// Rendering dinamico card progetti da PROJECTS_DATA

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid || typeof PROJECTS_DATA === 'undefined') return;
  
  // Pulisci contenuto hardcoded
  grid.innerHTML = '';
  
  // Renderizza ogni progetto
  PROJECTS_DATA.forEach(project => {
    const card = document.createElement('a');
    card.className = 'genius-card project-card';
    card.href = project.href;
    
    card.innerHTML = `
      <div class="project-header">
        <span class="project-emoji">${project.emoji}</span>
        <span class="engineer-badge" style="color: ${project.badgeColor}">${project.badge}</span>
      </div>
      <h3 class="project-title">${project.title}</h3>
      <p class="project-description">${project.description}</p>
    `;
    
    grid.appendChild(card);
  });
}

// Esegui al DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderProjects);
} else {
  renderProjects();
}
