import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { TEAM_MEMBERS } from '../utils/mockData';
import { CheckSquare, Square, Plus, Trash2, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const Tasks = () => {
  const { tasks, addTask, toggleTaskStatus, deleteTask, isTasksLoading, tasksError } = useCRM();

  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Pending', 'Completed'
  const [priorityFilter, setPriorityFilter] = useState('All'); // 'All', 'High', 'Medium', 'Low'
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null); // 'YYYY-MM-DD' filter
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    assignedTo: TEAM_MEMBERS[0],
    leadName: ''
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addTask(newTaskForm);
    setIsAddModalOpen(false);
    // Reset Form
    setNewTaskForm({
      title: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      assignedTo: TEAM_MEMBERS[0],
      leadName: ''
    });
  };

  // Calendar parameters for June 2026 (starts on a Monday, 30 days)
  const currentYear = 2026;
  const monthName = "June 2026";
  const daysInJune = 30;
  // June 1, 2026 was a Monday. In our grid, Monday is column index 1 (Sunday is 0)
  const startOffset = 1;

  const calendarDays = [];
  // Fill offset days from previous month
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }
  // Fill June days
  for (let i = 1; i <= daysInJune; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    calendarDays.push(`${currentYear}-06-${dayStr}`);
  }

  // Task indicators check for calendar
  const getTasksForDate = (dateStr) => {
    return tasks.filter(t => t.dueDate === dateStr);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = 
      activeFilter === 'All' ? true :
      activeFilter === 'Pending' ? task.status === 'Pending' : task.status === 'Completed';

    const matchesPriority = 
      priorityFilter === 'All' ? true : task.priority === priorityFilter;

    const matchesDate = 
      selectedCalendarDate === null ? true : task.dueDate === selectedCalendarDate;

    return matchesStatus && matchesPriority && matchesDate;
  });

  if (isTasksLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', width: '100%' }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start', width: '100%' }}>
      
      {/* Left Area: Task Checklist */}
      <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {tasksError && (
          <div className="glass-panel" style={{ padding: '12px 20px', backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', borderRadius: '8px', borderLeft: '4px solid var(--error)' }}>
            <span>Database Error: {tasksError}</span>
          </div>
        )}
        
        {/* Filters and Actions */}
        <div 
          className="glass-panel"
          style={{ 
            padding: '16px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '12px' 
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Status tabs */}
            {['All', 'Pending', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); }}
                className="btn btn-ghost"
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  backgroundColor: activeFilter === f ? 'var(--bg-hover)' : 'transparent',
                  color: activeFilter === f ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                {f}
              </button>
            ))}

            {/* Separator */}
            <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 8px' }} />

            {/* Priority Filter */}
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: '130px', padding: '4px 10px', height: '32px', fontSize: '13px' }}
            >
              <option value="All">All Priorities</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>

            {/* Clear Date Filter Button */}
            {selectedCalendarDate && (
              <button
                onClick={() => setSelectedCalendarDate(null)}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', height: '32px', fontSize: '12px' }}
              >
                Clear Date: {selectedCalendarDate.substring(8)}th <X size={10} />
              </button>
            )}
          </div>

          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary" style={{ height: '32px', padding: '6px 14px' }}>
            <Plus size={14} />
            <span>Create Task</span>
          </button>
        </div>

        {/* Task list container */}
        <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
          {filteredTasks.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tasks match the selected criteria.
            </div>
          ) : (
            filteredTasks.map(task => {
              const isCompleted = task.status === 'Completed';
              return (
                <div 
                  key={task.id} 
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    backgroundColor: isCompleted ? 'rgba(0,0,0,0.01)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    {/* Checkbox */}
                    <button 
                      onClick={() => toggleTaskStatus(task.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isCompleted ? 'var(--success)' : 'var(--text-muted)', padding: '0' }}
                    >
                      {isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span 
                        style={{ 
                          fontSize: '14px', 
                          fontWeight: 500, 
                          color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none'
                        }}
                      >
                        {task.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} />
                          Due: {task.dueDate}
                        </span>
                        <span>•</span>
                        <span>Assignee: {task.assignedTo}</span>
                        {task.leadName && (
                          <>
                            <span>•</span>
                            <span style={{ color: 'var(--primary)' }}>Ref: {task.leadName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span 
                      className={`badge badge-${
                        task.priority === 'High' ? 'danger' : 
                        task.priority === 'Medium' ? 'warning' : 'success'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="btn btn-ghost" 
                      style={{ padding: '6px', borderRadius: '50%', color: 'var(--error-text)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Mini Calendar integration UI widget */}
      <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{monthName}</h4>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn btn-ghost" style={{ padding: '4px', borderRadius: '50%' }} disabled><ChevronLeft size={16} /></button>
              <button className="btn btn-ghost" style={{ padding: '4px', borderRadius: '50%' }} disabled><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
            
            {/* Week Headers */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <span key={idx} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                {day}
              </span>
            ))}

            {/* Calendar Cells */}
            {calendarDays.map((dateStr, idx) => {
              if (dateStr === null) return <div key={`offset-${idx}`} />;
              
              const dayNum = dateStr.substring(8);
              const dateTasks = getTasksForDate(dateStr);
              const isSelected = selectedCalendarDate === dateStr;
              
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedCalendarDate(isSelected ? null : dateStr)}
                  style={{
                    background: isSelected ? 'var(--primary)' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                    borderRadius: '6px',
                    padding: '6px 0',
                    fontSize: '12px',
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '36px',
                    outline: 'none',
                    fontWeight: dateTasks.length > 0 ? 600 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>{parseInt(dayNum)}</span>
                  {/* Task indicator dots */}
                  {dateTasks.length > 0 && !isSelected && (
                    <div style={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '3px' }}>
                      {dateTasks.slice(0, 3).map((t, tIdx) => (
                        <div 
                          key={tIdx} 
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: 
                              t.priority === 'High' ? 'var(--error)' : 
                              t.priority === 'Medium' ? 'var(--warning)' : 'var(--success)'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            * Click a date on the calendar grid to filter the tasks checklist to that day.
          </div>
        </div>
      </div>

      {/* Add Task Modal Dialog */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div 
            className="glass-modal animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '440px', padding: '30px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Schedule Workspace Task</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-ghost" style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label>Task Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={newTaskForm.title} 
                  onChange={handleFormChange}
                  placeholder="e.g. Call client about quote details"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Due Date *</label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    value={newTaskForm.dueDate} 
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label>Priority</label>
                  <select name="priority" value={newTaskForm.priority} onChange={handleFormChange}>
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Assignee</label>
                  <select name="assignedTo" value={newTaskForm.assignedTo} onChange={handleFormChange}>
                    {TEAM_MEMBERS.map(rep => <option key={rep} value={rep}>{rep}</option>)}
                  </select>
                </div>
                <div>
                  <label>Ref. Lead Name (Optional)</label>
                  <input 
                    type="text" 
                    name="leadName" 
                    value={newTaskForm.leadName} 
                    onChange={handleFormChange}
                    placeholder="e.g. David Chen"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              >
                Schedule Task
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
