import { TopNavBar, Footer } from '@/components';
import { HeroSection, ProductsSection } from '@/modules/home';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <TopNavBar />
      <HeroSection />
      <ProductsSection />
      <Footer />
    </main>
  );
}

