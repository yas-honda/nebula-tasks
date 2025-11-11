import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { Task } from './types';

// Helper component for SVG icons
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const CancelIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingTasks, setDeletingTasks] = useState<Set<number>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');


  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getTasks = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/getTasks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data.tasks);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(`Failed to fetch tasks: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const response = await fetch('/api/addTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTaskText }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setNewTaskText('');
      getTasks(); 
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        setError(`Failed to add task: ${errorMessage}`);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (deletingTasks.has(taskId)) return;

    setDeletingTasks(prev => new Set(prev).add(taskId));

    try {
        const response = await fetch('/api/deleteTask', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        setTimeout(() => {
            setTasks(tasks => tasks.filter(task => task.id !== taskId));
            setDeletingTasks(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
            });
        }, 400);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        setError(`Failed to delete task: ${errorMessage}`);
        setDeletingTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
        });
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditText('');
  };

  const handleUpdateTask = async (e: FormEvent<HTMLFormElement>, taskId: number) => {
    e.preventDefault();
    if (!editText.trim()) return;

    try {
        const response = await fetch('/api/updateTask', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId, text: editText }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        handleCancelEdit();
        getTasks();
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        setError(`Failed to update task: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-8 sm:pt-16 px-4">
      <div className="w-full max-w-2xl">
        <header 
          className={`text-center mb-8 transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
          style={{ transitionDelay: '100ms' }}
        >
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                Nebula Tasks
            </h1>
            <p className="text-gray-400 mt-2">Powered by React, Vercel Functions & Postgres</p>
        </header>

        <main 
          className={`bg-gray-800 rounded-lg shadow-2xl p-6 transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
          style={{ transitionDelay: '200ms' }}
        >
          <form onSubmit={handleAddTask} className="flex gap-4 mb-6">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-transform transform hover:scale-105">
              <PlusIcon className="w-5 h-5"/> Add
            </button>
          </form>

          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-center">{error}</div>}

          <div className="space-y-4">
            {loading ? ( <div className="text-center text-gray-400">Loading tasks...</div> ) 
            : tasks.length === 0 && !loading ? (
              <div className="text-center text-gray-400 py-8 animate-load opacity-0">
                <p>No tasks yet. Add one above to get started!</p>
              </div>
            ) : (
                <ul className="space-y-3">
                {tasks.map((task) => (
                    <li 
                      key={task.id} 
                      className={`bg-gray-700/50 rounded-lg p-4 flex items-center gap-4 border border-gray-700 transition-all duration-300 group
                        ${deletingTasks.has(task.id) ? 'task-item-exit' : 'task-item-enter'}
                        ${editingTaskId === task.id ? 'border-purple-500' : 'hover:border-purple-500'}`
                      }
                    >
                        {editingTaskId === task.id ? (
                            <form onSubmit={(e) => handleUpdateTask(e, task.id)} className="flex-grow flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="flex-grow bg-gray-600 border-2 border-gray-500 rounded-md px-3 py-1 text-white focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-transparent transition"
                                    autoFocus
                                />
                                <button type="submit" aria-label="Save changes" className="text-green-400 hover:text-green-300 transition-colors p-1"><SaveIcon className="w-5 h-5" /></button>
                                <button type="button" onClick={handleCancelEdit} aria-label="Cancel editing" className="text-red-400 hover:text-red-300 transition-colors p-1"><CancelIcon className="w-5 h-5" /></button>
                            </form>
                        ) : (
                            <>
                                <CheckIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                                <span className="flex-grow text-gray-200">{task.text}</span>
                                <span className="text-xs text-gray-500 flex-shrink-0 hidden sm:block">
                                    {new Date(task.created_at).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleStartEdit(task)} className="text-gray-500 hover:text-blue-400 transition-colors p-1" aria-label={`Edit task: ${task.text}`}>
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteTask(task.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1" aria-label={`Delete task: ${task.text}`} disabled={deletingTasks.has(task.id)}>
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
                </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
