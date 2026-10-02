import { Flag } from 'lucide-react';
import civic from '../../assets/images/banners/argentina-civic.webp';

/** Banner cívico de la mesa de decisiones (decorativo). */
export function CivicBanner() {
  return (
    <div className="relative h-[142px] overflow-hidden rounded-[14px] bg-sala-navy shadow-[0_10px_25px_rgb(18_61_91/0.12)]">
      <img
        src={civic}
        alt="Arquitectura cívica argentina: el Congreso y la Casa Rosada"
        className="sr-civic-img w-full h-full object-cover [filter:saturate(1.15)_contrast(1.05)]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--navy)/0.87)_0%,rgb(var(--navy-2)/0.35)_55%,transparent_100%)]" />
      <div className="absolute left-5 bottom-5 flex flex-col gap-2 text-white">
        <span className="sr-label !text-sala-sky">República Argentina · Mesa de decisiones</span>
        <strong className="text-[22px] leading-tight font-bold tracking-tight">Decidir también es construir país.</strong>
      </div>
      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md border border-white/60 px-2.5 py-1.5 text-[10px] font-extrabold tracking-[0.1em] text-white">
        <Flag size={15} /> ARG
      </div>
    </div>
  );
}
