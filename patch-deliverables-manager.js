const fs = require('fs');
const file = 'src/components/portal/projects/ProjectDeliverablesManager.tsx';
let content = fs.readFileSync(file, 'utf8');

// We need to find the Add Deliverable form Designer selection and inject [+ Add Designer]
// Actually, let's just make it possible to use QuickAssignDropdown or custom Add Designer
