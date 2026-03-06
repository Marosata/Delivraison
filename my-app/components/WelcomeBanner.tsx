type WelcomeBannerProps = {
  prenom: string | null;
  role: 'admin' | 'livreur';
  email: string | null;
};

export default function WelcomeBanner({ prenom, role, email }: WelcomeBannerProps) {
  const roleLabel = role === 'admin' ? 'Admin' : 'Livreur';
  const displayPrenom = (prenom || '').trim() || 'Utilisateur';
  const displayEmail = (email || '').trim();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-xs text-zinc-400">Dashboard</div>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
        Bienvenue, {displayPrenom} {roleLabel}
        {displayEmail ? ` — ${displayEmail}` : ''}
      </h1>
      <div className="mt-2 text-sm leading-6 text-zinc-300">Accès sécurisé basé sur votre rôle.</div>
    </div>
  );
}
