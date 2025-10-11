import React, { useState, useEffect } from 'react';
import { Target, Edit2, Trash2, CheckCircle, Save, X, Calendar as CalendarIcon, PlusCircle, MinusCircle, Copy, Repeat, Link, GitMerge, ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateUrgency, getQuadrant, getDifficultyColor, formatDateEuropean } from '../helpers';

const TaskDetails = ({ selectedTask, allTasks, onEdit, onDelete, onComplete, onToggleToday, onDuplicate, setTasks }) => {
  const [editingInline, setEditingInline] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (selectedTask) {
      setTempTitle(selectedTask.title);
      setIsDescriptionExpanded(false);
    }
  }, [selectedTask]);

  if (!selectedTask) {
    return (
      <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-6">
        <div className="text-center py-12 flex flex-col items-center justify-center h-full">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a Task</h3>
          <p className="text-gray-600">Click a point on the matrix to see its details.</p>
        </div>
      </div>
    );
  }

  const { id, title, description, importance, difficulty, deadline, isToday, repeatDays, parentId, dependsOn, dependencyStrength } = selectedTask;
  const urgency = calculateUrgency(deadline);
  const quadrant = getQuadrant(importance, urgency);

  const parentTask = parentId ? allTasks.find(t => t.id === parentId) : null;
  const subtasks = allTasks.filter(t => t.parentId === id);
  const dependencyTask = dependsOn ? allTasks.find(t => t.id === dependsOn) : null;

  const handleInlineEdit = (field, value) => {
    const updatedTasks = allTasks.map(t => t.id === id ? { ...t, [field]: value } : t);
    setTasks(updatedTasks);
  };

  const saveInlineEdit = () => {
    handleInlineEdit('title', tempTitle);
    setEditingInline(null);
  };

  const cancelInlineEdit = () => {
    setTempTitle(title);
    setEditingInline(null);
  };

  // NEW: Handler for deadline buttons
  const handleDeadlineChange = (days) => {
    const currentDate = new Date(deadline);
    currentDate.setDate(currentDate.getDate() + days);
    const newDeadline = currentDate.toISOString().split('T')[0];
    handleInlineEdit('deadline', newDeadline);
  };

  const isLongDescription = description && description.length > 120;
  const displayedDescription = isLongDescription && !isDescriptionExpanded ? `${description.substring(0, 120)}...` : description;

  return (
    <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-6 max-h-[90vh] overflow-y-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border-2" style={{ backgroundColor: quadrant.color, borderColor: quadrant.border, color: quadrant.textColor }}>{quadrant.name}</span>
          <button onClick={() => onComplete(id)} className="flex items-center gap-2 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
            <CheckCircle size={16} /> Mark as Complete
          </button>
        </div>
        <div>
          {editingInline === 'title' ? (
            <div className="flex items-center gap-2">
              <input type="text" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} className="flex-1 text-xl font-bold bg-transparent border-b-2 border-indigo-500 focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter') saveInlineEdit(); if (e.key === 'Escape') cancelInlineEdit(); }} autoFocus />
              <button onClick={saveInlineEdit} className="text-green-600"><Save size={16} /></button>
              <button onClick={cancelInlineEdit} className="text-red-600"><X size={16} /></button>
            </div>
          ) : (
            <h3 className="text-2xl font-bold text-gray-800 cursor-pointer" onClick={() => setEditingInline('title')}>{title}</h3>
          )}
        </div>
        <div>
          <p className="text-gray-600" style={{ whiteSpace: 'pre-wrap' }}>
            {displayedDescription || <span className="italic">No description</span>}
          </p>
          {isLongDescription && (
            <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="text-indigo-600 text-sm font-semibold mt-1">
              {isDescriptionExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>
        
        <button onClick={() => onToggleToday(id)} className={`w-full flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${isToday ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
          {isToday ? <MinusCircle size={16} /> : <PlusCircle size={16} />}
          {isToday ? "Remove from Today's Plan" : "Add to Today's Plan"}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-700">Importance</span><div className="text-xl font-bold text-indigo-600">{importance}</div></div><div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: `${importance}%` }} /></div></div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-700">Urgency</span><div className="text-xl font-bold text-orange-600">{urgency}</div></div><div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: `${urgency}%` }} /></div></div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3"><span className="text-sm font-semibold text-gray-700">Difficulty</span><div className="flex items-center gap-3"><div className="text-xl font-bold text-gray-800">{difficulty}</div><div className="w-full bg-gray-200 rounded-full h-3"><div className="h-3 rounded-full" style={{ width: `${difficulty}%`, backgroundColor: getDifficultyColor(difficulty) }} /></div></div></div>
        
        {/* MODIFIED: Deadline with +/- buttons */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-gray-600" /><span className="text-sm font-semibold text-gray-700">Deadline</span></div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleDeadlineChange(-1)} className="p-1 rounded-full hover:bg-gray-200"><ChevronLeft size={16} /></button>
              <div className="text-lg font-bold text-gray-800">{formatDateEuropean(deadline)}</div>
              <button onClick={() => handleDeadlineChange(1)} className="p-1 rounded-full hover:bg-gray-200"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
        
        {repeatDays > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2"><Repeat className="w-4 h-4 text-gray-600" /><span className="text-sm font-semibold text-gray-700">Repeat</span></div>
            <div className="text-lg font-bold text-gray-800">Every {repeatDays} day{repeatDays > 1 ? 's' : ''}</div>
          </div>
        )}

        {parentTask && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2"><GitMerge className="w-4 h-4 text-gray-600" /><span className="text-sm font-semibold text-gray-700">Subtask of</span></div>
            <div className="text-lg font-bold text-gray-800">{parentTask.title}</div>
          </div>
        )}

        {dependencyTask && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2"><Link className="w-4 h-4 text-gray-600" /><span className="text-sm font-semibold text-gray-700">Depends on</span></div>
            <div className="text-lg font-bold text-gray-800">{dependencyTask.title} ({dependencyStrength}%)</div>
          </div>
        )}

        {subtasks.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2"><GitMerge className="w-4 h-4 text-gray-600" /><span className="text-sm font-semibold text-gray-700">Subtasks</span></div>
            <ul className="list-disc list-inside space-y-1">
              {subtasks.map(st => <li key={st.id} className="text-sm text-gray-800">{st.title}</li>)}
            </ul>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={() => onDuplicate(id)} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2">
            <Copy size={16} /> Duplicate
          </button>
          <button onClick={() => onEdit(selectedTask)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <Edit2 size={16} /> Edit
          </button>
          <button onClick={() => onDelete(id)} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;