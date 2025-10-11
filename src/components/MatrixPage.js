import React, { useState, useMemo } from 'react';
import { useTaskPositions } from '../hooks/useTaskPositions';
import { calculateUrgency } from '../helpers';
import { useLocalStorage } from '../hooks/useLocalStorage';

import MatrixGraph from './MatrixGraph';
import TaskDetails from './TaskDetails';
import PriorityList from './PriorityList';
import CompletedTasksList from './CompletedTasksList';
import SearchPanel from './SearchPanel';
import SettingsPanel from './SettingsPanel';
import { Calendar, Grid } from 'lucide-react';

const MatrixPage = ({ tasks, setTasks, completedTasks, setCompletedTasks, retentionDays, setRetentionDays, selectedTask, setSelectedTask, onEditTask, onToggleToday, onDuplicateTask, onCompleteTask, onDeleteCompletedTask }) => {
  const [showToday, setShowToday] = useState(true);
  const [showOther, setShowOther] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('title');
  const [useRegex, setUseRegex] = useState(false);
  const [sortBy, setSortBy] = useState('score');
  const [defaultExportName, setDefaultExportName] = useLocalStorage('defaultExportName', 'eisenhower_backup.json');

  const filteredTasksForGraph = useMemo(() => {
    return tasks.filter(task => {
      if (showToday && task.isToday) return true;
      if (showOther && !task.isToday) return true;
      return false;
    });
  }, [tasks, showToday, showOther]);

  const tasksWithPositions = useTaskPositions(filteredTasksForGraph);

  const displayedPriorityList = useMemo(() => {
    const MAX_RAW_SCORE = Math.pow(100, 2) + 2 * Math.pow(100, 2);
    
    let processedTasks = tasks.map(task => {
        const urgency = calculateUrgency(task.deadline);
        const score = (Math.pow(urgency, 2) + 2 * Math.pow(task.importance, 2)) / MAX_RAW_SCORE * 100;
        return { ...task, urgency, score };
    });

    if (searchQuery) {
      processedTasks = processedTasks.filter(task => {
        const fieldValue = String(task[searchField] || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        
        if (useRegex) {
          try {
            const regex = new RegExp(query, 'i');
            return regex.test(fieldValue);
          } catch (e) {
            return false;
          }
        } else {
          return fieldValue.includes(query);
        }
      });
    }

    processedTasks.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'urgency') return b.urgency - a.urgency;
      if (sortBy === 'importance') return b.importance - a.importance;
      return 0;
    });

    return processedTasks;
  }, [tasks, searchQuery, searchField, useRegex, sortBy]);

  const visibleCompletedTasks = useMemo(() => {
    const retentionCutoff = new Date();
    retentionCutoff.setDate(retentionCutoff.getDate() - retentionDays);
    return completedTasks.filter(t => new Date(t.completedAt) > retentionCutoff);
  }, [completedTasks, retentionDays]);

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  const handleRestoreTask = (taskId) => {
    const taskToRestore = completedTasks.find(t => t.id === taskId);
    if (!taskToRestore) return;
    const { completedAt, ...restoredTask } = taskToRestore;
    setTasks([...tasks, restoredTask]);
    setCompletedTasks(completedTasks.filter(t => t.id !== taskId));
  };

  const handleSaveToFile = () => {
    const data = { tasks, completedTasks, retentionDays, defaultExportName };
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify(data, null, 2));
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', defaultExportName);
    linkElement.click();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-end gap-2 mb-2">
            <button onClick={() => setShowToday(!showToday)} className={`flex items-center gap-2 px-3 py-1 text-xs rounded-full ${showToday ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}>
              <Calendar size={14} /> Today's Tasks
            </button>
            <button onClick={() => setShowOther(!showOther)} className={`flex items-center gap-2 px-3 py-1 text-xs rounded-full ${showOther ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}>
              <Grid size={14} /> Other Tasks
            </button>
          </div>
          <MatrixGraph 
            tasksWithPositions={tasksWithPositions}
            selectedTask={selectedTask}
            onTaskSelect={setSelectedTask}
            allTasks={tasks}
          />
        </div>
        <div className="lg:col-span-1">
          <TaskDetails 
            selectedTask={tasks.find(t => t.id === selectedTask?.id)}
            allTasks={tasks}
            onEdit={onEditTask}
            onDelete={handleDeleteTask}
            onComplete={onCompleteTask}
            onToggleToday={onToggleToday}
            onDuplicate={onDuplicateTask}
            setTasks={setTasks}
          />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-lg border p-6">
        <SearchPanel 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchField={searchField}
          setSearchField={setSearchField}
          useRegex={useRegex}
          setUseRegex={setUseRegex}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <PriorityList 
          tasks={displayedPriorityList} 
          onTaskSelect={setSelectedTask} 
          displayFields={[sortBy, searchField]}
        />
      </div>
      
      <CompletedTasksList 
        tasks={visibleCompletedTasks}
        retentionDays={retentionDays}
        onSetRetentionDays={setRetentionDays}
        onRestoreTask={handleRestoreTask}
        onDeleteCompletedTask={onDeleteCompletedTask}
      />

      <SettingsPanel 
        defaultExportName={defaultExportName}
        setDefaultExportName={setDefaultExportName}
        onSaveToFile={handleSaveToFile}
      />
    </>
  );
};

export default MatrixPage;