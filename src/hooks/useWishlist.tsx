import { useState, useEffect } from 'react';

const WISHLIST_EVENT = 'wishlist-updated';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const loadWishlist = () => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Could not load wishlist', e);
    }
  };

  useEffect(() => {
    loadWishlist();
    
    const handleStorageChange = () => loadWishlist();
    window.addEventListener(WISHLIST_EVENT, handleStorageChange);
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'wishlist') {
        loadWishlist();
      }
    });
    
    return () => {
      window.removeEventListener(WISHLIST_EVENT, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const newWishlist = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      window.dispatchEvent(new Event(WISHLIST_EVENT));
      return newWishlist;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return { wishlist, toggleWishlist, isInWishlist };
}
