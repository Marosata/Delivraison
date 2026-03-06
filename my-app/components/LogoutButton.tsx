import { logoutAction } from '@/app/auth/actions';

type LogoutButtonProps = {
  className?: string;
};

export default function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={
          className ??
          'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-100 backdrop-blur transition hover:bg-white/10'
        }
      >
        Déconnexion
      </button>
    </form>
  );
}
