import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationOptions {
  enabled: boolean;
  language: string;
}

export const useNotifications = ({ enabled, language }: NotificationOptions) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (!enabled) return;
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    // Get current permission
    setPermission(Notification.permission);

    // Request permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, [enabled]);

  const checkNearbyActivities = async () => {
    if (permission !== 'granted') return;

    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000 // Cache for 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Get location name
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${language === 'ar' ? 'ar' : 'en'}`
      );
      const geoData = await geoResponse.json();
      const userCity = (geoData.address.city || geoData.address.town || geoData.address.state || '').toLowerCase();

      // Fetch nearby activities
      const { data: activities, error } = await supabase
        .from('content')
        .select('id, title, location, price, description')
        .eq('content_type', 'activity')
        .eq('is_active', true)
        .limit(10);

      if (error) throw error;

      // Filter activities by location proximity
      const nearbyActivities = activities?.filter(activity => {
        const activityLocation = (activity.location || '').toLowerCase();
        return activityLocation.includes(userCity) || 
               activityLocation.includes(geoData.address.state?.toLowerCase() || '');
      }) || [];

      // Send notification if there are nearby activities
      if (nearbyActivities.length > 0) {
        const activity = nearbyActivities[0];
        const title = language === 'ar' 
          ? `🎉 فعاليات قريبة منك!`
          : `🎉 Events Near You!`;
        
        const body = language === 'ar'
          ? `${activity.title} - ${activity.price} ر.س`
          : `${activity.title} - ${activity.price} SAR`;

        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'nearby-activity',
        });

        // Store that we've notified (to avoid spam)
        localStorage.setItem('lastNotificationTime', Date.now().toString());
        localStorage.setItem('notifiedActivities', JSON.stringify(nearbyActivities.map(a => a.id)));
      }
    } catch (error) {
      console.error('Error checking nearby activities:', error);
    }
  };

  const shouldNotify = () => {
    const lastNotification = localStorage.getItem('lastNotificationTime');
    if (!lastNotification) return true;
    
    // Only notify once every 24 hours
    const hoursSinceLastNotification = (Date.now() - parseInt(lastNotification)) / (1000 * 60 * 60);
    return hoursSinceLastNotification >= 24;
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  return {
    permission,
    requestPermission,
    checkNearbyActivities,
    shouldNotify,
    isSupported: 'Notification' in window
  };
};
