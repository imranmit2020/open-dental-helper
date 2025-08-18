-- Create inventory categories table
CREATE TABLE public.inventory_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES public.inventory_categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID,
  corporation_id UUID,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  payment_terms TEXT,
  delivery_time_days INTEGER DEFAULT 7,
  minimum_order_amount NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID,
  corporation_id UUID,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.inventory_categories(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  unit_of_measure TEXT NOT NULL DEFAULT 'piece',
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC,
  minimum_stock_level INTEGER NOT NULL DEFAULT 10,
  maximum_stock_level INTEGER NOT NULL DEFAULT 100,
  reorder_point INTEGER NOT NULL DEFAULT 20,
  current_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  barcode TEXT,
  expiration_tracking BOOLEAN NOT NULL DEFAULT false,
  is_consumable BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  ai_demand_forecast JSONB DEFAULT '{}',
  usage_pattern JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, sku),
  UNIQUE(corporation_id, sku)
);

-- Create inventory transactions table
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID,
  corporation_id UUID,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  transaction_type TEXT NOT NULL, -- 'purchase', 'usage', 'adjustment', 'transfer', 'return'
  quantity INTEGER NOT NULL,
  cost_per_unit NUMERIC,
  total_cost NUMERIC,
  reference_id UUID, -- appointment_id, invoice_id, etc.
  reference_type TEXT, -- 'appointment', 'manual', 'auto_adjustment'
  batch_number TEXT,
  expiration_date DATE,
  supplier_id UUID REFERENCES public.suppliers(id),
  notes TEXT,
  performed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID,
  corporation_id UUID,
  order_number TEXT NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_by UUID NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase order items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  expiration_date DATE,
  batch_number TEXT,
  notes TEXT
);

-- Create inventory alerts table
CREATE TABLE public.inventory_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID,
  corporation_id UUID,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  alert_type TEXT NOT NULL, -- 'low_stock', 'expiring_soon', 'expired', 'overstock', 'reorder_suggestion'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  message TEXT NOT NULL,
  current_stock INTEGER,
  suggested_action TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_tenant_id ON public.inventory_items(tenant_id);
CREATE INDEX idx_inventory_items_corporation_id ON public.inventory_items(corporation_id);
CREATE INDEX idx_inventory_items_sku ON public.inventory_items(sku);
CREATE INDEX idx_inventory_items_category_id ON public.inventory_items(category_id);
CREATE INDEX idx_inventory_transactions_item_id ON public.inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_date ON public.inventory_transactions(created_at);
CREATE INDEX idx_inventory_alerts_unread ON public.inventory_alerts(tenant_id, corporation_id, is_read) WHERE is_read = false;

-- Enable RLS on all tables
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_categories (global)
CREATE POLICY "Anyone can view categories" ON public.inventory_categories FOR SELECT USING (true);
CREATE POLICY "Staff can manage categories" ON public.inventory_categories FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'dentist', 'staff')));

-- RLS Policies for suppliers
CREATE POLICY "Tenant suppliers access" ON public.suppliers FOR ALL 
USING (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
)
WITH CHECK (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
);

-- RLS Policies for inventory_items
CREATE POLICY "Tenant inventory access" ON public.inventory_items FOR ALL 
USING (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
)
WITH CHECK (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
);

-- RLS Policies for inventory_transactions  
CREATE POLICY "Tenant transactions access" ON public.inventory_transactions FOR ALL 
USING (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
)
WITH CHECK (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
);

-- RLS Policies for purchase_orders
CREATE POLICY "Tenant purchase orders access" ON public.purchase_orders FOR ALL 
USING (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
)
WITH CHECK (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
);

-- RLS Policies for purchase_order_items
CREATE POLICY "Purchase order items via parent" ON public.purchase_order_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.purchase_orders po 
    WHERE po.id = purchase_order_items.purchase_order_id AND (
      po.tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), po.tenant_id) OR
      po.corporation_id IS NOT NULL AND user_is_corporate_admin(po.corporation_id, auth.uid()) OR
      is_super_admin(auth.uid())
    )
  )
);

-- RLS Policies for inventory_alerts
CREATE POLICY "Tenant alerts access" ON public.inventory_alerts FOR ALL 
USING (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
)
WITH CHECK (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
);

-- Create triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.inventory_categories (name, description) VALUES
('Dental Instruments', 'Various dental instruments and tools'),
('Consumables', 'Single-use items and disposables'),
('Materials', 'Dental materials and compounds'),
('Equipment', 'Dental equipment and machines'),
('Office Supplies', 'General office and administrative supplies'),
('Pharmaceuticals', 'Medications and pharmaceutical products'),
('Sterilization', 'Sterilization and infection control items'),
('Orthodontics', 'Orthodontic supplies and materials');

-- Function to generate AI inventory insights
CREATE OR REPLACE FUNCTION generate_inventory_insights(_tenant_id UUID DEFAULT NULL, _corporation_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  low_stock_items INTEGER := 0;
  expiring_items INTEGER := 0;
  total_value NUMERIC := 0;
  top_usage_items JSONB;
BEGIN
  -- Count low stock items
  SELECT COUNT(*) INTO low_stock_items
  FROM inventory_items 
  WHERE (tenant_id = _tenant_id OR corporation_id = _corporation_id)
    AND current_stock <= reorder_point
    AND is_active = true;
  
  -- Count expiring items (within 30 days)
  SELECT COUNT(*) INTO expiring_items
  FROM inventory_transactions it
  JOIN inventory_items ii ON ii.id = it.item_id
  WHERE (ii.tenant_id = _tenant_id OR ii.corporation_id = _corporation_id)
    AND it.expiration_date IS NOT NULL
    AND it.expiration_date <= CURRENT_DATE + INTERVAL '30 days'
    AND it.quantity > 0;
  
  -- Calculate total inventory value
  SELECT COALESCE(SUM(current_stock * cost_per_unit), 0) INTO total_value
  FROM inventory_items
  WHERE (tenant_id = _tenant_id OR corporation_id = _corporation_id)
    AND is_active = true;
  
  -- Get top usage items (last 30 days)
  SELECT jsonb_agg(
    jsonb_build_object(
      'item_name', ii.name,
      'usage_quantity', -SUM(it.quantity)
    ) ORDER BY -SUM(it.quantity) DESC
  ) INTO top_usage_items
  FROM inventory_transactions it
  JOIN inventory_items ii ON ii.id = it.item_id
  WHERE (ii.tenant_id = _tenant_id OR ii.corporation_id = _corporation_id)
    AND it.transaction_type = 'usage'
    AND it.created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY ii.id, ii.name
  LIMIT 5;
  
  result := jsonb_build_object(
    'low_stock_items', low_stock_items,
    'expiring_items', expiring_items,
    'total_inventory_value', total_value,
    'top_usage_items', COALESCE(top_usage_items, '[]'::jsonb),
    'generated_at', now()
  );
  
  RETURN result;
END;
$$;