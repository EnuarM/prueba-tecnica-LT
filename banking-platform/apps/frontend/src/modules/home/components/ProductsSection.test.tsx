import { render, screen } from '@testing-library/react';
import ProductsSection from './ProductsSection';

describe('ProductsSection', () => {
  it('renders all 5 products', () => {
    render(<ProductsSection />);
    expect(screen.getByText('Crédito Personal')).toBeInTheDocument();
    expect(screen.getByText('Cuenta de Ahorros')).toBeInTheDocument();
    expect(screen.getByText('Crédito Hipotecario')).toBeInTheDocument();
    expect(screen.getByText('Tarjeta de Crédito')).toBeInTheDocument();
    expect(screen.getByText('Fondo de Inversión')).toBeInTheDocument();
  });

  it('renders the section heading', () => {
    render(<ProductsSection />);
    expect(screen.getByText('Soluciones de Portafolio Principal')).toBeInTheDocument();
  });
});
