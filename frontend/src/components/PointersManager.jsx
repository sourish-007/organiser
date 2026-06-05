import { useState } from 'react';
import { Plus, Trash, Edit2, Check, ArrowUp, ArrowDown, X } from 'lucide-react';

const PointersManager = ({ title, pointers, onSave }) => {
  const [newPointer, setNewPointer] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingText, setEditingText] = useState('');

  const handleAdd = () => {
    if (!newPointer.trim()) return;
    const updated = [...pointers, newPointer.trim()];
    onSave(updated);
    setNewPointer('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const handleStartEdit = (index, text) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const handleSaveEdit = (index) => {
    if (!editingText.trim()) return;
    const updated = [...pointers];
    updated[index] = editingText.trim();
    onSave(updated);
    setEditingIndex(-1);
    setEditingText('');
  };

  const handleDelete = (index) => {
    const updated = pointers.filter((_, i) => i !== index);
    onSave(updated);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...pointers];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onSave(updated);
  };

  const handleMoveDown = (index) => {
    if (index === pointers.length - 1) return;
    const updated = [...pointers];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onSave(updated);
  };

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-5 shadow-sm">
      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {title}
      </h4>

      <div className="space-y-1.5">
        {pointers.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 italic py-2">No pointers added yet.</p>
        ) : (
          pointers.map((pointer, index) => (
            <div
              key={index}
              className="group flex items-start gap-2.5 rounded px-2.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
            >
              <span className="text-zinc-400 dark:text-zinc-500 select-none mt-0.5">•</span>
              <div className="flex-1 text-sm text-zinc-800 dark:text-zinc-200 break-words leading-relaxed">
                {editingIndex === index ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, () => handleSaveEdit(index))}
                      className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-2.5 py-1 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 p-0.5"
                    >
                      <Check className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => setEditingIndex(-1)}
                      className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 p-0.5"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ) : (
                  <span>{pointer}</span>
                )}
              </div>

              {editingIndex !== index && (
                <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-150">
                  <button
                    onClick={() => handleStartEdit(index, pointer)}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === pointers.length - 1}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
        <input
          type="text"
          placeholder="Add a pointer..."
          value={newPointer}
          onChange={(e) => setNewPointer(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, handleAdd)}
          className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600"
        />
        <button
          onClick={handleAdd}
          className="flex items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300 transition"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PointersManager;
