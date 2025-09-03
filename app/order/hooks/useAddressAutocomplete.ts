'use client';
import { useState, useCallback } from 'react';

interface AddressResult {
  primary: string;
  city: string;
  zip: string;
  lat: string;
  lon: string;
}

const CA_VIEWBOX = '-124.48,32.53,-114.13,42.01';

export function useAddressAutocomplete() {
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchCA = async (query: string): Promise<AddressResult[]> => {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=us&bounded=1&viewbox=${CA_VIEWBOX}&q=${encodeURIComponent(query)}`;
    
    try {
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      if (!res.ok) return [];
      
      const data = await res.json();
      const filtered = data.filter((d: any) => {
        const a = d.address || {};
        const inCA = (a.state === 'California') || (a.state_code === 'CA');
        const isAddr = ['house', 'residential', 'building', 'yes', 'address', 'road'].includes(d.type) || a.house_number;
        return inCA && isAddr;
      });
      
      return filtered.map((d: any) => {
        const a = d.address || {};
        const num = a.house_number || '';
        const road = a.road || a.pedestrian || a.footway || a.path || '';
        const primary = (num && road) ? `${num} ${road}` : (d.name || d.display_name.split(',')[0]);
        const city = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || '';
        const zip = a.postcode || '';
        return { primary, city, zip, lat: d.lat, lon: d.lon };
      });
    } catch(e) {
      return [];
    }
  };

  const search = useCallback(async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      setIsVisible(false);
      return;
    }

    try {
      const newResults = await searchCA(query);
      setResults(newResults);
      setIsVisible(newResults.length > 0);
      setActiveIndex(-1);
    } catch(e) {
      setResults([]);
      setIsVisible(false);
    }
  }, []);

  const hide = () => {
    setIsVisible(false);
    setActiveIndex(-1);
  };

  const show = () => {
    if (results.length > 0) {
      setIsVisible(true);
    }
  };

  const highlight = (index: number) => {
    setActiveIndex(index);
  };

  const selectByIndex = (index: number) => {
    const item = results[index];
    if (!item) return null;
    
    const formattedAddress = `${item.primary}, ${item.city}, CA${item.zip ? ' ' + item.zip : ''}`;
    hide();
    return { ...item, formattedAddress };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isVisible || results.length === 0) return null;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = (activeIndex + 1) % results.length;
      setActiveIndex(newIndex);
      return null;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = (activeIndex - 1 + results.length) % results.length;
      setActiveIndex(newIndex);
      return null;
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        return selectByIndex(activeIndex);
      }
    } else if (e.key === 'Escape') {
      hide();
      return null;
    }
    
    return null;
  };

  return {
    results,
    isVisible,
    activeIndex,
    search,
    hide,
    show,
    highlight,
    selectByIndex,
    handleKeyDown
  };
}