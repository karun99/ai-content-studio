import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Editor' },
  { to: '/knowledge', label: 'Knowledge Base' },
  { to: '/collector', label: 'Collector' },
  { to: '/parser', label: 'Parser' },
  { to: '/lab', label: 'Model Lab' },
  { to: '/builder', label: 'Builder' },
  { to: '/export', label: 'Export' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-lg text-slate-800">Content Studio</span>
          </Link>
          <div className="flex gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
