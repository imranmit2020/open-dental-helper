-- Backfill tenant assignments with conflict handling
INSERT INTO public.tenant_users (tenant_id, user_id, role)
SELECT DISTINCT ON (ti.tenant_id, u.id) ti.tenant_id, u.id, ti.role
FROM public.team_invitations ti
JOIN auth.users u ON u.email = ti.email
LEFT JOIN public.tenant_users tu ON tu.user_id = u.id AND tu.tenant_id = ti.tenant_id
WHERE tu.user_id IS NULL
ON CONFLICT (tenant_id, user_id) DO NOTHING;