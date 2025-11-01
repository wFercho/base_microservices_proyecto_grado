import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageInput?: boolean;
  variant?: 'top' | 'bottom';
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageInput = true,
  variant = 'bottom'
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // Ajustar el inicio si estamos cerca del final
      if (end === totalPages) {
        start = Math.max(1, totalPages - maxVisiblePages + 1);
      }
      
      if (start > 1) pages.push(1);
      if (start > 2) pages.push('...');
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (end < totalPages - 1) pages.push('...');
      if (end < totalPages) pages.push(totalPages);
    }
    
    return pages;
  };

  // Contenedor principal con el mismo estilo
  const Container = ({ children }: { children: React.ReactNode }) => {
    if (variant === 'top') {
      return (
        <div className="flex justify-between items-center mb-4">
          {children}
        </div>
      );
    }
    
    return (
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          {children}
        </div>
      </div>
    );
  };

  return (
    <Container>
      {/* Información de página (izquierda) */}
      <div className="text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </div>
      
      {/* Botones de navegación (centro) */}
      <div className="flex items-center space-x-2">
        {/* Botón Primera Página */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm cursor-pointer ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          «
        </button>

        {/* Botón Página Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm cursor-pointer ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          ‹
        </button>

        {/* Números de página */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-1 rounded-md cursor-pointer text-sm ${
              page === '...'
                ? 'bg-transparent text-gray-500 cursor-default border-none'
                : currentPage === page
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Botón Página Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md text-sm cursor-pointer ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          ›
        </button>

        {/* Botón Última Página */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md text-sm cursor-pointer${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          »
        </button>
      </div>

      {/* Input para ir a página específica (derecha) */}
      {showPageInput && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Ir a página:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = Math.max(1, Math.min(totalPages, Number(e.target.value)));
              onPageChange(page);
            }}
            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm text-center"
          />
        </div>
      )}
    </Container>
  );
};

export default PaginationControls;