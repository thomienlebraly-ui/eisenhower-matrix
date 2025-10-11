import React, { useState, useMemo, useRef, useEffect } from 'react';
import { getDifficultyColor, getScoreColor, calculateUrgency } from '../helpers';
import { Clock, Plus, Download } from 'lucide-react';
import TimeEditModal from './TimeEditModal';

const timeToMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const yToTime = (y, timelineRef, hours) => {
  if (!timelineRef.current) return '00:00';
  const timelineRect = timelineRef.current.getBoundingClientRect();
  const hourHeight = timelineRect.height / hours.length;
  const totalMinutes = Math.round(((y / hourHeight) * 60) / 15) * 15;
  const finalMinutes = (hours[0] * 60) + totalMinutes;
  return minutesToTime(finalMinutes);
};

const timeToYPercent = (time, hours) => {
  const totalMinutes = timeToMinutes(time) - (hours[0] * 60);
  return (totalMinutes / (hours.length * 60)) * 100;
};


const TodayPage = ({ tasks, onScheduleTask, onUnscheduleTask, onAddTask, onViewDetails }) => {
  const timelineRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [previewState, setPreviewState] = useState({ visible: false, top: 0, height: 0 });
  const [editingTask, setEditingTask] = useState(null);
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const hours = useMemo(() => Array.from({ length: 18 }, (_, i) => i + 6), []);

  useEffect(() => {
    const updateLine = () => {
      const now = new Date();
      const totalMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = 6 * 60;
      const endMinutes = 24 * 60;
      if (totalMinutes >= startMinutes && totalMinutes < endMinutes) {
        const percent = ((totalMinutes - startMinutes) / ((18) * 60)) * 100;
        setCurrentTimePosition(percent);
      } else {
        setCurrentTimePosition(-1);
      }
    };
    updateLine();
    const interval = setInterval(updateLine, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleResizeStart = (e, task, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (!timelineRef.current) return;
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const topPercent = timeToYPercent(task.startTime, hours);
    const bottomPercent = timeToYPercent(task.endTime, hours);
    setResizeState({
      type,
      task,
      initialTopPixels: (topPercent / 100) * timelineRect.height,
      initialBottomPixels: (bottomPercent / 100) * timelineRect.height,
      initialTopPercent: topPercent,
    });
    setPreviewState({
      visible: true,
      top: topPercent,
      height: bottomPercent - topPercent,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizeState || !timelineRef.current) return;
      
      const timelineRect = timelineRef.current.getBoundingClientRect();
      const mouseY = e.clientY - timelineRect.top;
      
      if (resizeState.type === 'resize-end') {
        const newHeight = Math.max(20, mouseY - resizeState.initialTopPixels);
        setPreviewState({ visible: true, top: resizeState.initialTopPercent, height: (newHeight / timelineRect.height) * 100 });
      } else if (resizeState.type === 'resize-start') {
        const newTop = Math.min(mouseY, resizeState.initialBottomPixels - 20);
        const newHeight = resizeState.initialBottomPixels - newTop;
        setPreviewState({ visible: true, top: (newTop / timelineRect.height) * 100, height: (newHeight / timelineRect.height) * 100 });
      }
    };

    const handleMouseUp = () => {
      if (!resizeState || !timelineRef.current) return;
      
      const timelineRect = timelineRef.current.getBoundingClientRect();
      const finalTop = (previewState.top / 100) * timelineRect.height;
      const finalHeight = (previewState.height / 100) * timelineRect.height;
      
      const newStartTime = yToTime(finalTop, timelineRef, hours);
      const newEndTime = yToTime(finalTop + finalHeight, timelineRef, hours);

      if (resizeState.type === 'resize-end') {
        onScheduleTask(resizeState.task.id, resizeState.task.startTime, newEndTime);
      } else if (resizeState.type === 'resize-start') {
        onScheduleTask(resizeState.task.id, newStartTime, resizeState.task.endTime);
      }
      
      setResizeState(null);
      setPreviewState({ visible: false, top: 0, height: 0 });
    };

    if (resizeState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeState, previewState, onScheduleTask, hours]);

  const { unscheduled, layout } = useMemo(() => {
    const MIN_DURATION_MINUTES = 40;
    const MAX_RAW_SCORE = Math.pow(100, 2) + 2 * Math.pow(100, 2);
    const tasksWithScores = tasks.map(task => {
      const urgency = calculateUrgency(task.deadline);
      const score = (Math.pow(urgency, 2) + 2 * Math.pow(task.importance, 2)) / MAX_RAW_SCORE * 100;
      return { ...task, urgency, score };
    }).sort((a, b) => b.score - a.score);

    const scheduled = tasksWithScores.filter(t => t.startTime && t.endTime);
    const unscheduled = tasksWithScores.filter(t => !t.startTime || !t.endTime);

    const layout = [];
    const columns = [];
    scheduled.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    for (const task of scheduled) {
      const start = timeToMinutes(task.startTime);
      const end = timeToMinutes(task.endTime);
      const duration = end - start;
      const visualEnd = start + Math.max(duration, MIN_DURATION_MINUTES);

      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i] <= start) {
          layout.push({ ...task, col: i, numCols: 0 });
          columns[i] = visualEnd;
          placed = true;
          break;
        }
      }
      if (!placed) {
        layout.push({ ...task, col: columns.length, numCols: 0 });
        columns.push(visualEnd);
      }
    }

    for (const task of layout) {
      const start = timeToMinutes(task.startTime);
      const end = timeToMinutes(task.endTime);
      const duration = end - start;
      const visualEnd = start + Math.max(duration, MIN_DURATION_MINUTES);
      
      const overlappingTasks = layout.filter(t => {
        const tStart = timeToMinutes(t.startTime);
        const tEnd = timeToMinutes(t.endTime);
        const tDuration = tEnd - tStart;
        const tVisualEnd = tStart + Math.max(tDuration, MIN_DURATION_MINUTES);
        return tStart < visualEnd && tVisualEnd > start;
      });
      task.numCols = Math.max(...overlappingTasks.map(t => t.col)) + 1;
    }

    return { unscheduled, layout };
  }, [tasks]);

  const handleDragStart = (e, task, type) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    setDragState({ type, task, offsetY });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!dragState || !timelineRef.current) return;
    const dropY = e.clientY - timelineRef.current.getBoundingClientRect().top;
    const adjustedDropY = dropY - (dragState.type === 'move' ? dragState.offsetY : 0);
    const newTime = yToTime(adjustedDropY, timelineRef, hours);
    const startMinutes = timeToMinutes(newTime);
    const duration = dragState.task.startTime ? timeToMinutes(dragState.task.endTime) - timeToMinutes(dragState.task.startTime) : 60;
    const endMinutes = startMinutes + duration;
    onScheduleTask(dragState.task.id, minutesToTime(startMinutes), minutesToTime(endMinutes));
    setDragState(null);
  };

  const handleExportToIcal = () => {
    // ... (ical export logic)
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Today's Timeline</h2>
            {/* ... export button ... */}
          </div>
          <div className="flex">
            <div className="w-12 flex-shrink-0">
              {hours.map(hour => (
                <div key={hour} className="h-[40px] text-right pr-2 border-t border-transparent">
                  <span className="text-xs text-gray-400 -mt-2 relative top-[-8px]">{hour}:00</span>
                </div>
              ))}
            </div>
            <div ref={timelineRef} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="relative flex-grow h-[720px] bg-gray-50 rounded-lg overflow-hidden">
              {hours.map((hour, index) => (
                <div key={hour} className={`h-[40px] ${index > 0 ? 'border-t border-gray-200' : ''}`}></div>
              ))}
              {currentTimePosition > 0 && (
                <div className="absolute w-full z-10" style={{ top: `${currentTimePosition}%` }}>
                  <div className="relative h-0">
                    <div className="absolute right-0 -top-1.5 w-full border-t-2 border-red-500 border-dashed"></div>
                    <div className="absolute -left-1.5 -top-1.5 h-3 w-3 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              )}
              {previewState.visible && (
                <div className="absolute w-full bg-indigo-300/50 border-2 border-dashed border-indigo-600 rounded-lg z-20"
                  style={{
                    top: `${previewState.top}%`,
                    height: `${previewState.height}%`,
                  }}
                />
              )}
              {layout.map(task => {
                const start = timeToMinutes(task.startTime);
                const end = timeToMinutes(task.endTime);
                const duration = end - start;
                const visualDuration = Math.max(duration, 40);

                const top = timeToYPercent(task.startTime, hours);
                const height = (visualDuration / (hours.length * 60)) * 100;
                const width = 100 / task.numCols;
                const left = task.col * width;

                const timelineHeight = 720;
                const taskPixelHeight = (height / 100) * timelineHeight;
                const taskPixelWidth = ((width / 100) * (timelineRef.current?.clientWidth || 0));

                const FONT_SIZE = 14;
                const CHAR_WIDTH = FONT_SIZE * 0.6;
                const PADDING = 16;

                const heightNeededForTwoLines = (FONT_SIZE * 2) + PADDING;
                const timeText = `${task.startTime} - ${task.endTime}`;
                const widthNeededForOneLine = (task.title.length * CHAR_WIDTH) + (timeText.length * CHAR_WIDTH) + PADDING;

                let content;
                if (taskPixelHeight >= heightNeededForTwoLines) {
                  content = (
                    <div className="flex flex-col justify-center h-full">
                      <p className="font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">{task.title}</p>
                      <p className="text-xs whitespace-nowrap">{timeText}</p>
                    </div>
                  );
                } else if (taskPixelWidth >= widthNeededForOneLine) {
                  content = (
                    <div className="flex flex-row items-center justify-start h-full gap-2">
                      <p className="font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">{task.title}</p>
                      <p className="text-xs whitespace-nowrap">({timeText})</p>
                    </div>
                  );
                } else {
                  content = (
                    <div className="flex items-center justify-start h-full">
                      <p className="font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">{task.title}</p>
                    </div>
                  );
                }

                return (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, 'move')}
                    onClick={() => setEditingTask(task)}
                    className="absolute rounded-lg shadow-md cursor-pointer flex"
                    style={{
                      top: `${top}%`,
                      height: `${height}%`,
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: getDifficultyColor(task.difficulty),
                      color: 'white',
                      textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <div onMouseDown={(e) => handleResizeStart(e, task, 'resize-start')} className="absolute top-0 left-0 w-full h-2 cursor-n-resize z-10"/>
                    <div className="flex-grow min-h-0 overflow-hidden p-2">
                      {content}
                    </div>
                    <div onMouseDown={(e) => handleResizeStart(e, task, 'resize-end')} className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize z-10"/>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Task Pool ({unscheduled.length})</h2>
            <button onClick={onAddTask} className="flex items-center gap-2 text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200">
              <Plus size={16} /> Add Task
            </button>
          </div>
          <div className="space-y-2">
            {unscheduled.length > 0 ? unscheduled.map(task => {
              const scoreColor = getScoreColor(task.score);
              return (
                <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task, 'new')} className="p-3 bg-gray-100 rounded-lg border cursor-grab flex items-center gap-3">
                  <span className="font-bold text-sm w-16 text-center py-1 rounded-full" style={{ backgroundColor: scoreColor, color: 'white', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                    {task.score.toFixed(1)}
                  </span>
                  <p className="font-semibold text-gray-800">{task.title}</p>
                </div>
              );
            }) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">All tasks scheduled!</h3>
                <p className="text-sm text-gray-500">Drag tasks from the timeline to unschedule them.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {editingTask && (
        <TimeEditModal 
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={onScheduleTask}
          onUnschedule={onUnscheduleTask}
          onViewDetails={onViewDetails}
        />
      )}
    </>
  );
};

export default TodayPage;