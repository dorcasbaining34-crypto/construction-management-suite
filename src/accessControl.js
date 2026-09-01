import access from '../data/access-control.json';
import users from '../data/users.json';

export const roles = access.roles;
export const initialUsers = users.users;
export function roleById(id){ return roles.find(r=>r.id===id) || roles.find(r=>r.id==='staff'); }
export function can(user, permission){ const role=roleById(user?.role); return role?.permissions.includes('*') || role?.permissions.includes(permission); }
export function visibleNav(user, nav){
  const rules={Dashboard:'dashboard.view',Projects:'projects.view',Customers:'customers.view',Quotations:'quotations.view','Jobs & Work Orders':'jobs.view',Inventory:'inventory.view',Invoicing:'invoices.view',Schedule:'projects.view','Budget & Costs':'budget.view',Suppliers:'customers.view',Safety:'safety.view',Reports:'reports.view',Employees:'employees.view','User Access':'users.manage'};
  return can(user, rules[nav] || nav);
}
