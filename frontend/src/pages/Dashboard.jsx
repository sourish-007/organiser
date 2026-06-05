import { useState, useEffect, useContext, useCallback } from 'react';
import { ToastContext } from '../context/ToastContext';
import PointersManager from '../components/PointersManager';
import NotesManager from '../components/NotesManager';
import api from '../services/api';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  FolderClosed,
  FolderPlus,
  Check,
  X,
  Tag,
  BookOpen,
  Award,
} from 'lucide-react';

const monthOrder = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

const Dashboard = ({ activeSection, navigationTrigger, clearNavigationTrigger }) => {
  const { showToast } = useContext(ToastContext);

  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [months, setMonths] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topicsMap, setTopicsMap] = useState({});

  const [expandedMonths, setExpandedMonths] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState([]);
  const [expandedTopics, setExpandedTopics] = useState([]);

  const [essayPointers, setEssayPointers] = useState([]);
  const [expandedEssayPointers, setExpandedEssayPointers] = useState([]);
  const [isAddingEssay, setIsAddingEssay] = useState(false);
  const [newEssayTag, setNewEssayTag] = useState('');
  const [newEssayDesc, setNewEssayDesc] = useState('');
  const [editingEssayId, setEditingEssayId] = useState(null);
  const [editingEssayTag, setEditingEssayTag] = useState('');
  const [editingEssayDesc, setEditingEssayDesc] = useState('');

  const [loading, setLoading] = useState(false);
  const [editingYearId, setEditingYearId] = useState(null);
  const [editingYearVal, setEditingYearVal] = useState('');
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYearVal, setNewYearVal] = useState('');

  const [addingSubjectMonthId, setAddingSubjectMonthId] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');

  const [addingTopicSubjectId, setAddingTopicSubjectId] = useState(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState('');

  const fetchYears = useCallback(async () => {
    try {
      const { data } = await api.get('/years');
      setYears(data);
      if (data.length > 0 && !selectedYear) {
        setSelectedYear(data[0]);
      }
    } catch (err) {
      showToast('Failed to fetch years', 'error');
    }
  }, [selectedYear, showToast]);

  const fetchEssayPointers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/essay-pointers');
      setEssayPointers(data);
    } catch (err) {
      showToast('Failed to fetch essay pointers', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  useEffect(() => {
    if (activeSection === 'essay') {
      fetchEssayPointers();
    }
  }, [activeSection, fetchEssayPointers]);

  const fetchMonthsAndSubjects = useCallback(async (yearId) => {
    setLoading(true);
    try {
      const [monthsRes, subjectsRes] = await Promise.all([
        api.get(`/months?yearId=${yearId}`),
        api.get(`/subjects`),
      ]);
      const sortedMonths = monthsRes.data.sort((a, b) => {
        const orderA = monthOrder[a.month] || 99;
        const orderB = monthOrder[b.month] || 99;
        return orderA - orderB;
      });
      setMonths(sortedMonths);
      setSubjects(subjectsRes.data);
    } catch (err) {
      showToast('Failed to load month and subject structure', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedYear && activeSection === 'organiser') {
      fetchMonthsAndSubjects(selectedYear._id);
    }
  }, [selectedYear, activeSection, fetchMonthsAndSubjects]);

  const fetchTopicsForSubject = useCallback(async (subjectId) => {
    try {
      const { data } = await api.get(`/topics?subjectId=${subjectId}`);
      setTopicsMap((prev) => ({
        ...prev,
        [subjectId]: data,
      }));
    } catch (err) {
      showToast('Failed to fetch topics', 'error');
    }
  }, [showToast]);

  const handleSearchResultNavigation = useCallback(async (trigger) => {
    const { yearId, monthId, subjectId, topicId, essayPointerId } = trigger;

    if (activeSection === 'essay' && essayPointerId) {
      await fetchEssayPointers();
      setExpandedEssayPointers((prev) =>
        prev.includes(essayPointerId) ? prev : [...prev, essayPointerId]
      );
      setTimeout(() => {
        const element = document.getElementById(`essay-node-${essayPointerId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-zinc-900');
          setTimeout(() => {
            element.classList.remove('bg-zinc-900');
          }, 2000);
        }
      }, 500);
      clearNavigationTrigger();
      return;
    }

    if (activeSection === 'organiser' && yearId) {
      const matchedYear = years.find((y) => y._id === yearId);
      if (!matchedYear) return;

      setSelectedYear(matchedYear);
      await fetchMonthsAndSubjects(yearId);

      setExpandedMonths((prev) => (prev.includes(monthId) ? prev : [...prev, monthId]));
      setExpandedSubjects((prev) => (prev.includes(subjectId) ? prev : [...prev, subjectId]));

      await fetchTopicsForSubject(subjectId);

      setExpandedTopics((prev) => (prev.includes(topicId) ? prev : [...prev, topicId]));

      setTimeout(() => {
        const element = document.getElementById(`topic-node-${topicId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-zinc-800/40');
          setTimeout(() => {
            element.classList.remove('bg-zinc-800/40');
          }, 2000);
        }
      }, 500);
      clearNavigationTrigger();
    }
  }, [
    years,
    activeSection,
    fetchMonthsAndSubjects,
    fetchTopicsForSubject,
    fetchEssayPointers,
    clearNavigationTrigger,
  ]);

  useEffect(() => {
    if (navigationTrigger && (years.length > 0 || activeSection === 'essay')) {
      handleSearchResultNavigation(navigationTrigger);
    }
  }, [navigationTrigger, years, activeSection, handleSearchResultNavigation]);

  const handleAddYear = async () => {
    const yr = parseInt(newYearVal);
    if (isNaN(yr)) {
      showToast('Please enter a valid numeric year', 'error');
      return;
    }
    try {
      const { data } = await api.post('/years', { year: yr });
      setYears((prev) => [...prev, data].sort((a, b) => a.year - b.year));
      setSelectedYear(data);
      setIsAddingYear(false);
      setNewYearVal('');
      showToast('Year created and months initialized');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add year', 'error');
    }
  };

  const handleUpdateYear = async (id) => {
    const yr = parseInt(editingYearVal);
    if (isNaN(yr)) {
      showToast('Please enter a valid numeric year', 'error');
      return;
    }
    try {
      const { data } = await api.put(`/years/${id}`, { year: yr });
      setYears((prev) =>
        prev.map((y) => (y._id === id ? data : y)).sort((a, b) => a.year - b.year)
      );
      if (selectedYear?._id === id) {
        setSelectedYear(data);
      }
      setEditingYearId(null);
      showToast('Year updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update year', 'error');
    }
  };

  const handleDeleteYear = async (id) => {
    if (!confirm('Are you sure you want to delete this year and all associated data?')) {
      return;
    }
    try {
      await api.delete(`/years/${id}`);
      const filtered = years.filter((y) => y._id !== id);
      setYears(filtered);
      if (selectedYear?._id === id) {
        setSelectedYear(filtered.length > 0 ? filtered[0] : null);
      }
      showToast('Year and all associated data deleted');
    } catch (err) {
      showToast('Failed to delete year', 'error');
    }
  };

  const toggleMonth = (monthId) => {
    setExpandedMonths((prev) =>
      prev.includes(monthId) ? prev.filter((id) => id !== monthId) : [...prev, monthId]
    );
  };

  const toggleSubject = async (subjectId) => {
    const isExpanding = !expandedSubjects.includes(subjectId);
    setExpandedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );

    if (isExpanding && !topicsMap[subjectId]) {
      await fetchTopicsForSubject(subjectId);
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleAddSubject = async (monthId) => {
    if (!newSubjectName.trim()) return;
    try {
      const { data } = await api.post('/subjects', {
        monthId,
        name: newSubjectName.trim(),
      });
      setSubjects((prev) => [...prev, data]);
      setAddingSubjectMonthId(null);
      setNewSubjectName('');
      showToast('Subject created');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create subject', 'error');
    }
  };

  const handleUpdateSubject = async (id) => {
    if (!editingSubjectName.trim()) return;
    try {
      const { data } = await api.put(`/subjects/${id}`, {
        name: editingSubjectName.trim(),
      });
      setSubjects((prev) => prev.map((s) => (s._id === id ? data : s)));
      setEditingSubjectId(null);
      setEditingSubjectName('');
      showToast('Subject updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update subject', 'error');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm('Are you sure you want to delete this subject and all its topics?')) {
      return;
    }
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
      showToast('Subject and all associated topics deleted');
    } catch (err) {
      showToast('Failed to delete subject', 'error');
    }
  };

  const handleAddTopic = async (subjectId) => {
    if (!newTopicTitle.trim()) return;
    try {
      const { data } = await api.post('/topics', {
        subjectId,
        title: newTopicTitle.trim(),
      });
      setTopicsMap((prev) => ({
        ...prev,
        [subjectId]: [...(prev[subjectId] || []), data],
      }));
      setAddingTopicSubjectId(null);
      setNewTopicTitle('');
      showToast('Topic created');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create topic', 'error');
    }
  };

  const handleUpdateTopicTitle = async (id, subjectId) => {
    if (!editingTopicTitle.trim()) return;
    try {
      const { data } = await api.put(`/topics/${id}`, {
        title: editingTopicTitle.trim(),
      });
      setTopicsMap((prev) => ({
        ...prev,
        [subjectId]: prev[subjectId].map((t) => (t._id === id ? data : t)),
      }));
      setEditingTopicId(null);
      setEditingTopicTitle('');
      showToast('Topic updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update topic title', 'error');
    }
  };

  const handleDeleteTopic = async (id, subjectId) => {
    if (!confirm('Are you sure you want to delete this topic?')) {
      return;
    }
    try {
      await api.delete(`/topics/${id}`);
      setTopicsMap((prev) => ({
        ...prev,
        [subjectId]: prev[subjectId].filter((t) => t._id !== id),
      }));
      showToast('Topic deleted');
    } catch (err) {
      showToast('Failed to delete topic', 'error');
    }
  };

  const handleUpdatePointers = async (topicId, subjectId, type, newList) => {
    try {
      const updatePayload = {};
      if (type === 'prelims') updatePayload.prelimsPointers = newList;
      else if (type === 'mains') updatePayload.mainsPointers = newList;

      const { data } = await api.put(`/topics/${topicId}`, updatePayload);
      setTopicsMap((prev) => ({
        ...prev,
        [subjectId]: prev[subjectId].map((t) => (t._id === topicId ? data : t)),
      }));
    } catch (err) {
      showToast('Failed to update pointers', 'error');
      throw err;
    }
  };

  const handleSaveNotes = async (topicId, subjectId, newNotes) => {
    try {
      const { data } = await api.put(`/topics/${topicId}`, { notes: newNotes });
      setTopicsMap((prev) => ({
        ...prev,
        [subjectId]: prev[subjectId].map((t) => (t._id === topicId ? data : t)),
      }));
    } catch (err) {
      showToast('Failed to auto-save notes', 'error');
      throw err;
    }
  };

  const toggleEssayPointer = (id) => {
    setExpandedEssayPointers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddEssayPointer = async () => {
    if (!newEssayTag.trim()) {
      showToast('Topic tag is required', 'error');
      return;
    }
    try {
      const { data } = await api.post('/essay-pointers', {
        tag: newEssayTag.trim(),
        description: newEssayDesc.trim(),
      });
      setEssayPointers((prev) => [data, ...prev]);
      setIsAddingEssay(false);
      setNewEssayTag('');
      setNewEssayDesc('');
      showToast('Essay Topic created');
    } catch (err) {
      showToast('Failed to create essay topic', 'error');
    }
  };

  const handleUpdateEssayDetails = async (id) => {
    if (!editingEssayTag.trim()) {
      showToast('Topic tag is required', 'error');
      return;
    }
    try {
      const { data } = await api.put(`/essay-pointers/${id}`, {
        tag: editingEssayTag.trim(),
        description: editingEssayDesc.trim(),
      });
      setEssayPointers((prev) => prev.map((ep) => (ep._id === id ? data : ep)));
      setEditingEssayId(null);
      setEditingEssayTag('');
      setEditingEssayDesc('');
      showToast('Essay Topic updated');
    } catch (err) {
      showToast('Failed to update essay topic', 'error');
    }
  };

  const handleDeleteEssayPointer = async (id) => {
    if (!confirm('Are you sure you want to delete this essay topic and all its points?')) {
      return;
    }
    try {
      await api.delete(`/essay-pointers/${id}`);
      setEssayPointers((prev) => prev.filter((ep) => ep._id !== id));
      showToast('Essay Topic deleted');
    } catch (err) {
      showToast('Failed to delete essay topic', 'error');
    }
  };

  const handleUpdateEssayPoints = async (id, newList) => {
    try {
      const { data } = await api.put(`/essay-pointers/${id}`, { points: newList });
      setEssayPointers((prev) => prev.map((ep) => (ep._id === id ? data : ep)));
    } catch (err) {
      showToast('Failed to update essay points', 'error');
      throw err;
    }
  };

  if (activeSection === 'essay') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-zinc-400" />
            <h1 className="text-lg font-semibold text-zinc-200">Essay Pointers</h1>
          </div>
          {isAddingEssay ? (
            <button
              onClick={() => setIsAddingEssay(false)}
              className="rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 px-3 py-1.5 text-xs font-medium text-zinc-400"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setIsAddingEssay(true)}
              className="flex items-center gap-1.5 rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-zinc-200 transition"
            >
              <Plus className="h-4 w-4" />
              Add Essay Topic
            </button>
          )}
        </div>

        {isAddingEssay && (
          <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-5 space-y-4 max-w-xl">
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Topic Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Climate Change"
                value={newEssayTag}
                onChange={(e) => setNewEssayTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddEssayPointer();
                }}
                className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-700"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Description / Context
              </label>
              <textarea
                placeholder="Write a brief overview, core quotes, or thesis statement context..."
                value={newEssayDesc}
                onChange={(e) => setNewEssayDesc(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-700 h-20 resize-none"
              />
            </div>
            <button
              onClick={handleAddEssayPointer}
              className="rounded bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition"
            >
              Save Topic
            </button>
          </div>
        )}

        {loading && essayPointers.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded bg-zinc-900/40"></div>
            ))}
          </div>
        ) : essayPointers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-900 rounded-lg p-6">
            <Tag className="h-10 w-10 text-zinc-700 mb-3" />
            <h3 className="text-sm font-medium text-zinc-300">No essay topics configured</h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-xs">
              Add thematic essay topics like Globalisation, Democracy, or Technology, then add quotes and arguments.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {essayPointers.map((ep) => {
              const isExpanded = expandedEssayPointers.includes(ep._id);
              const isEditing = editingEssayId === ep._id;

              return (
                <div
                  key={ep._id}
                  id={`essay-node-${ep._id}`}
                  className="rounded-lg border border-zinc-900 bg-zinc-900/10 overflow-hidden transition"
                >
                  <div className="group flex items-start justify-between p-4 hover:bg-zinc-900/20 transition">
                    {isEditing ? (
                      <div className="space-y-3 w-full max-w-xl">
                        <input
                          type="text"
                          value={editingEssayTag}
                          onChange={(e) => setEditingEssayTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateEssayDetails(ep._id);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-sm text-zinc-100 outline-none"
                          placeholder="Topic Tag"
                          autoFocus
                        />
                        <textarea
                          value={editingEssayDesc}
                          onChange={(e) => setEditingEssayDesc(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none h-16 resize-none"
                          placeholder="Description"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateEssayDetails(ep._id)}
                            className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-3 py-1 text-xs text-zinc-200"
                          >
                            <Check className="h-3 w-3" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingEssayId(null)}
                            className="flex items-center gap-1 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 px-3 py-1 text-xs text-zinc-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleEssayPointer(ep._id)}
                          className="flex-1 text-left select-none space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-zinc-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-zinc-500" />
                            )}
                            <span className="text-sm font-semibold tracking-wide text-zinc-200">
                              {ep.tag}
                            </span>
                            <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-500 font-mono">
                              {ep.points.length} points
                            </span>
                          </div>
                          {ep.description && (
                            <p className="pl-6 text-xs text-zinc-500 line-clamp-1">
                              {ep.description}
                            </p>
                          )}
                        </button>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150">
                          <button
                            onClick={() => {
                              setEditingEssayId(ep._id);
                              setEditingEssayTag(ep.tag);
                              setEditingEssayDesc(ep.description || '');
                            }}
                            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                            title="Edit Topic"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEssayPointer(ep._id)}
                            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400"
                            title="Delete Topic"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {isExpanded && !isEditing && (
                    <div className="border-t border-zinc-900/60 bg-zinc-950/40 p-5 pl-10">
                      <div className="max-w-2xl">
                        <PointersManager
                          title="Points / Quotes / Facts"
                          pointers={ep.points}
                          onSave={(newList) => handleUpdateEssayPoints(ep._id, newList)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {years.map((y) => (
            <div key={y._id} className="relative group flex items-center">
              {editingYearId === y._id ? (
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
                  <input
                    type="number"
                    value={editingYearVal}
                    onChange={(e) => setEditingYearVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateYear(y._id);
                    }}
                    className="w-16 bg-transparent text-sm text-zinc-100 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdateYear(y._id)}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingYearId(null)}
                    className="text-zinc-500 hover:text-zinc-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => setSelectedYear(y)}
                    className={`flex items-center gap-1.5 rounded px-3.5 py-1.5 text-sm font-medium transition ${
                      selectedYear?._id === y._id
                        ? 'bg-zinc-100 text-zinc-950 shadow-md'
                        : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {y.year}
                  </button>
                  <div className="absolute -top-1 -right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition duration-150">
                    <button
                      onClick={() => {
                        setEditingYearId(y._id);
                        setEditingYearVal(y.year.toString());
                      }}
                      className="p-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    >
                      <Edit2 className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteYear(y._id)}
                      className="p-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isAddingYear ? (
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
              <input
                type="number"
                placeholder="Year"
                value={newYearVal}
                onChange={(e) => setNewYearVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddYear();
                }}
                className="w-16 bg-transparent text-sm text-zinc-100 outline-none placeholder-zinc-600"
                autoFocus
              />
              <button
                onClick={handleAddYear}
                className="text-emerald-400 hover:text-emerald-300"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsAddingYear(false)}
                className="text-zinc-500 hover:text-zinc-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingYear(true)}
              className="flex items-center gap-1 rounded border border-dashed border-zinc-800 hover:border-zinc-700 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-400 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Year
            </button>
          )}
        </div>
      </div>

      {!selectedYear && (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-900 rounded-lg p-6">
          <Calendar className="h-10 w-10 text-zinc-700 mb-3" />
          <h3 className="text-sm font-medium text-zinc-300">No workspace years loaded</h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-xs">
            Create a workspace year to begin organizing your current affairs and essay pointers.
          </p>
        </div>
      )}

      {selectedYear && loading && (
        <div className="space-y-4 py-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-zinc-900/40"></div>
          ))}
        </div>
      )}

      {selectedYear && !loading && (
        <div className="space-y-3">
          {months.map((m) => {
            const isMonthExpanded = expandedMonths.includes(m._id);
            const monthSubjects = subjects.filter((s) => s.monthId === m._id);

            return (
              <div
                key={m._id}
                className="rounded-lg border border-zinc-900 bg-zinc-900/10 overflow-hidden transition"
              >
                <button
                  onClick={() => toggleMonth(m._id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-900/40 transition select-none"
                >
                  <div className="flex items-center gap-2">
                    {isMonthExpanded ? (
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-zinc-500" />
                    )}
                    <span className="text-sm font-semibold tracking-wide text-zinc-200">
                      {m.month}
                    </span>
                    <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-500 font-mono">
                      {monthSubjects.length} subjects
                    </span>
                  </div>
                </button>

                {isMonthExpanded && (
                  <div className="border-t border-zinc-900/60 bg-zinc-950/40 p-4 space-y-4">
                    <div className="space-y-3">
                      {monthSubjects.map((sub) => {
                        const isSubjectExpanded = expandedSubjects.includes(sub._id);
                        const subjectTopics = topicsMap[sub._id] || [];

                        return (
                          <div
                            key={sub._id}
                            className="rounded border border-zinc-900/60 bg-zinc-900/5 overflow-hidden"
                          >
                            <div className="group flex items-center justify-between px-3 py-2.5 hover:bg-zinc-900/25 transition">
                              {editingSubjectId === sub._id ? (
                                <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                                  <input
                                    type="text"
                                    value={editingSubjectName}
                                    onChange={(e) => setEditingSubjectName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleUpdateSubject(sub._id);
                                    }}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-0.5 text-xs text-zinc-100 outline-none"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleUpdateSubject(sub._id)}
                                    className="text-emerald-400 hover:text-emerald-300"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingSubjectId(null)}
                                    className="text-zinc-500 hover:text-zinc-400"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => toggleSubject(sub._id)}
                                    className="flex items-center gap-2 text-left flex-1 select-none"
                                  >
                                    {isSubjectExpanded ? (
                                      <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                                    ) : (
                                      <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                                    )}
                                    <span className="text-xs font-semibold text-zinc-300">
                                      {sub.name}
                                    </span>
                                  </button>

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150">
                                    <button
                                      onClick={() => {
                                        setEditingSubjectId(sub._id);
                                        setEditingSubjectName(sub.name);
                                      }}
                                      className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                                      title="Edit Subject"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSubject(sub._id)}
                                      className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400"
                                      title="Delete Subject"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>

                            {isSubjectExpanded && (
                              <div className="border-t border-zinc-900/40 bg-zinc-950/60 p-3 pl-6 space-y-3">
                                <div className="space-y-2">
                                  {subjectTopics.length === 0 ? (
                                    <p className="text-xs text-zinc-600 italic py-1 pl-2">
                                      No topics added yet.
                                    </p>
                                  ) : (
                                    subjectTopics.map((topic) => {
                                      const isTopicExpanded = expandedTopics.includes(topic._id);

                                      return (
                                        <div
                                          key={topic._id}
                                          id={`topic-node-${topic._id}`}
                                          className="rounded border border-zinc-900/40 bg-zinc-950/20 overflow-hidden transition-colors"
                                        >
                                          <div className="group flex items-center justify-between px-3 py-2 hover:bg-zinc-900/20 transition">
                                            {editingTopicId === topic._id ? (
                                              <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                                                <input
                                                  type="text"
                                                  value={editingTopicTitle}
                                                  onChange={(e) => setEditingTopicTitle(e.target.value)}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdateTopicTitle(topic._id, sub._id);
                                                  }}
                                                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 text-xs text-zinc-100 outline-none"
                                                  autoFocus
                                                />
                                                <button
                                                  onClick={() => handleUpdateTopicTitle(topic._id, sub._id)}
                                                  className="text-emerald-400 hover:text-emerald-300"
                                                >
                                                  <Check className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                  onClick={() => setEditingTopicId(null)}
                                                  className="text-zinc-500 hover:text-zinc-400"
                                                >
                                                  <X className="h-3.5 w-3.5" />
                                                </button>
                                              </div>
                                            ) : (
                                              <>
                                                <button
                                                  onClick={() => toggleTopic(topic._id)}
                                                  className="flex items-center gap-2 text-left flex-1 select-none"
                                                >
                                                  {isTopicExpanded ? (
                                                    <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                                                  ) : (
                                                    <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                                                  )}
                                                  <span className="text-xs font-semibold text-zinc-300">
                                                    {topic.title}
                                                  </span>
                                                </button>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150">
                                                  <button
                                                    onClick={() => {
                                                      setEditingTopicId(topic._id);
                                                      setEditingTopicTitle(topic.title);
                                                    }}
                                                    className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                                                    title="Edit Title"
                                                  >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteTopic(topic._id, sub._id)}
                                                    className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-red-400"
                                                    title="Delete Topic"
                                                  >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>

                                          {isTopicExpanded && (
                                            <div className="border-t border-zinc-900/40 bg-zinc-950/45 p-4 space-y-4">
                                              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                <div className="space-y-4">
                                                  <PointersManager
                                                    title="Prelims Pointers"
                                                    pointers={topic.prelimsPointers}
                                                    onSave={(newList) =>
                                                      handleUpdatePointers(
                                                        topic._id,
                                                        sub._id,
                                                        'prelims',
                                                        newList
                                                      )
                                                    }
                                                  />
                                                  <PointersManager
                                                    title="Mains Pointers"
                                                    pointers={topic.mainsPointers}
                                                    onSave={(newList) =>
                                                      handleUpdatePointers(
                                                        topic._id,
                                                        sub._id,
                                                        'mains',
                                                        newList
                                                      )
                                                    }
                                                  />
                                                </div>
                                                <div>
                                                  <NotesManager
                                                    key={topic._id}
                                                    initialNotes={topic.notes}
                                                    updatedAt={topic.updatedAt}
                                                    onSave={(newNotes) =>
                                                      handleSaveNotes(topic._id, sub._id, newNotes)
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                                <div className="pt-1">
                                  {addingTopicSubjectId === sub._id ? (
                                    <div className="flex items-center gap-1.5 max-w-sm">
                                      <input
                                        type="text"
                                        placeholder="Enter topic title..."
                                        value={newTopicTitle}
                                        onChange={(e) => setNewTopicTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleAddTopic(sub._id);
                                        }}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none"
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => handleAddTopic(sub._id)}
                                        className="text-emerald-400 hover:text-emerald-350 p-1"
                                      >
                                        <Check className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => setAddingTopicSubjectId(null)}
                                        className="text-zinc-500 hover:text-zinc-400 p-1"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setAddingTopicSubjectId(sub._id)}
                                      className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-400 transition"
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                      Add Topic
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-zinc-900/40">
                      {addingSubjectMonthId === m._id ? (
                        <div className="flex items-center gap-1.5 max-w-sm">
                          <input
                            type="text"
                            placeholder="Subject name"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddSubject(m._id);
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1 text-xs text-zinc-200 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddSubject(m._id)}
                            className="text-emerald-400 hover:text-emerald-350 p-1"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setAddingSubjectMonthId(null)}
                            className="text-zinc-500 hover:text-zinc-400 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingSubjectMonthId(m._id)}
                          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-400 transition"
                        >
                          <FolderPlus className="h-4 w-4" />
                          Add Subject
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
