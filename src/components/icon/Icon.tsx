import Icons from './icons.json';

// TYPES
import { IconProps, IconType } from '@/types/IconTypes';

export default function Icon({ size, color, name, strokeWidth, className, style, onClick, onMouseEnter, onMouseLeave }: IconProps) {
    const Icon: IconType = Icons[name] as IconType;

    if (!Icon) return null;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={typeof size === 'object' ? size.width : size}
            height={typeof size === 'object' ? size.height : size}
            viewBox={Icon.viewbox}
            className={className}
            onClick={onClick && onClick}
            onMouseEnter={onMouseEnter && onMouseEnter}
            onMouseLeave={onMouseLeave && onMouseLeave}
            style={{cursor: onClick ? 'pointer' : 'default', ...style}}
            role="img"
            aria-label={name}
        >
            {
                Icon.paths.map((path, index) => (
                    <path
                        key={index}
                        d={path.d}
                        fill={path.fill ? color : 'none'}
                        stroke={color ? color : path.stroke}
                        strokeWidth={strokeWidth ? strokeWidth : path.strokeWidth}
                        strokeLinecap={path.strokeLinecap}
                        strokeLinejoin={path.strokeLinejoin}
                    />
                ))
            }
        </svg>
    );
}