import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { RecaptchaVerifier, type ApplicationVerifier } from 'firebase/auth';
import { auth, isLocalMode } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { CSS_CLASSES, cn } from '@/styles/constants';

type AuthTab = 'email' | 'google' | 'phone';

const ADMIN_USERNAME = (import.meta.env.VITE_DEFAULT_ADMIN_USERNAME || 'Admin').toString();
const ADMIN_EMAIL = (import.meta.env.VITE_DEFAULT_ADMIN_EMAIL || 'admin@mybills.app').toString();
const ADMIN_PASSWORD = (import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD || '0000').toString();
const LOCAL_PHONE_CODE = (import.meta.env.VITE_DEFAULT_PHONE_CODE || '000000').toString();

const TABS: { key: AuthTab; label: string }[] = [
  { key: 'email', label: 'Email e senha' },
  { key: 'google', label: 'Google' },
  { key: 'phone', label: 'Telefone' },
];

const parseAuthError = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Email invalido.';
      case 'auth/user-not-found':
        return 'Usuario nao encontrado.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Credenciais invalidas.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.';
      case 'auth/invalid-verification-code':
        return 'Codigo informado e invalido.';
      case 'auth/missing-verification-code':
        return 'Informe o codigo recebido por SMS.';
      default:
        return error.message || 'Nao foi possivel autenticar. Tente novamente.';
    }
  }
  if (error instanceof Error) return error.message;
  return 'Nao foi possivel autenticar. Tente novamente.';
};

