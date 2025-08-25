export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white p-6 mt-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <p>&copy; 2025 DeinPortfolioApp. Alle Rechte vorbehalten.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-gray-400">Impressum</a>
          <a href="#" className="hover:text-gray-400">Datenschutz</a>
          <a href="#" className="hover:text-gray-400">Kontakt</a>
        </div>
      </div>
    </footer>
  );
}
