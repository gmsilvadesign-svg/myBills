import { CSS_CLASSES, cn } from '@/styles/constants';

interface SplashScreenProps {
  fadingOut?: boolean;
}

export default function SplashScreen({ fadingOut = false }: SplashScreenProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-slate-950 text-white transition-opacity duration-700 ease-in-out',
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100',
      )}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="h-20 w-20 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <span className="text-2xl font-semibold tracking-wide">myBills</span>
        </div>
        <p className={cn(CSS_CLASSES.text.subtitle, 'text-white/70')}>Organize suas financas em minutos</p>
        <div className="h-1 w-24 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-white/0 via-white to-white/0 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
