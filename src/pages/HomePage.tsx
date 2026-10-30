import { About } from "../components/About";
import { CartDrawer } from "../components/CartDrawer";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { ProductShowcase } from "../components/ProductShowcase";
import { CartProvider } from "../context/CartContext";
import { useProducts } from "../hooks/useProducts";

export function HomePage() {
  const { error, products, reload, status } = useProducts();

  return (
    <CartProvider
      products={products}
      productsStatus={status}
      reloadProducts={reload}
    >
      <div className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Header />
        <main>
          <Hero />
          <ProductShowcase
            error={error}
            products={products}
            reload={reload}
            status={status}
          />
          <About />
          <Contact />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
