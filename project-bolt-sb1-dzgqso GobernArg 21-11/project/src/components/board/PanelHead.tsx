import type { ReactNode } from 'react';

/** Cabecera común de los paneles: rótulo numerado, título y un extra a la derecha. */
export function PanelHead({ index, label, title, children }: { index?: string; label: string; title: string; children?: ReactNode }) {
  return (
    <div className="sr-panel-head">
      <div className="min-w-0">
        <span className="sr-label">{index ? `${index} / ` : ''}{label}</span>
        <h2 className="sr-panel-title">{title}</h2>
      </div>
      {children}
    </div>
  );
}
