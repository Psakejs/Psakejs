const fs = require('fs');

// Lee el archivo JSON con las actividades recientes
const activityData = JSON.parse(fs.readFileSync('recent_activity.json', 'utf-8'));

// Filtra eventos de "PushEvent" (commits) y extrae la información relevante
const recentCommits = activityData
  .filter(event => event.type === 'PushEvent')
  .map(event => {
    const repoName = event.repo.name;
    const commitCount = event.payload.commits.length;
    return `- **${repoName}**: ${commitCount} commit(s)`;
  })
  .slice(0, 6); // Limita la cantidad de actividades que deseas mostrar (en este caso, 5)

// Actualiza el README.md con la actividad reciente
let readmeContent = fs.readFileSync('README.md', 'utf-8');

// Crea el texto de actividad reciente con una estructura clara
const activitySection = `\n## ⏰ Actividad Reciente\n${recentCommits.join('\n')}\n`;

// Si la sección ya existe, la reemplaza; de lo contrario, la agrega al final del archivo
const updatedReadme = readmeContent.includes("## ⏰ Actividad Reciente")
  ? readmeContent.replace(/## ⏰ Actividad Reciente\n([\s\S]*?)(\n##|$)/, activitySection + "$2")
  : readmeContent + activitySection;

// Guarda los cambios en el README.md
fs.writeFileSync('README.md', updatedReadme);
