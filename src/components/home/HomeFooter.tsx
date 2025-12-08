const HomeFooter = () => {
  return (
    <footer className="bg-header text-header-foreground py-8 pb-24 mt-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-cta flex items-center justify-center">
            <span className="font-bold text-cta-foreground">10</span>
          </div>
          <span className="text-xl font-semibold">RW 10</span>
        </div>
        <p className="text-header-foreground/70 text-sm">
          Kelurahan yang Ramah & Harmonis
        </p>
        <p className="text-header-foreground/50 text-xs mt-4">
          © {new Date().getFullYear()} RW 10. Hak Cipta Dilindungi.
        </p>
      </div>
    </footer>
  );
};

export default HomeFooter;
