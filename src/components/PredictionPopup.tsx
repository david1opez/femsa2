import React from 'react';
import Draggable from 'react-draggable';
import styles from './predictionPopup.module.css';

interface PredictionPopupProps {
  formPopup: { lat: number; lng: number } | null;
  setFormPopup: (v: any) => void;
  formData: any;
  setFormData: (v: any) => void;
  formLoading: boolean;
  formError: string | null;
  prediction: { prob_rentable: number; rentable: boolean } | null;
  setFormLoading: (v: boolean) => void;
  setFormError: (v: string | null) => void;
  setPrediction: (v: any) => void;
}

const PredictionPopup: React.FC<PredictionPopupProps> = ({
  formPopup,
  setFormPopup,
  formData,
  setFormData,
  formLoading,
  formError,
  prediction,
  setFormLoading,
  setFormError,
  setPrediction,
}) => {
  // Use correct ref type for Draggable and div
  const popupRef = React.useRef<HTMLDivElement>(null);

  if (!formPopup) return null;

  return (
    <Draggable nodeRef={popupRef as React.RefObject<HTMLElement>}>
      <div ref={popupRef} className={styles.popupContainer}>
        <button className={styles.closeButton} onClick={() => setFormPopup(null)}>×</button>
        <h2 className={styles.title}>Predecir Rentabilidad de Tienda</h2>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setFormLoading(true);
            setFormError(null);
            setPrediction(null);
            try {
              const res = await fetch('https://backData25.onrender.com/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...formData,
                  TIENDA_ID: 12,
                  PLAZA_CVE: parseInt(formData.PLAZA_CVE),
                  MTS2VENTAS_NUM: formData.MTS2VENTAS_NUM ? parseFloat(formData.MTS2VENTAS_NUM) : null,
                  PUERTASREFRIG_NUM: formData.PUERTASREFRIG_NUM ? parseInt(formData.PUERTASREFRIG_NUM) : null,
                  CAJONESESTACIONAMIENTO_NUM: formData.CAJONESESTACIONAMIENTO_NUM ? parseInt(formData.CAJONESESTACIONAMIENTO_NUM) : null,
                  LATITUD_NUM: parseFloat(formData.LATITUD_NUM),
                  LONGITUD_NUM: parseFloat(formData.LONGITUD_NUM),
                }),
              });
              if (!res.ok) throw new Error(await res.text());
              const data = await res.json();
              setPrediction(data);
            } catch (err: any) {
              setFormError(err.message || 'Error al predecir');
            } finally {
              setFormLoading(false);
            }
          }}
        >
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Clave de Plaza
                <select required value={formData.PLAZA_CVE} onChange={e => setFormData((f: any) => ({ ...f, PLAZA_CVE: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.formField}>
              <label>Nivel Socioeconómico
                <select required value={formData.NIVELSOCIOECONOMICO_DES} onChange={e => setFormData((f: any) => ({ ...f, NIVELSOCIOECONOMICO_DES: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {['A','AB','B','BC','C','CD','D'].map(nivel => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.formField}>
              <label>Entorno
                <select required value={formData.ENTORNO_DES} onChange={e => setFormData((f: any) => ({ ...f, ENTORNO_DES: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {['Base', 'Hogar', 'Peatonal', 'Receso'].map(entorno => (
                    <option key={entorno} value={entorno}>{entorno}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.formField}>
              <label>m² de ventas<input required type="number" step="0.01" value={formData.MTS2VENTAS_NUM} onChange={e => setFormData((f: any) => ({ ...f, MTS2VENTAS_NUM: e.target.value }))} /></label>
            </div>
            <div className={styles.formField}>
              <label>Puertas Refrigeración<input required type="number" value={formData.PUERTASREFRIG_NUM} onChange={e => setFormData((f: any) => ({ ...f, PUERTASREFRIG_NUM: e.target.value }))} /></label>
            </div>
            <div className={styles.formField}>
              <label>Cajones Estacionamiento<input required type="number" value={formData.CAJONESESTACIONAMIENTO_NUM} onChange={e => setFormData((f: any) => ({ ...f, CAJONESESTACIONAMIENTO_NUM: e.target.value }))} /></label>
            </div>
            <div className={styles.formField}>
              <label>Latitud<input required type="number" value={formData.LATITUD_NUM} readOnly /></label>
            </div>
            <div className={styles.formField}>
              <label>Longitud<input required type="number" value={formData.LONGITUD_NUM} readOnly /></label>
            </div>
            <div className={styles.formField}>
              <label>Segmento Maestro
                <select required value={formData.SEGMENTO_MAESTRO_DESC} onChange={e => setFormData((f: any) => ({ ...f, SEGMENTO_MAESTRO_DESC: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {['Hogar Reunión', 'Barrio competido', 'Oficinistas', 'Clásico', 'Parada Técnica', 'NA'].map(segmento => (
                    <option key={segmento} value={segmento}>{segmento}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.formField}>
              <label>LID Ubicación Tienda
                <select required value={formData.LID_UBICACION_TIENDA} onChange={e => setFormData((f: any) => ({ ...f, LID_UBICACION_TIENDA: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {['UT_CARRETERA_GAS', 'UT_TRAFICO_VEHICULAR', 'UT_DENSIDAD'].map(ubicacion => (
                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <button type="submit" className={styles.submitButton} disabled={formLoading}>{formLoading ? 'Prediciendo...' : 'Predecir'}</button>
          {formError && <div className={styles.error}>{formError}</div>}
          {prediction && (
            <div className={styles.predictionResult + ' ' + (prediction.rentable ? styles.rentable : styles.notRentable)}>
              <b>Probabilidad de ser rentable:</b> {(prediction.prob_rentable * 100).toFixed(2)}%<br />
              <b>¿Rentable?:</b> {prediction.rentable ? 'Sí' : 'No'}
            </div>
          )}
        </form>
      </div>
    </Draggable>
  );
};

export default PredictionPopup;
