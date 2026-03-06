'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm disabled:opacity-50"
      >
        Précédent
      </button>
      <div className="flex gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`rounded-lg px-3 py-1 text-sm ${
              page === currentPage ? 'bg-[#b08d2a] text-black' : 'border border-white/10 bg-white/5'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm disabled:opacity-50"
      >
        Suivant
      </button>
    </div>
  );
}
