import { useState, useEffect, useRef } from 'react';
import { Save, RefreshCw, CheckCircle2 } from 'lucide-react';

const NotesManager = ({ initialNotes, onSave, updatedAt }) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [status, setStatus] = useState('saved');
  const isFirstMount = useRef(true);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    setNotes(initialNotes || '');
    setStatus('saved');
  }, [initialNotes]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (notes === initialNotes) {
      setStatus('saved');
      return;
    }

    setStatus('typing');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setStatus('saving');
      try {
        await onSave(notes);
        setStatus('saved');
      } catch (err) {
        setStatus('error');
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, onSave, initialNotes]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (status === 'typing' || status === 'saving') {
        e.preventDefault();
        e.returnValue = 'Unsaved changes detected.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [status]);

  const handleManualSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setStatus('saving');
    try {
      await onSave(notes);
      setStatus('saved');
    } catch (err) {
      setStatus('error');
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'typing':
        return (
          <span className="flex items-center gap-1.5 text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            Drafting...
          </span>
        );
      case 'saving':
        return (
          <span className="flex items-center gap-1.5 text-zinc-400">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Saving changes...
          </span>
        );
      case 'saved':
        return (
          <span className="flex items-center gap-1.5 text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            All changes saved
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 text-red-400">
            Save failed. Click save manually.
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Notes
        </h4>
        <div className="flex items-center gap-3 text-sm">
          {getStatusText()}
          {updatedAt && (
            <span className="text-zinc-500 dark:text-zinc-400">
              Last updated: {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={handleManualSave}
            disabled={status === 'saved' || status === 'saving'}
            className="flex items-center gap-1.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 disabled:opacity-40 transition px-3 py-1.5 text-xs"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full min-h-[350px] bg-transparent text-base text-zinc-800 dark:text-zinc-100 outline-none resize-y placeholder-zinc-400 dark:placeholder-zinc-500 font-mono leading-relaxed"
        placeholder="Write detailed notes here..."
      />
    </div>
  );
};

export default NotesManager;
