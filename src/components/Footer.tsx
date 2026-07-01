export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-slate-400">
          © {new Date().getFullYear()} MovieApp. Made with ❤️ for movie lovers.
        </p>
        <div className="mt-4 flex justify-center gap-6 text-sm text-slate-500">
          <a href="#" className="hover:text-blue-400 transition-colors">Về chúng tôi</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Điều khoản</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Liên hệ</a>
        </div>
      </div>
    </footer>
  );
}
