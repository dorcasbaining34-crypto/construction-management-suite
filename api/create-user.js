import { createClient } from '@supabase/supabase-js';

const roles = new Set(['admin','director','project_manager','accounts','hr','operations','staff','contractor']);
const statuses = new Set(['Active','Disabled']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server Supabase configuration is missing. Add SUPABASE_SERVICE_ROLE_KEY in Vercel.' });
  }

  const authorization = req.headers.authorization || '';
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!accessToken) return res.status(401).json({ error: 'You must be signed in.' });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: authData, error: authError } = await adminClient.auth.getUser(accessToken);
  if (authError || !authData?.user) return res.status(401).json({ error: 'Your session is no longer valid. Please sign in again.' });

  const { data: actor, error: actorError } = await adminClient
    .from('profiles')
    .select('id, role, status')
    .eq('id', authData.user.id)
    .single();

  if (actorError || actor?.role !== 'admin' || actor?.status !== 'Active') {
    return res.status(403).json({ error: 'Only an active EJ PNG administrator can create users.' });
  }

  const body = req.body || {};
  const full_name = String(body.full_name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const employee_id = String(body.employee_id || '').trim();
  const role = String(body.role || 'staff');
  const status = String(body.status || 'Active');

  if (!full_name || !email || !password) return res.status(400).json({ error: 'Full name, email and temporary password are required.' });
  if (password.length < 8) return res.status(400).json({ error: 'Temporary password must be at least 8 characters.' });
  if (!roles.has(role)) return res.status(400).json({ error: 'Invalid role selected.' });
  if (!statuses.has(status)) return res.status(400).json({ error: 'Invalid status selected.' });

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name }
  });

  if (createError) return res.status(400).json({ error: createError.message });

  const newUserId = created.user.id;
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      full_name,
      email,
      employee_id: employee_id || null,
      role,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', newUserId);

  if (profileError) {
    await adminClient.auth.admin.deleteUser(newUserId);
    return res.status(500).json({ error: `User was not saved because the EJ PNG profile could not be created: ${profileError.message}` });
  }

  return res.status(201).json({
    message: 'User created successfully.',
    user: { id: newUserId, full_name, email, employee_id: employee_id || null, role, status }
  });
}
