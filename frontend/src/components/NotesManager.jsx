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
    <div className="space-y-3 rounded-lg border border-zinc-900 bg-zinc-950 p-4">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Notes
        </h4>
        <div className="flex items-center gap-3 text-xs">
          {getStatusText()}
          {updatedAt && (
            <span className="text-zinc-500">
              Last updated: {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={handleManualSave}
            disabled={status === 'saved' || status === 'saving'}
            className="flex items-center gap-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-2 py-1 text-zinc-300 disabled:opacity-40 transition"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full min-h-[300px] bg-transparent text-sm text-zinc-300 outline-none resize-y placeholder-zinc-700 font-mono leading-relaxed"
        placeholder="Write detailed notes here..."
      />
    </div>
  );
};

export default NotesManager;
