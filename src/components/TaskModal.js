import React, { useState, useEffect } from 'react';

const TaskModal = ({ isOpen, onClose, onSubmit, editingTask, currentPage, allTasks }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', importance: 50, difficulty: 50, deadline: '', 
    repeatDays: null, parentId: null, dependsOn: null, dependencyStrength: 50
  });
  const [addToToday, setAddToToday] = useState(currentPage === 'today');
  const [isRepeating, setIsRepeating] = useState(false);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultState = {
      title: '', description: '', importance: 50, difficulty: 50, deadline: tomorrow.toISOString().split('T')[0], 
      repeatDays: null, parentId: null, dependsOn: null, dependencyStrength: 50
    };

    if (editingTask) {
      setFormData({ ...defaultState, ...editingTask });
      setAddToToday(editingTask.isToday);
      setIsRepeating(!!editingTask.repeatDays);
    } else {
      setFormData(defaultState);
      setAddToToday(currentPage === 'today');
      setIsRepeating(false);
    }
  }, [editingTask, currentPage]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'range' || type === 'number' ? parseInt(value) : value
    }));
  };

  const handleDeadlineChange = (days) => {
    const currentDate = new Date(formData.deadline);
    currentDate.setDate(currentDate.getDate() + days);
    setFormData(prev => ({ ...prev, deadline: currentDate.toISOString().split('T')[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline) return;
    const finalFormData = { 
      ...formData, 
      repeatDays: isRepeating ? formData.repeatDays : null,
      dependsOn: formData.dependsOn ? parseInt(formData.dependsOn) : null,
      parentId: formData.parentId ? parseInt(formData.parentId) : null,
    };
    onSubmit(finalFormData, addToToday);
  };

  const availableTasks = allTasks.filter(t => t.id !== editingTask?.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
          {/* MODIFIED: Added scrollable container */}
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Importance ({formData.importance})</label>
              <input type="range" name="importance" min="0" max="100" value={formData.importance} onChange={handleChange} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty ({formData.difficulty})</label>
              <input type="range" name="difficulty" min="0" max="100" value={formData.difficulty} onChange={handleChange} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline *</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleDeadlineChange(-1)} className="px-2 py-1 border rounded-md">-</button>
                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                <button type="button" onClick={() => handleDeadlineChange(1)} className="px-2 py-1 border rounded-md">+</button>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Task (optional)</label>
                <select name="parentId" value={formData.parentId || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">None</option>
                  {availableTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Depends On (optional)</label>
                <select name="dependsOn" value={formData.dependsOn || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">None</option>
                  {availableTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
                {formData.dependsOn && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mt-2">Dependency Strength ({formData.dependencyStrength}%)</label>
                    <input type="range" name="dependencyStrength" min="0" max="100" value={formData.dependencyStrength} onChange={handleChange} className="w-full" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <input type="checkbox" id="isRepeating" checked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                <label htmlFor="isRepeating" className="text-sm font-medium text-gray-700">Repeat task every</label>
                <input type="number" name="repeatDays" value={formData.repeatDays || ''} onChange={handleChange} disabled={!isRepeating} className="w-20 px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-200" min="1"/>
                <span className="text-sm text-gray-700">days</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" id="addToToday" checked={addToToday} onChange={(e) => setAddToToday(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                <label htmlFor="addToToday" className="text-sm text-gray-700">Add to Today's Plan</label>
            </div>
          </div>
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{editingTask ? 'Update' : 'Add'} Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;