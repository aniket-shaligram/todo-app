import React from 'react';
import { Typography } from '@mui/material';

const CompletedTasks = ({ tasks }) => {
  return (
    <div className="completed-tasks">
      <Typography variant="h6" gutterBottom>
        Completed Tasks
      </Typography>
      {tasks.slice(0, 3).map((task) => (
        <div key={task.id} className="completed-task-card">
          {task.imageUrl ? (
            <img 
              src={task.imageUrl} 
              alt="Task" 
              className="completed-task-image"
            />
          ) : (
            <div 
              className="completed-task-image" 
              style={{ background: '#f5f5f5' }}
            />
          )}
          <div className="completed-task-content">
            <Typography className="completed-task-title">
              {task.title}
            </Typography>
            <Typography className="completed-task-date">
              Completed {new Date(task.updatedAt).toLocaleDateString()}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompletedTasks;