export default function LoginScreen() {
  const {
    isProcessing,
    signInWithEmail,
    signInWithGoogle,
    startPhoneSignIn,
    confirmPhoneCode,
    cancelPhoneSignIn,
    sendPasswordReset,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const containerId = useMemo(() => 'login-recaptcha-container', []);

  const resetFeedback = useCallback(() => {
    setError(null);
    setInfo(null);
  }, []);

  useEffect(() => {
    resetFeedback();
  }, [activeTab, resetFeedback]);

  useEffect(() => {
    return () => {
      cancelPhoneSignIn();
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, [cancelPhoneSignIn]);

  useEffect(() => {
    if (activeTab !== 'phone') return;
    if (isLocalMode) return;
    if (recaptchaRef.current) return;

    try {
      recaptchaRef.current = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
      void recaptchaRef.current.render();
    } catch (err) {
      console.warn('Falha ao preparar reCAPTCHA', err);
      setError('Falha ao preparar verificador de telefone. Atualize a pagina e tente novamente.');
    }

    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, [activeTab, containerId]);

  const handleEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();
    resetFeedback();
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError(parseAuthError(err));
    }
  };

  const handleGoogleSignIn = async () => {
    resetFeedback();
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(parseAuthError(err));
    }
  };

  const handlePhoneSubmit = async (event: FormEvent) => {
    event.preventDefault();
    resetFeedback();
    try {
      const verifier: ApplicationVerifier | null = isLocalMode
        ? ({ type: 'local', verify: async () => 'local' } as ApplicationVerifier)
        : recaptchaRef.current;
      if (!verifier) throw new Error('Falha ao preparar verificador de telefone.');
      const nextId = await startPhoneSignIn(phone, verifier);
      setVerificationId(nextId);
      setInfo(
        isLocalMode
          ? `Use o codigo ${LOCAL_PHONE_CODE} para concluir o login.`
          : 'Enviamos um codigo via SMS para o telefone informado.',
      );
    } catch (err) {
      setError(parseAuthError(err));
    }
  };

  const handleCodeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    resetFeedback();
    try {
      await confirmPhoneCode(code);
    } catch (err) {
      setError(parseAuthError(err));
    }
  };

  const handlePrefillAdmin = () => {
    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
    setInfo(`Login padrao: usuario ${ADMIN_USERNAME} / senha ${ADMIN_PASSWORD}`);
  };

  const handleForgotPassword = async () => {
    resetFeedback();
    if (!email) {
      setError('Informe um email para recuperar a senha.');
      return;
    }
    try {
      await sendPasswordReset(email);
      setInfo('Se o email estiver cadastrado, voce recebera instrucoes em instantes.');
    } catch (err) {
      setError(parseAuthError(err));
    }
  };

  const goToPhoneStart = () => {
    setVerificationId(null);
    setCode('');
    cancelPhoneSignIn();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
        <section className="hidden md:flex flex-col gap-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/40">myBills</p>
            <h1 className="text-4xl font-semibold mt-3">Bem-vindo de volta</h1>
            <p className="text-white/70 leading-relaxed mt-4 max-w-lg">
              Centralize seus books financeiros, acompanhe metas e organize pagamentos recorrentes em um unico lugar.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold mb-2">Acesso rapido</h2>
            <p className="text-sm text-white/60">Use as credenciais padrao para explorar o sistema:</p>
            <ul className="mt-3 space-y-1 text-sm text-white">
              <li><span className="text-white/60">Login:</span> {ADMIN_USERNAME}</li>
              <li><span className="text-white/60">Senha:</span> {ADMIN_PASSWORD}</li>
              <li><span className="text-white/60">SMS local:</span> codigo {LOCAL_PHONE_CODE}</li>
            </ul>
          </div>
        </section>

        <section className={cn(CSS_CLASSES.container.card, 'bg-white/95 text-slate-900 m-0 p-8 backdrop-blur-md shadow-2xl border-0')}>
          <div className="flex gap-2 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key !== 'phone') goToPhoneStart();
                }}
                className={cn(
                  'flex-1 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200',
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className={cn(CSS_CLASSES.text.label, 'block mb-1')} htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={cn(CSS_CLASSES.input.base, CSS_CLASSES.input.default)}
                />
              </div>

              <div>
                <label className={cn(CSS_CLASSES.text.label, 'block mb-1')} htmlFor="login-password">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={passwordVisible ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={cn(CSS_CLASSES.input.base, CSS_CLASSES.input.default, 'pr-16')}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((prev) => !prev)}
                    className="absolute inset-y-0 right-2 my-auto px-3 py-1 text-xs font-medium text-slate-600 rounded-xl hover:bg-slate-200"
                  >
                    {passwordVisible ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={handlePrefillAdmin} className="text-blue-600 hover:underline">
                  Usar Admin / 0000
                </button>
                <button type="button" onClick={handleForgotPassword} className="text-slate-600 hover:text-blue-600">
                  Esqueci minha senha
                </button>
              </div>

              {error && <p className={cn(CSS_CLASSES.text.error, 'mt-2')}>{error}</p>}
              {info && !error && <p className="text-sm text-green-600">{info}</p>}

              <button type="submit" className={cn(CSS_CLASSES.button.primary, 'w-full mt-4')} disabled={isProcessing}>
                {isProcessing ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {activeTab === 'google' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Conecte-se com sua conta Google para liberar o acesso imediato e sincronizar seus dados com o Firebase.
              </p>
              {error && <p className={cn(CSS_CLASSES.text.error)}>{error}</p>}
              {info && !error && <p className="text-sm text-green-600">{info}</p>}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className={cn(CSS_CLASSES.button.primary, 'w-full flex items-center justify-center gap-2')}
                disabled={isProcessing}
              >
                {isProcessing ? 'Conectando...' : 'Continuar com Google'}
              </button>
            </div>
          )}

          {activeTab === 'phone' && (
            <div className="space-y-4">
              {!verificationId ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <label className={cn(CSS_CLASSES.text.label, 'block mb-1')} htmlFor="login-phone">
                      Numero de telefone
                    </label>
                    <input
                      id="login-phone"
                      type="tel"
                      required
                      placeholder="+55 11 99999-0000"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className={cn(CSS_CLASSES.input.base, CSS_CLASSES.input.default)}
                    />
                  </div>

                  {error && <p className={cn(CSS_CLASSES.text.error)}>{error}</p>}
                  {info && !error && <p className="text-sm text-green-600">{info}</p>}

                  <button type="submit" className={cn(CSS_CLASSES.button.primary, 'w-full')} disabled={isProcessing}>
                    {isProcessing ? 'Enviando codigo...' : 'Enviar codigo'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div>
                    <label className={cn(CSS_CLASSES.text.label, 'block mb-1')} htmlFor="login-code">
                      Codigo recebido
                    </label>
                    <input
                      id="login-code"
                      type="text"
                      required
                      inputMode="numeric"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      className={cn(CSS_CLASSES.input.base, CSS_CLASSES.input.default)}
                    />
                  </div>

                  {error && <p className={cn(CSS_CLASSES.text.error)}>{error}</p>}
                  {info && !error && <p className="text-sm text-green-600">{info}</p>}

                  <div className="flex gap-3">
                    <button type="submit" className={cn(CSS_CLASSES.button.primary, 'flex-1')} disabled={isProcessing}>
                      {isProcessing ? 'Validando...' : 'Confirmar codigo'}
                    </button>
                    <button type="button" onClick={goToPhoneStart} className={cn(CSS_CLASSES.button.secondary, 'flex-1')}>
                      Reenviar
                    </button>
                  </div>
                </form>
              )}
              <div id={containerId} className="hidden" />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

