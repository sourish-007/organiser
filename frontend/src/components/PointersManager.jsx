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
    <div className="space-y-3 rounded-lg border border-zinc-900 bg-zinc-950 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </h4>

      <div className="space-y-1">
        {pointers.length === 0 ? (
          <p className="text-xs text-zinc-600 italic py-2">No pointers added yet.</p>
        ) : (
          pointers.map((pointer, index) => (
            <div
              key={index}
              className="group flex items-start gap-2 rounded px-2 py-1.5 hover:bg-zinc-900/60 transition"
            >
              <span className="text-zinc-500 select-none mt-0.5">•</span>
              <div className="flex-1 text-sm text-zinc-300 break-words">
                {editingIndex === index ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, () => handleSaveEdit(index))}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 text-sm text-zinc-200 outline-none focus:border-zinc-600"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="text-emerald-400 hover:text-emerald-300 p-0.5"
                    >
                      <Check className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => setEditingIndex(-1)}
                      className="text-zinc-500 hover:text-zinc-400 p-0.5"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ) : (
                  <span>{pointer}</span>
                )}
              </div>

              {editingIndex !== index && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition duration-150">
                  <button
                    onClick={() => handleStartEdit(index, pointer)}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === pointers.length - 1}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400"
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

      <div className="flex gap-2 pt-2 border-t border-zinc-900/60">
        <input
          type="text"
          placeholder="Add a pointer..."
          value={newPointer}
          onChange={(e) => setNewPointer(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, handleAdd)}
          className="flex-1 bg-zinc-900/40 border border-zinc-900 rounded px-3 py-1.5 text-xs text-zinc-200 outline-none placeholder-zinc-600 focus:border-zinc-800 focus:bg-zinc-900"
        />
        <button
          onClick={handleAdd}
          className="flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 px-3 py-1 text-zinc-300 transition"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PointersManager;
