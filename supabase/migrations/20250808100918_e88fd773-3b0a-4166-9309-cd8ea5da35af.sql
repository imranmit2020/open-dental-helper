-- Invoices feature: create invoices and invoice_items with tenant-safe RLS

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  created_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies: staff in tenant can manage; patients can view own
CREATE POLICY "Invoices: staff select by tenant or patient owns"
ON public.invoices
FOR SELECT
USING (
  user_belongs_to_tenant(auth.uid(), tenant_id)
  OR EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Invoices: staff insert in tenant"
ON public.invoices
FOR INSERT
WITH CHECK (
  user_belongs_to_tenant(auth.uid(), tenant_id)
  AND created_by = auth.uid()
);

CREATE POLICY "Invoices: staff update in tenant"
ON public.invoices
FOR UPDATE
USING (user_belongs_to_tenant(auth.uid(), tenant_id))
WITH CHECK (user_belongs_to_tenant(auth.uid(), tenant_id));

CREATE POLICY "Invoices: staff delete in tenant"
ON public.invoices
FOR DELETE
USING (user_belongs_to_tenant(auth.uid(), tenant_id));

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON public.invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON public.invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Policies for invoice_items: scope via parent invoice
CREATE POLICY "Invoice items: select via parent access"
ON public.invoice_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND (
        user_belongs_to_tenant(auth.uid(), i.tenant_id)
        OR EXISTS (
          SELECT 1 FROM public.patients p
          WHERE p.id = i.patient_id AND p.user_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "Invoice items: staff insert via tenant"
ON public.invoice_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND user_belongs_to_tenant(auth.uid(), i.tenant_id)
  )
);

CREATE POLICY "Invoice items: staff update via tenant"
ON public.invoice_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND user_belongs_to_tenant(auth.uid(), i.tenant_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND user_belongs_to_tenant(auth.uid(), i.tenant_id)
  )
);

CREATE POLICY "Invoice items: staff delete via tenant"
ON public.invoice_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
      AND user_belongs_to_tenant(auth.uid(), i.tenant_id)
  )
);

-- Index for faster joins
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);
