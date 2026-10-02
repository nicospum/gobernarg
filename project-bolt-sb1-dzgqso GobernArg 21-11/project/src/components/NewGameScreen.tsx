import { useRef, useState, type ChangeEvent } from 'react';
import { ArrowLeft, Check, ImagePlus, Lock, Play, Trophy } from 'lucide-react';
import { PresidentialMark } from './causal/SituationRoom';
import { PROFILES } from '../causal/campaignCatalog';
import { DIFFICULTY_LEVELS, HISTORIC_SCENARIOS, getScenario, isScenarioUnlocked, type ScenarioDef } from '../causal/scenarios';
import { loadProgress } from '../causal/progress';
import { LITE_FEATURES } from '../lite/config';
import type { Profile } from '../causal/campaignTypes';
import { AVATARS, DEFAULT_AVATAR, avatarSrc } from '../lib/avatars';
import { processPhoto } from '../lib/photo';
import { IMAGES } from '../utils/imageAssets';
import { THUMBNAIL_ARCHETYPES } from '../utils/iconThumbnails';

export interface NewGameChoice { name: string; avatar: string; profile: Profile; scenarioId: string }

interface Props {
  onBack: () => void;
  onStart: (choice: NewGameChoice) => void;
  /** Escenarios históricos desbloqueables. Por defecto, lo que diga LITE_FEATURES. */
  historicScenarios?: boolean;
}

function unlockHint(sc: ScenarioDef): string {
  return sc.reelectionsToUnlock === 1 ? 'Ganá tu primera reelección para desbloquearlo.' : `Ganá ${sc.reelectionsToUnlock} reelecciones para desbloquearlo.`;
}

const PROFILE_IDS = Object.keys(PROFILES) as Profile[];

