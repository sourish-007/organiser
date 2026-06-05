import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../services/api';
import {
  BookOpen,
  Award,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  CornerDownRight,
  FolderClosed,
  Sun,
  Moon,
} from 'lucide-react';

const Layout = ({
  children,
  activeSection,
  setActiveSection,
  onNavigateToContent,
}) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get(`/topics/search?q=${searchQuery}`);
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchResultClick = (result) => {
    setSearchQuery('');
    setShowSearchPopup(false);
    setIsMobileOpen(false);

    if (result.matchField === 'essay' || result.type === 'essay') {
      setActiveSection('essay');
    } else {
      setActiveSection('organiser');
    }

    onNavigateToContent(result.hierarchy);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans">
      <div
        className={`relative flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        } hidden md:flex flex-shrink-0`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
              <span className="text-base font-bold tracking-wide text-zinc-800 dark:text-zinc-200">
                Workspace
              </span>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="mx-auto">
              <BookOpen className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
            </div>
          )}
          <div className="flex items-center gap-1">
            {!isSidebarCollapsed && (
              <button
                onClick={toggleTheme}
                className="rounded p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="rounded p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="relative">
            <div className="flex items-center rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 transition-colors focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
              <Search className="h-5 w-5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <input
                  type="text"
                  placeholder="Search workspace..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchPopup(true);
                  }}
                  onFocus={() => setShowSearchPopup(true)}
                  className="ml-2 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none w-full"
                />
              )}
            </div>

            {showSearchPopup && searchQuery.trim() && (
              <div className="absolute left-0 right-0 mt-2 z-50 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 shadow-2xl max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2 mb-2 px-2">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Search Results ({searchResults.length})
                  </span>
                  <button
                    onClick={() => setShowSearchPopup(false)}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {isSearching ? (
                  <div className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No results found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((res, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchResultClick(res)}
                        className="w-full text-left rounded p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-xs space-y-1 block"
                      >
                        <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-semibold">
                          {res.type === 'subject' ? (
                            <FolderClosed className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                          ) : (
                            <CornerDownRight className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                          )}
                          <span className="text-xs">{res.title}</span>
                          <span className="ml-auto rounded-full bg-zinc-100 dark:bg-zinc-750 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-650 dark:text-zinc-350 uppercase tracking-wider">
                            {res.matchField}
                          </span>
                        </div>
                        <div className="text-zinc-500 dark:text-zinc-450 pl-4 truncate font-mono text-[11px]">
                          {res.snippet}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveSection('organiser')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-sm transition ${
                activeSection === 'organiser'
                  ? 'bg-zinc-200/50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              {!isSidebarCollapsed && <span>CA Organiser</span>}
            </button>
            <button
              onClick={() => setActiveSection('essay')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-sm transition ${
                activeSection === 'essay'
                  ? 'bg-zinc-200/50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'text-zinc-655 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Award className="h-5 w-5" />
              {!isSidebarCollapsed && <span>Essay Pointers</span>}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
          <div className="flex flex-col gap-3">
            {isSidebarCollapsed && (
              <button
                onClick={toggleTheme}
                className="mx-auto rounded p-1.5 hover:bg-zinc-250 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
                title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold">
                <User className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {user?.name}
                  </p>
                  <p className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">@{user?.userId}</p>
                </div>
              )}
              <button
                onClick={logout}
                title="Logout"
                className="rounded p-1.5 text-zinc-500 dark:text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity md:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileOpen(false)}
      >
        <div
          className={`fixed inset-y-0 left-0 flex w-72 flex-col border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4 transition-transform duration-300 ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
              <span className="text-base font-bold tracking-wide text-zinc-800 dark:text-zinc-200">
                Workspace
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            <div className="relative">
              <div className="flex items-center rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 transition-colors focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
                <Search className="h-5 w-5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search workspace..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchPopup(true);
                  }}
                  onFocus={() => setShowSearchPopup(true)}
                  className="ml-2 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none w-full"
                />
              </div>

              {showSearchPopup && searchQuery.trim() && (
                <div className="absolute left-0 right-0 mt-2 z-50 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 shadow-2xl max-h-80 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2 mb-2 px-2">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Search Results ({searchResults.length})
                    </span>
                    <button
                      onClick={() => setShowSearchPopup(false)}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {isSearching ? (
                    <div className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      No results found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((res, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchResultClick(res)}
                          className="w-full text-left rounded p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-xs space-y-1 block"
                        >
                          <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-semibold">
                            {res.type === 'subject' ? (
                              <FolderClosed className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                            ) : (
                              <CornerDownRight className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                            )}
                            <span className="text-xs">{res.title}</span>
                            <span className="ml-auto rounded-full bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                              {res.matchField}
                            </span>
                          </div>
                          <div className="text-zinc-500 dark:text-zinc-450 pl-4 truncate font-mono text-[11px]">
                            {res.snippet}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full md:hidden flex items-center gap-3 px-3.5 py-2.5 rounded text-sm transition text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
              </button>
              <button
                onClick={() => {
                  setActiveSection('organiser');
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-sm transition ${
                  activeSection === 'organiser'
                    ? 'bg-zinc-200/50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span>CA Organiser</span>
              </button>
              <button
                onClick={() => {
                  setActiveSection('essay');
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-sm transition ${
                  activeSection === 'essay'
                    ? 'bg-zinc-200/50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Award className="h-5 w-5" />
                <span>Essay Pointers</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold">
                  <User className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{user?.name}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">@{user?.userId}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="rounded p-1.5 text-zinc-500 dark:text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-zinc-900">
        <header className="flex h-16 items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 md:px-6 flex-shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden rounded p-1.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center justify-between min-w-0">
            <h2 className="text-base font-bold tracking-wide text-zinc-800 dark:text-zinc-100 truncate capitalize">
              {activeSection === 'organiser' ? 'Current Affairs Organiser' : 'Essay Pointers'}
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 p-4 md:p-8">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
