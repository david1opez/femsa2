'use client'; 
import { useMemo, useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import Image from 'next/image';
import React from 'react';
import Draggable from 'react-draggable';

import weights from '../../femsaDb.json';

import styles from './page.module.css';

// COMPONENTS
import HeatmapLayer from '@/components/heatmapLayer/HeatmapLayer';
import SearchBar from '@/components/searchbar/Searchbar';
import MultiSelect from '@/components/multiSelect/MultiSelect';
import MetadataItem from '@/components/metadataItem/MetadataItem';
import CircularGraph from '@/components/CircularGraph';
import PredictionPopup from '@/components/PredictionPopup';

// Define the type for store data
interface StoreData {
  "ID de Tienda": string;
  "clave de plaza": string;
  "nivel socioeconomico": string;
  entorno: string;
  metros: string;
  lat: string;
  lng: string;
  "segmento maestro": string;
  "tipo de ubicacion": string;
  weight: string;
}

const INITIAL_ZOOM = 15;

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

  const [initialCenter, setInitialCenter] = useState({ lat: 25.651449, lng: -100.289411 });
  const [data, setData] = useState(weights);

  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(INITIAL_ZOOM);

  const [activeStore, setActiveStore] = useState<StoreData | null>(null);
  const [formPopup, setFormPopup] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({
    TIENDA_ID: '',
    PLAZA_CVE: '',
    NIVELSOCIOECONOMICO_DES: '',
    ENTORNO_DES: '',
    MTS2VENTAS_NUM: '',
    PUERTASREFRIG_NUM: '',
    CAJONESESTACIONAMIENTO_NUM: '',
    LATITUD_NUM: '',
    LONGITUD_NUM: '',
    SEGMENTO_MAESTRO_DESC: '',
    LID_UBICACION_TIENDA: '',
    DATASET: 'LIVE',
  });
  const [prediction, setPrediction] = useState<null | { prob_rentable: number; rentable: boolean }>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [tipoSelected, setTipoSelected] = useState<string[]>([]);
  const [segmentoSelected, setSegmentoSelected] = useState<string[]>([]);
  const [entornoSelected, setEntornoSelected] = useState<string[]>([]);

  // Helper to check if a marker was clicked
  const markerClickRef = React.useRef(false);

  // Ref for draggable popup
  const popupRef = React.useRef<HTMLDivElement>(null) as React.RefObject<HTMLElement>;

  const handlePlaceSelect = useCallback((lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    setInitialCenter({ lat, lng });
    setMapZoom(17);
  }, []);

  const handleCameraChanged = useCallback((ev: MapCameraChangedEvent) => {
    setMapCenter(ev.detail.center);
    setMapZoom(ev.detail.zoom);
  }, []);

  const handleFilters = useCallback((selected: string[], type: string) => {
    const filteredData = weights.filter((item: { [key: string]: string }) => {
      if (type === 'tipo de ubicacion') {
        return selected.includes(item['tipo de ubicacion']);
      } else if (type === 'segmento maestro') {
        return selected.includes(item['segmento maestro']);
      } else if (type === 'entorno') {
        return selected.includes(item['entorno']);
      }
      return true;
    });
    
    setData(filteredData);
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (!apiKey) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', color: 'red' }}>
        Error: Google Maps API key is not set. Please set NEXT_PUBLIC_Maps_API_KEY in your .env.local file.
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={['places', 'geocoding', 'visualization']}
    >
      <Map
        style={{ width: '100%', height: '100vh' }}
        center={mapCenter}
        zoom={mapZoom}
        mapId="DEMO_MAP_ID"
        disableDefaultUI
        clickableIcons={false}
        onCameraChanged={handleCameraChanged}
        onClick={e => {
          if (markerClickRef.current) {
            markerClickRef.current = false;
            return;
          }
          const latLng = e.detail && e.detail.latLng;
          if (latLng && latLng.lat != null && latLng.lng != null) {
            setFormPopup({ lat: latLng.lat, lng: latLng.lng });
            setFormData(f => ({ ...f, LATITUD_NUM: String(latLng.lat), LONGITUD_NUM: String(latLng.lng) }));
            setPrediction(null);
            setFormError(null);
          }
        }}
      >
        <HeatmapLayer heatmapData={data.map((point) => ({
          lat: parseFloat(point.lat),
          lng: parseFloat(point.lng),
          weight: parseFloat(point.weight)
        }))}
        />

        {
          data.map((point, index) => mapZoom > 13 && (
            <AdvancedMarker
              key={index}
              position={{ lat: parseFloat(point.lat), lng: parseFloat(point.lng) }}
              onClick={e => {
                markerClickRef.current = true;
                setActiveStore(data[index] as StoreData);
              }}
            >
              <svg className={styles.marker} width="29" height="30" viewBox="0 0 39 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.81842 21.5186L6.7901 21.4971C6.75452 21.4704 6.72039 21.4416 6.68561 21.4141C6.7297 21.4491 6.77307 21.485 6.81842 21.5186ZM32.0128 21.4971L31.9893 21.5137C32.0328 21.4815 32.0749 21.4477 32.1172 21.4141C32.0825 21.4416 32.0483 21.4705 32.0128 21.4971ZM6.57819 21.3281C6.55398 21.3078 6.53068 21.2864 6.5069 21.2656C6.53067 21.2864 6.55399 21.3078 6.57819 21.3281ZM32.3487 21.2178C32.3074 21.255 32.2663 21.2923 32.2237 21.3281C32.2663 21.2923 32.3074 21.255 32.3487 21.2178ZM5.96783 20.7148C6.04898 20.8126 6.13516 20.906 6.22369 20.9971C6.13507 20.906 6.04897 20.8125 5.96783 20.7148ZM32.835 20.7139C32.8024 20.7531 32.7682 20.7909 32.7344 20.8291C32.7682 20.7909 32.8025 20.7531 32.835 20.7139ZM33.0176 20.4785C32.9795 20.5306 32.9396 20.5813 32.8995 20.6318C32.9396 20.5813 32.9795 20.5307 33.0176 20.4785ZM5.88287 20.6055C5.85067 20.5644 5.81804 20.5236 5.78717 20.4814C5.81803 20.5236 5.85069 20.5643 5.88287 20.6055ZM33.1856 20.2334C33.1493 20.2901 33.111 20.3453 33.0723 20.4004C33.1109 20.3453 33.1493 20.2901 33.1856 20.2334ZM5.72662 20.3955C5.69051 20.3439 5.65428 20.2923 5.62018 20.2393C5.65428 20.2923 5.69054 20.3439 5.72662 20.3955ZM33.3321 19.9893C33.3022 20.0425 33.2702 20.0944 33.2383 20.1465C33.2702 20.0945 33.3022 20.0426 33.3321 19.9893ZM5.54205 20.1104C5.51685 20.0683 5.49178 20.0262 5.46783 19.9834C5.49178 20.0262 5.51686 20.0683 5.54205 20.1104ZM5.40533 19.8682C5.3912 19.8412 5.376 19.8144 5.36237 19.7871C5.35337 19.7691 5.34574 19.7505 5.33698 19.7324C5.35906 19.778 5.3818 19.8232 5.40533 19.8682ZM33.4405 19.7871C33.4281 19.8118 33.4142 19.8359 33.4014 19.8604C33.424 19.8171 33.4456 19.7734 33.4669 19.7295C33.4577 19.7485 33.4499 19.7682 33.4405 19.7871ZM33.5958 19.4404C33.5717 19.4999 33.5461 19.5587 33.5196 19.6172C33.5461 19.5587 33.5717 19.4999 33.5958 19.4404ZM5.27545 19.6006C5.25533 19.5557 5.23656 19.5103 5.21783 19.4648C5.23656 19.5103 5.25533 19.5557 5.27545 19.6006ZM33.6993 19.1621C33.6782 19.2248 33.6555 19.2868 33.6319 19.3486C33.6555 19.2868 33.6782 19.2248 33.6993 19.1621ZM5.16412 19.3311C5.14701 19.2857 5.13103 19.2401 5.1153 19.1943C5.13103 19.2401 5.14702 19.2858 5.16412 19.3311ZM33.7842 18.8789C33.7672 18.9421 33.7491 19.0049 33.7296 19.0674C33.7491 19.0049 33.7672 18.9421 33.7842 18.8789ZM5.06744 19.0488C5.05363 19.0041 5.04088 18.9591 5.02838 18.9141C5.04089 18.9591 5.05364 19.0041 5.06744 19.0488ZM33.8516 18.5928C33.8386 18.6565 33.8253 18.7201 33.8096 18.7832C33.8253 18.7201 33.8385 18.6565 33.8516 18.5928ZM4.98834 18.7617C4.97599 18.7108 4.96486 18.6597 4.95416 18.6084C4.96486 18.6597 4.97599 18.7108 4.98834 18.7617ZM33.9044 18.2881C33.8944 18.3593 33.8833 18.4303 33.8702 18.501C33.8833 18.4303 33.8944 18.3593 33.9044 18.2881ZM4.9317 18.5C4.91937 18.4333 4.90998 18.3661 4.90045 18.2988C4.90999 18.3661 4.91936 18.4333 4.9317 18.5ZM33.9327 18.0342C33.9276 18.0932 33.9223 18.1522 33.9151 18.2109C33.9223 18.1522 33.9276 18.0932 33.9327 18.0342ZM4.85944 17.9229C4.86549 18.0189 4.87506 18.1146 4.88678 18.21C4.87508 18.1146 4.86546 18.0189 4.85944 17.9229ZM30.6094 6.70703L30.7081 6.71094C30.9372 6.73029 31.1572 6.81385 31.3419 6.95312C31.5266 7.09245 31.6675 7.28101 31.7491 7.49609L31.7803 7.58984L33.9434 15.1631L33.9512 15.1953H4.85162C4.85458 15.1841 4.85721 15.1734 4.85944 15.1641L7.0235 7.58984C7.09701 7.33593 7.25093 7.11231 7.46198 6.95312C7.64672 6.81389 7.86655 6.73018 8.09576 6.71094L8.1944 6.70703H30.6094ZM7.27545 21.8604L6.84283 21.5371C6.92202 21.5948 7.00318 21.6501 7.086 21.7031L7.17487 21.7598L7.27155 21.8008V21.7979V21.7998L7.35651 21.8662L7.45123 21.916C8.19036 22.3037 9.01741 22.4943 9.85162 22.4688C10.6857 22.4432 11.499 22.2025 12.213 21.7705C12.9269 21.3385 13.5172 20.729 13.9268 20.002C14.3363 19.275 14.5513 18.4545 14.5508 17.6201L14.5567 17.8604C14.6161 19.0593 15.1189 20.197 15.9717 21.0498C16.8813 21.9594 18.1151 22.4707 19.4014 22.4707C20.6878 22.4707 21.9215 21.9594 22.8311 21.0498C23.7407 20.1402 24.252 18.9065 24.252 17.6201V17.6191C24.2515 18.4538 24.4664 19.2747 24.876 20.002C25.2857 20.7292 25.8767 21.3384 26.5909 21.7705C27.305 22.2025 28.1189 22.4434 28.9532 22.4688C29.7873 22.494 30.6137 22.3028 31.3526 21.915L31.4473 21.8652L31.5313 21.8008L31.628 21.7598L31.7159 21.7041C31.7972 21.6521 31.8763 21.5966 31.9542 21.54L31.5274 21.8604V32.1719C31.5265 32.4931 31.3991 32.8012 31.1719 33.0283C30.9443 33.2559 30.6354 33.3834 30.3135 33.3838H8.48932C8.1677 33.3834 7.8594 33.2556 7.6319 33.0283C7.43277 32.8292 7.30918 32.5678 7.28131 32.29L7.27545 32.1699V21.8604Z" fill="none" stroke="#ED1600" stroke-width="2.4252"/>
              </svg>
            </AdvancedMarker>
          )
        )}

        <AdvancedMarker position={initialCenter}/>
      </Map>

      <div className={styles.page}>
        <div className={styles.sidebar}>
          <div className={styles.header}>
            <Image
              src={'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Oxxo_Logo.svg/2560px-Oxxo_Logo.png'}
              alt="Logo"
              width={100}
              height={50}
              className={styles.logo}
            />
            <h1 className={styles.title}>RADAR</h1>
          </div>

          <SearchBar onPlaceSelect={handlePlaceSelect} />

          <h2 className={styles.divider}>Filtros</h2>

          <MultiSelect
            label="Tipo de Ubicación:"
            options={[
              { value: 'UT_CARRETERA_GAS', label: 'Gasolinera en Carretera' },
              { value: 'UT_DENSIDAD', label: 'Densidad' },
              { value: 'UT_GAS_URBANA', label: 'Gasolinera Urbana' },
              { value: 'UT_TRAFICO_PEATONAL', label: 'Tráfico Peatonal' },
              { value: 'UT_TRAFICO_VEHICULAR', label: 'Tráfico Vehicular' }
            ]}
            selected={tipoSelected}
            onChange={selected => { setTipoSelected(selected); handleFilters(selected, 'tipo de ubicacion'); }}
          />

          <MultiSelect
            label="Segmento Maestro:"
            options={[
              { value: 'Barrio Competido', label: 'Barrio Competido' },
              { value: 'Clásico', label: 'Clásico' },
              { value: 'Hogar Reunión', label: 'Hogar Reunión' },
              { value: 'NA', label: 'NA' },
              { value: 'Oficinistas', label: 'Oficinistas' },
              { value: 'Parada Técnica', label: 'Parada Técnica' }
            ]}
            selected={segmentoSelected}
            onChange={selected => { setSegmentoSelected(selected); handleFilters(selected, 'segmento maestro'); }}
          />

          <MultiSelect
            label="Entorno:"
            options={[
              { value: 'Base', label: 'Base' },
              { value: 'Hogar', label: 'Hogar' },
              { value: 'Peatonal', label: 'Peatonal' },
              { value: 'Receso', label: 'Receso' }
            ]}
            selected={entornoSelected}
            onChange={selected => { setEntornoSelected(selected); handleFilters(selected, 'entorno'); }}
          />
        </div>

        {
          activeStore && (
            <div className={styles.bottombar}>
              <button
                className={styles.closeButton}
                onClick={() => setActiveStore(null)}
                aria-label="Cerrar"
              >
                x
              </button>
              <div className={styles.dataContainer}>
                <p className={styles.label}>Imágen:</p>
                <Image
                  src={'https://oxxo-com.s3.amazonaws.com/media-library/415f9bff93446f33e5d10530c98f209f.png'}
                  alt="OXXO Image"
                  width={100}
                  height={100}
                  className={styles.image}
                />
              </div>
                <div className={styles.dataContainer}>
                <MetadataItem
                  label="ID de Tienda:"
                  value={activeStore["ID de Tienda"] ?? "N/A"}
                  description=""
                />
                <MetadataItem
                  label="Clave de Plaza:"
                  value={activeStore["clave de plaza"] ?? "N/A"}
                  description=""
                />
                <MetadataItem
                  label="Coordenadas:"
                  value={`${activeStore.lat}, ${activeStore.lng}`}
                  description=""
                />
                <MetadataItem
                  label="Tipo de Ubicación:"
                  value={activeStore["tipo de ubicacion"] ?? "N/A"}
                  description=""
                />
                </div>
                <div className={styles.dataContainer}>
                <MetadataItem
                  label="Nivel Socioeconómico:"
                  value={activeStore["nivel socioeconomico"] ?? "N/A"}
                  description=""
                />
                <MetadataItem
                  label="Segmento Maestro:"
                  value={activeStore["segmento maestro"] ?? "N/A"}
                  description=""
                />
                <MetadataItem
                  label="Entorno:"
                  value={activeStore["entorno"] ?? "N/A"}
                  description=""
                />
                <MetadataItem
                  label="Metros Cuadrados:"
                  value={activeStore["metros"] ?? "N/A"}
                  description=""
                />
                </div>
                <div className={styles.graphContainer}>
                <CircularGraph percentage={Math.floor(parseInt(activeStore.weight))} current={12345} total={17101} />
                </div>
            </div>
          )
        }
      </div>

      <PredictionPopup
        formPopup={formPopup}
        setFormPopup={setFormPopup}
        formData={formData}
        setFormData={setFormData}
        formLoading={formLoading}
        formError={formError}
        prediction={prediction}
        setFormLoading={setFormLoading}
        setFormError={setFormError}
        setPrediction={setPrediction}
      />
    </APIProvider>
  );
}