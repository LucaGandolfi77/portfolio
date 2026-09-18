import { Download, Share, SquarePlus, X } from 'lucide-react';
import { useEffect } from 'react';
import { EXIT_MS, useAnimatedExit } from '../hooks/useAnimatedExit';

interface InstallHintProps {
  /** Se true il banner deve essere visibile. */
  visible: boolean;
  platform: 'ios' | 'chromium' | 'none';
  onDismiss: () => void;
  onInstall: () => void;
}

/**
 * Banner di installazione. Su iOS mostra i passaggi reali di Safari
 * (Condividi -> Aggiungi a Home), su Chromium usa il prompt nativo.
 *
 * Come il toast, l'entrata è un'animazione CSS di sola trasformazione: il banner
 * è leggibile di default e non dipende da un'animazione che deve completare.
 *
 * Nota: viene renderizzato solo quando sta entrando o è a schermo, e si smonta
 * dopo la propria uscita — la decisione di mostrarlo resta al genitore.
 */
export function InstallHint({ visible, platform, onDismiss, onInstall }: InstallHintProps) {
  const { leaving, requestExit, reset } = useAnimatedExit(onDismiss, EXIT_MS);

  useEffect(() => {
    if (visible) reset();
  }, [visible, reset]);

  // Se il genitore lo nasconde (es. si apre una modale) esce con calma.
  useEffect(() => {
    if (!visible) requestExit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible && !leaving) return null;

  return (
    <aside
      className={`installhint ${leaving ? 'installhint--leaving' : ''}`}
      aria-label="Installa l'app sulla schermata Home"
    >
      <button
        type="button"
        className="installhint__close"
        onClick={requestExit}
        aria-label="Chiudi il suggerimento di installazione"
      >
        <X size={15} aria-hidden="true" />
      </button>

      <p className="installhint__title">Portala con te 🛼</p>

      {platform === 'ios' ? (
        <p className="installhint__text">
          Tocca <Share size={14} className="installhint__inline" aria-label="Condividi" /> in Safari,
          poi <SquarePlus size={14} className="installhint__inline" aria-label="Aggiungi a Home" />{' '}
          <strong>Aggiungi a Home</strong>. Si aprirà come una vera app, anche senza rete.
        </p>
      ) : (
        <>
          <p className="installhint__text">
            Installala come app: si apre a tutto schermo e funziona anche offline.
          </p>
          <button type="button" className="btn btn--primary btn--small" onClick={onInstall}>
            <Download size={15} aria-hidden="true" />
            Installa l’app
          </button>
        </>
      )}
    </aside>
  );
}
