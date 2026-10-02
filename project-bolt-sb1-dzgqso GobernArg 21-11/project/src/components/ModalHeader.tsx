import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  /** Rótulo chico en versalitas ("Cierre del trimestre"). */
  label: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Imagen de fondo (eventos, legado): queda bajo un velo marino. */
  image?: string;
  imageAlt?: string;
  icon?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  /** Centrado (pantallas de resultado). */
  center?: boolean;
  id?: string;
}

/** Cabecera de los modales en el estilo "sala de situación": banda marina con rótulo y título. */
export function ModalHeader({ label, title, subtitle, image, imageAlt = '', icon, onClose, closeLabel = 'Cerrar', center = false, id }: ModalHeaderProps) {
  return (
    <div className={`relative overflow-hidden sr-navy-bar ${image ? 'min-h-[150px] md:min-h-[180px] flex items-end' : ''}`}>
      {image && (
        <>
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(var(--navy))_8%,rgb(var(--navy)/0.72)_45%,rgb(var(--navy-2)/0.25)_100%)]" />
        </>
      )}
      <div className={`relative w-full flex items-start gap-3 px-5 md:px-6 py-4 md:py-5 ${center ? 'justify-center text-center' : ''}`}>
        {icon && !center && <div className="flex-shrink-0 mt-1">{icon}</div>}
        <div className={`min-w-0 ${center ? '' : 'flex-1'}`}>
          {icon && center && <div className="flex justify-center mb-2">{icon}</div>}
          <span className="sr-label !text-sala-sky">{label}</span>
          <h2 id={id} className="mt-1.5 text-[22px] md:text-[26px] leading-tight font-bold tracking-tight text-white">{title}</h2>
          {subtitle && <div className="text-[12px] md:text-[13px] text-sala-on-navy mt-1.5 leading-relaxed">{subtitle}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className={`${center ? 'absolute right-3 top-3' : 'flex-shrink-0'} w-10 h-10 grid place-items-center rounded-md text-white/80 hover:text-white hover:bg-white/10`}
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
