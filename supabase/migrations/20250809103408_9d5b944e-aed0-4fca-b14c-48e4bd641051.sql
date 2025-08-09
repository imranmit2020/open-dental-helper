-- Create a secure RPC for corporation-wide revenue aggregation
CREATE OR REPLACE FUNCTION public.get_corporation_revenue(
  _start timestamptz,
  _end   timestamptz
)
RETURNS TABLE (
  tenant_id uuid,
  tenant_name text,
  clinic_code text,
  corporation_id uuid,
  invoices_count bigint,
  total_revenue numeric,
  period_start timestamptz,
  period_end timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.clinic_code,
    t.corporation_id,
    COUNT(i.id)::bigint AS invoices_count,
    COALESCE(SUM(i.total), 0)::numeric AS total_revenue,
    _start AS period_start,
    _end   AS period_end
  FROM public.tenants t
  JOIN public.invoices i ON i.tenant_id = t.id
  WHERE i.issued_at >= _start
    AND i.issued_at <= _end
    AND (
      public.user_is_corporate_admin(t.corporation_id, auth.uid())
      OR public.is_super_admin(auth.uid())
    )
  GROUP BY t.id, t.name, t.clinic_code, t.corporation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Helpful composite index for frequent filters
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_issued_at
  ON public.invoices(tenant_id, issued_at);

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_corporation_revenue(timestamptz, timestamptz) TO authenticated;