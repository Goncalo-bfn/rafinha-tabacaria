import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ProductShowcase } from "./components/ProductShowcase";

export default function App() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <Header />
      <main>
        <Hero />
        <ProductShowcase />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
