import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export function useModuleFavorites() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['module-favorites', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('user_module_favorites')
        .select('module_key')
        .eq('tenant_id', currentTenant.id);
      
      if (error) {
        console.error('Failed to load favorites', error);
        return [];
      }
      return data?.map(f => f.module_key) || [];
    },
    enabled: !!currentTenant?.id,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (moduleKey: string) => {
      if (!currentTenant?.id) throw new Error('No tenant selected');
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No authenticated user');
      
      const { error } = await supabase
        .from('user_module_favorites')
        .insert({
          user_id: userData.user.id,
          module_key: moduleKey,
          tenant_id: currentTenant.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-favorites', currentTenant?.id] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (moduleKey: string) => {
      if (!currentTenant?.id) throw new Error('No tenant selected');
      const { error } = await supabase
        .from('user_module_favorites')
        .delete()
        .eq('module_key', moduleKey)
        .eq('tenant_id', currentTenant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-favorites', currentTenant?.id] });
    },
  });

  const isFavorite = (moduleKey: string) => favorites.includes(moduleKey);

  const toggleFavorite = (moduleKey: string) => {
    if (isFavorite(moduleKey)) {
      removeFavoriteMutation.mutate(moduleKey);
    } else {
      addFavoriteMutation.mutate(moduleKey);
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
  };
}