/** Nueva partida en una sola pantalla: nombre, foto, perfil y nivel. */
export function NewGameScreen({ onBack, onStart, historicScenarios = LITE_FEATURES.escenariosHistoricos }: Props) {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  // La foto subida se conserva aunque se elija otra de la grilla, para poder volver a ella.
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [profile, setProfile] = useState<Profile>('politico');
  const [scenarioId, setScenarioId] = useState(DIFFICULTY_LEVELS[0].scenarioId);
  const [progress] = useState(() => historicScenarios ? loadProgress() : null);
  const fileInput = useRef<HTMLInputElement>(null);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPhotoError(null); setProcessing(true);
    try {
      const data = await processPhoto(file);
      setPhoto(data); setAvatar(data);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'No se pudo usar esa imagen.');
    } finally { setProcessing(false); }
  };

  const start = () => {
    if (!name.trim()) { setNameError(true); return; }
    onStart({ name: name.trim(), avatar, profile, scenarioId });
  };

  const preview = avatarSrc(avatar);
  return <div className="b-new-game">
    <div className="b-new-bg" style={{ backgroundImage: `url(${IMAGES.backgrounds.congressSunrise})` }} aria-hidden="true" />
    <div className="b-new-inner">
      <header className="b-new-header">
        <div className="b-onboarding-mark"><PresidentialMark /></div>
        <button type="button" className="causal-secondary b-new-back" onClick={onBack}><ArrowLeft size={15} />Volver</button>
      </header>

      <main className="b-new-panel">
        <h1 className="font-display">Nueva partida</h1>
        <p className="b-new-lead">Definí quién asume la Presidencia, con qué perfil y en qué país.</p>

        <section className="b-new-section b-new-identity">
          <div className="b-new-portrait">{preview && <img src={preview} alt="Tu foto" />}</div>
          <label className="b-new-field">
            <span className="b-new-label">Nombre</span>
            <input type="text" value={name} maxLength={120} aria-label="Nombre del presidente" placeholder="Ingresá tu nombre"
              aria-invalid={nameError || undefined} aria-describedby={nameError ? 'new-name-error' : undefined}
              onChange={event => { setName(event.target.value); setNameError(false); }} />
            {nameError && <span id="new-name-error" role="alert" className="b-new-error">Escribí un nombre para empezar.</span>}
          </label>
        </section>

        <section className="b-new-section" aria-labelledby="new-photo">
          <h2 id="new-photo" className="b-new-label">Foto</h2>
          <div className="b-new-avatars" role="radiogroup" aria-label="Foto">
            {AVATARS.map((item, i) => <button key={item.id} type="button" role="radio" aria-checked={avatar === item.id} aria-label={`Avatar ${i + 1}`}
              className="b-new-avatar" onClick={() => setAvatar(item.id)}><img src={item.src} alt="" /></button>)}
            {photo && <button type="button" role="radio" aria-checked={avatar === photo} aria-label="Mi foto" className="b-new-avatar" onClick={() => setAvatar(photo)}><img src={photo} alt="" /></button>}
            <button type="button" className="b-new-avatar b-new-upload" disabled={processing} onClick={() => fileInput.current?.click()}>
              <ImagePlus size={20} /><span>{processing ? 'Procesando…' : photo ? 'Cambiar mi foto' : 'Subir mi foto'}</span>
            </button>
          </div>
          <input ref={fileInput} type="file" accept="image/*" className="sr-only" aria-label="Subir mi foto" tabIndex={-1} onChange={upload} />
          {photoError && <p role="alert" className="b-new-error">{photoError}</p>}
          <p className="b-new-hint">La foto se recorta en cuadrado y queda guardada solo en este navegador. Máximo 10 MB.</p>
        </section>

        <section className="b-new-section" aria-labelledby="new-profile">
          <h2 id="new-profile" className="b-new-label">Perfil</h2>
          <div className="b-new-options b-new-profiles" role="radiogroup" aria-label="Perfil">
            {PROFILE_IDS.map(id => <button key={id} type="button" role="radio" aria-checked={profile === id} className="b-new-option" onClick={() => setProfile(id)}>
              <img src={THUMBNAIL_ARCHETYPES[id]} alt="" />
              <span><strong>{PROFILES[id].name}</strong><small>{PROFILES[id].summary}</small></span>
              {profile === id && <Check size={16} className="b-new-check" aria-hidden="true" />}
            </button>)}
          </div>
        </section>

        <section className="b-new-section" aria-labelledby="new-level">
          <h2 id="new-level" className="b-new-label">Nivel</h2>
          <div className="b-new-options b-new-levels" role="radiogroup" aria-label="Nivel">
            {DIFFICULTY_LEVELS.map(item => {
              const scenario = getScenario(item.scenarioId);
              return <button key={item.id} type="button" role="radio" aria-checked={scenarioId === item.scenarioId} className="b-new-option" onClick={() => setScenarioId(item.scenarioId)}>
                <span><strong className="font-display">{item.label}</strong><small>{item.tagline}</small>{scenario && <em>{scenario.name} · {scenario.era}</em>}</span>
                {scenarioId === item.scenarioId && <Check size={16} className="b-new-check" aria-hidden="true" />}
              </button>;
            })}
          </div>
        </section>

        {progress && <section className="b-new-section" aria-labelledby="new-historic">
          <div className="b-new-historic-head"><h2 id="new-historic" className="b-new-label">Escenarios históricos</h2><span><Trophy size={13} /> {progress.reelectionsWon === 1 ? '1 reelección ganada' : `${progress.reelectionsWon} reelecciones ganadas`}</span></div>
          <div className="b-new-options b-new-profiles" role="radiogroup" aria-label="Escenarios históricos">
            {HISTORIC_SCENARIOS.map(sc => {
              const unlocked = isScenarioUnlocked(sc, progress.reelectionsWon, progress.unlockAll);
              return <button key={sc.id} type="button" role="radio" aria-checked={scenarioId === sc.id} aria-disabled={!unlocked} className="b-new-option" disabled={!unlocked} onClick={() => setScenarioId(sc.id)}>
                <span><strong>{sc.name} · {sc.difficulty}</strong><small>{unlocked ? sc.description : <><Lock size={11} className="inline mr-1" />{unlockHint(sc)}</>}</small><em>{sc.era}</em></span>
                {scenarioId === sc.id && <Check size={16} className="b-new-check" aria-hidden="true" />}
              </button>;
            })}
          </div>
        </section>}

        <button type="button" className="causal-primary b-new-start" onClick={start} disabled={processing}><Play size={18} />Empezar</button>
      </main>
    </div>
  </div>;
}
