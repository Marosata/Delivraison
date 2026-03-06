import type { ReactNode } from 'react';

type LandingShellProps = {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

export default function LandingShell({ header, children, footer }: LandingShellProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#b08d2a]/20 blur-3xl" />
        <div className="absolute -bottom-56 right-[-120px] h-[640px] w-[640px] rounded-full bg-[#9b7a20]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(176,141,42,0.16),transparent_60%)]" />
      </div>

      {header}
      <main className="relative mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">{children}</main>
      {footer}
    </div>
  );
}
