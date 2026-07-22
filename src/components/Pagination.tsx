import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  disabled,
  onPageChange,
}: PaginationProps) {
  return (
    <nav className="pagination" aria-label="Paginación">
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={19} />
        Anterior
      </button>

      <span>
        Página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </span>

      <button
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
        <ChevronRight size={19} />
      </button>
    </nav>
  );
}
