'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

import styles from './searchbar.module.css'; // Adjust the path as necessary

interface SearchBarProps {
  onPlaceSelect: (lat: number, lng: number) => void;
}

export default function SearchBar({ onPlaceSelect }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const placesLibrary = useMapsLibrary('places');
  const geocodingLibrary = useMapsLibrary('geocoding');

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (placesLibrary && !autocompleteService.current) {
      autocompleteService.current = new placesLibrary.AutocompleteService();
    }
    if (geocodingLibrary && !geocoder.current) {
      geocoder.current = new geocodingLibrary.Geocoder();
    }
  }, [placesLibrary, geocodingLibrary]);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowDropdown(true);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (value.length > 2) {
      debounceTimeout.current = setTimeout(() => {
        if (autocompleteService.current) {
          autocompleteService.current.getPlacePredictions(
            { input: value },
            (predictionsResult, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && predictionsResult) {
                setPredictions(predictionsResult);
              } else {
                setPredictions([]);
              }
            }
          );
        }
      }, 300);
    } else {
      setPredictions([]);
    }
  };

  const handlePredictionClick = useCallback(async (prediction: google.maps.places.AutocompletePrediction) => {
    setInputValue(prediction.description);
    setPredictions([]);
    setShowDropdown(false);

    if (geocoder.current) {
      try {
        const response = await geocoder.current.geocode({ placeId: prediction.place_id });
        if (response.results.length > 0) {
          const location = response.results[0].geometry.location;

          onPlaceSelect(location.lat(), location.lng());
        } else {
          console.error('No results found for place ID:', prediction.place_id);
        }
      } catch (error) {
        console.error('Error geocoding place ID:', error);
      }
    }
  }, [onPlaceSelect, geocoder]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={searchContainerRef}
      className={styles.searchContainer}
    >
      <input
        type="text"
        placeholder="Buscar Ubicación..."
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        className={styles.searchInput}
      />

      {showDropdown && predictions.length > 0 && (
        <ul className={styles.predictionList}>
          {predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              onClick={() => handlePredictionClick(prediction)}
              className={styles.predictionItem}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              {prediction.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}