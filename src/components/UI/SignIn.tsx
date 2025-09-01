import { CSS_CLASSES, cn } from '@/styles/constants';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
  const { signInWithGoogle, loading } = useAuth();
  return (
    <div className={cn(CSS_CLASSES.flex.center, 'min-h-[60vh]')}>
      <div className={cn(CSS_CLASSES.container.card, 'max-w-md w-full p-6 text-center')}>
        <h2 className="text-xl font-semibold mb-2">Entre para começar</h2>
        <p className={cn(CSS_CLASSES.text.muted, 'mb-4')}>Use sua conta do Google para salvar seus dados com segurança.</p>
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className={cn(CSS_CLASSES.button.primary, loading && 'opacity-50 cursor-not-allowed', 'w-full')}
        >
          {loading ? 'Carregando…' : 'Entrar com Google'}
        </button>
      </div>
    </div>
  );
}

