const fs = require('fs');
const file = 'src/components/portal/ProjectsView.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'designers: CustomDesigner[];',
  'designers: CustomDesigner[];\n  onUpdateDesigners?: (designers: CustomDesigner[]) => void;'
);
content = content.replace(
  'designers,\n  settings,',
  'designers,\n  onUpdateDesigners,\n  settings,'
);
content = content.replace(
  'designers={designers}',
  'designers={designers}\n          onUpdateDesigners={onUpdateDesigners}'
);
fs.writeFileSync(file, content);
