import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
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
} from 'lucide-react';

const Layout = ({
  children,
  activeSection,
  setActiveSection,
  onNavigateToContent,
}) => {
  const { user, logout } = useContext(AuthContext);
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

    if (result.matchField === 'essay') {
      setActiveSection('essay');
    } else {
      setActiveSection('organiser');
    }

    onNavigateToContent(result.hierarchy);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <div
        className={`relative flex flex-col h-full border-r border-zinc-900 bg-zinc-900/40 backdrop-blur-md transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } hidden md:flex flex-shrink-0`}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-900">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-zinc-400" />
              <span className="text-sm font-semibold tracking-wide text-zinc-200">
                Workspace
              </span>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="mx-auto">
              <BookOpen className="h-5 w-5 text-zinc-400" />
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="rounded p-1 hover:bg-zinc-800/60 hidden md:block text-zinc-400 hover:text-zinc-200"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="relative">
            <div className="flex items-center rounded border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 transition-colors focus-within:border-zinc-700">
              <Search className="h-4 w-4 text-zinc-500 flex-shrink-0" />
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
                  className="ml-2 bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none w-full"
                />
              )}
            </div>

            {showSearchPopup && searchQuery.trim() && (
              <div className="absolute left-0 right-0 mt-2 z-50 rounded-lg border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-md max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2 px-2">
                  <span className="text-xs font-semibold text-zinc-400">
                    Search Results ({searchResults.length})
                  </span>
                  <button
                    onClick={() => setShowSearchPopup(false)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {isSearching ? (
                  <div className="py-4 text-center text-sm text-zinc-500">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-4 text-center text-sm text-zinc-500">
                    No results found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((res, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchResultClick(res)}
                        className="w-full text-left rounded p-2 hover:bg-zinc-800 transition text-xs space-y-1 block"
                      >
                        <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
                          {res.type === 'subject' ? (
                            <FolderClosed className="h-3 w-3 text-zinc-400" />
                          ) : (
                            <CornerDownRight className="h-3 w-3 text-zinc-400" />
                          )}
                          <span>{res.title}</span>
                          <span className="ml-auto rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                            {res.matchField}
                          </span>
                        </div>
                        <div className="text-zinc-400 pl-4 truncate font-mono text-[11px]">
                          {res.snippet}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveSection('organiser')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition ${
                activeSection === 'organiser'
                  ? 'bg-zinc-800/80 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              {!isSidebarCollapsed && <span>CA Organiser</span>}
            </button>
            <button
              onClick={() => setActiveSection('essay')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition ${
                activeSection === 'essay'
                  ? 'bg-zinc-800/80 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
              }`}
            >
              <Award className="h-4 w-4" />
              {!isSidebarCollapsed && <span>Essay Pointers</span>}
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-zinc-900 bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
              <User className="h-4 w-4" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold text-zinc-200">
                  {user?.name}
                </p>
                <p className="truncate text-[10px] text-zinc-500">@{user?.userId}</p>
              </div>
            )}
            <button
              onClick={logout}
              title="Logout"
              className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileOpen(false)}
      >
        <div
          className={`fixed inset-y-0 left-0 flex w-72 flex-col border-r border-zinc-900 bg-zinc-950 p-4 transition-transform duration-300 ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-zinc-400" />
              <span className="text-sm font-semibold tracking-wide text-zinc-200">
                Workspace
              </span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="rounded p-1 hover:bg-zinc-800 text-zinc-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            <div className="relative">
              <div className="flex items-center rounded border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 transition-colors focus-within:border-zinc-700">
                <Search className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search workspace..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchPopup(true);
                  }}
                  onFocus={() => setShowSearchPopup(true)}
                  className="ml-2 bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none w-full"
                />
              </div>

              {showSearchPopup && searchQuery.trim() && (
                <div className="absolute left-0 right-0 mt-2 z-50 rounded-lg border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-md max-h-80 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2 px-2">
                    <span className="text-xs font-semibold text-zinc-400">
                      Search Results ({searchResults.length})
                    </span>
                    <button
                      onClick={() => setShowSearchPopup(false)}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  {isSearching ? (
                    <div className="py-4 text-center text-sm text-zinc-500">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-4 text-center text-sm text-zinc-500">
                      No results found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((res, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchResultClick(res)}
                          className="w-full text-left rounded p-2 hover:bg-zinc-800 transition text-xs space-y-1 block"
                        >
                          <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
                            {res.type === 'subject' ? (
                              <FolderClosed className="h-3 w-3 text-zinc-400" />
                            ) : (
                              <CornerDownRight className="h-3 w-3 text-zinc-400" />
                            )}
                            <span>{res.title}</span>
                            <span className="ml-auto rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                              {res.matchField}
                            </span>
                          </div>
                          <div className="text-zinc-400 pl-4 truncate font-mono text-[11px]">
                            {res.snippet}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveSection('organiser');
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition ${
                  activeSection === 'organiser'
                    ? 'bg-zinc-800/80 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>CA Organiser</span>
              </button>
              <button
                onClick={() => {
                  setActiveSection('essay');
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition ${
                  activeSection === 'essay'
                    ? 'bg-zinc-800/80 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
                }`}
              >
                <Award className="h-4 w-4" />
                <span>Essay Pointers</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">{user?.name}</p>
                  <p className="text-[10px] text-zinc-500">@{user?.userId}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="rounded p-1.5 text-zinc-500 hover:bg-zinc-850 hover:text-zinc-300"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b border-zinc-900 bg-zinc-950 px-4 md:px-6 flex-shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden rounded p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center justify-between min-w-0">
            <h2 className="text-sm font-semibold tracking-wide text-zinc-200 truncate capitalize">
              {activeSection === 'organiser' ? 'Current Affairs Organiser' : 'Essay Pointers'}
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-8">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
