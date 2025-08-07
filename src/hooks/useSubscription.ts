import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

interface SubscriptionStatus {
  subscribed: boolean;
  tier: SubscriptionTier;
  expiresAt?: string;
  loading: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    tier: 'free',
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setSubscriptionStatus({
        subscribed: false,
        tier: 'free',
        loading: false,
      });
      return;
    }

    // For now, simulate subscription checking
    // In a real implementation, this would check against a subscribers table
    // or call a Stripe verification function
    const checkSubscription = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, assign subscription based on user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        let tier: SubscriptionTier = 'free';
        let subscribed = false;

        if (profile?.role === 'admin') {
          tier = 'enterprise';
          subscribed = true;
        } else if (profile?.role === 'dentist') {
          tier = 'premium';
          subscribed = true;
        } else if (profile?.role === 'staff') {
          tier = 'basic';
          subscribed = true;
        }

        setSubscriptionStatus({
          subscribed,
          tier,
          loading: false,
        });
      } catch (error) {
        console.error('Error checking subscription:', error);
        setSubscriptionStatus({
          subscribed: false,
          tier: 'free',
          loading: false,
        });
      }
    };

    checkSubscription();
  }, [user]);

  const hasFeature = (feature: string): boolean => {
    const { tier } = subscriptionStatus;
    
    const features = {
      basic: ['patients', 'appointments', 'basic_scheduling'],
      premium: ['patients', 'appointments', 'basic_scheduling', 'ai_features', 'teledentistry', 'analytics'],
      enterprise: ['patients', 'appointments', 'basic_scheduling', 'ai_features', 'teledentistry', 'analytics', 'multi_practice', 'advanced_ai', 'compliance']
    };

    if (tier === 'free') return false;
    if (tier === 'basic') return features.basic.includes(feature);
    if (tier === 'premium') return [...features.basic, ...features.premium].includes(feature);
    if (tier === 'enterprise') return [...features.basic, ...features.premium, ...features.enterprise].includes(feature);
    
    return false;
  };

  return {
    ...subscriptionStatus,
    hasFeature,
  };
}