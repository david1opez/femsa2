import React from 'react';
import styles from './CircularGraph.module.css';

interface CircularGraphProps {
  percentage: number;
  current: number;
  total: number;
}

const CircularGraph: React.FC<CircularGraphProps> = ({ percentage, current, total }) => {
  const radius = 65;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={styles.circularGraphContainer}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className={styles.svg}
      >
        <circle
          stroke="#eee"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#ED1600"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={styles.progress}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          fontSize="2.4em"
          fontWeight="bold"
          fontFamily='"Poppins", sans-serif'
          fill="#ED1600"
        >
          {percentage}%
        </text>
      </svg>
      <div className={styles.label}>Cumplimiento de Metas <span className={styles.info}>?</span></div>
    </div>
  );
};

export default CircularGraph;
