import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import MatrixPage from './components/MatrixPage';
import TodayPage from './components/TodayPage';
import TaskModal from './components/TaskModal';
import Navigation from './components/Navigation';

const App = () => {
  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useLocalStorage('eisenhowerTasks', []);
  const [completedTasks, setCompletedTasks] = useLocalStorage('completedTasks', []);
  const [retentionDays, setRetentionDays] = useLocalStorage('retentionDays', 30);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentPage, setCurrentPage] = useState('matrix');

  // --- HANDLER FUNCTIONS ---
  const openModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (formData, addToToday) => {
    if (editingTask) {
      const isToday = addToToday !== undefined ? addToToday : editingTask.isToday;
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData, isToday } : t));
    } else {
      const newTask = { 
        ...formData, 
        id: Date.now(), 
        isToday: addToToday, 
        startTime: null, 
        endTime: null 
      };
      setTasks([...tasks, newTask]);
    }
    closeModal();
  };

  const handleCompleteTask = (taskId) => {
    const taskToComplete = tasks.find(t => t.id === taskId);
    if (!taskToComplete) return;

    if (taskToComplete.repeatDays && taskToComplete.repeatDays > 0) {
      const newDeadlineDate = new Date(taskToComplete.deadline);
      newDeadlineDate.setDate(newDeadlineDate.getDate() + parseInt(taskToComplete.repeatDays));
      const newDeadline = newDeadlineDate.toISOString().split('T')[0];

      const newTask = {
        ...taskToComplete,
        id: Date.now(),
        deadline: newDeadline,
        isToday: false,
        startTime: null,
        endTime: null,
      };
      setTasks([...tasks.filter(t => t.id !== taskId), newTask]);
    } else {
      setTasks(tasks.filter(t => t.id !== taskId));
    }

    const newCompletedTask = { ...taskToComplete, completedAt: new Date().toISOString() };
    setCompletedTasks([newCompletedTask, ...completedTasks]);
    setSelectedTask(null);
  };

  const handleDeleteCompletedTask = (taskId) => {
    if (window.confirm("Are you sure you want to permanently delete this completed task? This cannot be undone.")) {
      setCompletedTasks(completedTasks.filter(t => t.id !== taskId));
    }
  };

  const handleDuplicateTask = (taskId) => {
    const taskToDuplicate = tasks.find(t => t.id === taskId);
    if (!taskToDuplicate) return;
    const newTask = {
      ...taskToDuplicate,
      id: Date.now(),
      title: `${taskToDuplicate.title} (Copy)`,
      isToday: false,
      startTime: null,
      endTime: null,
    };
    setTasks([...tasks, newTask]);
    setSelectedTask(newTask);
  };

  const handleToggleToday = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, isToday: !task.isToday, startTime: null, endTime: null } : task
    ));
  };

  const handleScheduleTask = (taskId, startTime, endTime) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, startTime, endTime } : task
    ));
  };

  const handleUnscheduleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, startTime: null, endTime: null } : task
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Header onAddTask={() => openModal()} />
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

        <main className="mt-6">
          {currentPage === 'matrix' && (
            <MatrixPage
              tasks={tasks}
              setTasks={setTasks}
              completedTasks={completedTasks}
              setCompletedTasks={setCompletedTasks}
              retentionDays={retentionDays}
              setRetentionDays={setRetentionDays}
              selectedTask={selectedTask}
              setSelectedTask={setSelectedTask}
              onEditTask={openModal}
              onToggleToday={handleToggleToday}
              onDuplicateTask={handleDuplicateTask}
              onCompleteTask={handleCompleteTask}
              onDeleteCompletedTask={handleDeleteCompletedTask}
            />
          )}
          {currentPage === 'today' && (
            <TodayPage
              tasks={tasks.filter(t => t.isToday)}
              onScheduleTask={handleScheduleTask}
              onUnscheduleTask={handleUnscheduleTask}
              onAddTask={() => openModal()}
              onViewDetails={(task) => {
                setSelectedTask(task);
                setCurrentPage('matrix');
              }}
            />
          )}
        </main>

        {isModalOpen && (
          <TaskModal 
            isOpen={isModalOpen}
            onClose={closeModal}
            onSubmit={handleSubmit}
            editingTask={editingTask}
            currentPage={currentPage}
            allTasks={tasks}
          />
        )}
      </div>
    </div>
  );
};

export default App;