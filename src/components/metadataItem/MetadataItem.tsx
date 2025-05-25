import { useState } from 'react';
import styles from './metadataItem.module.css';

export default function MetadataItem({ label, value, description }: { label: string; value: string; description?: string }) {
    const [showDescription, setShowDescription] = useState(false);

    return (
        <div className={styles.container}>
            <div className={styles.labelContainer}>
                <p className={styles.label}>{ label }</p>
                <p
                    className={styles.infoButton}
                    onClick={() => setShowDescription(!showDescription)}
                >
                    ?
                </p>
            </div>
            
            <p className={styles.value}>{ value }</p>

            {
                showDescription && (
                    <p
                        className={styles.description}
                        onClick={() => setShowDescription(!showDescription)}
                    >
                        { description }
                    </p>
                )
            }
        </div>
    )
}
