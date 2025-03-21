import React from 'react';
import { Typography, CircularProgress } from '@mui/material';

const TaskStats = ({ tasks }) => {
  const calculateTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'COMPLETED').length;
    const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    const notStarted = tasks.filter(task => task.status === 'NOT_STARTED').length;
    
    return {
      completed: total ? Math.round((completed / total) * 100) : 0,
      inProgress: total ? Math.round((inProgress / total) * 100) : 0,
      notStarted: total ? Math.round((notStarted / total) * 100) : 0
    };
  };

  const stats = calculateTaskStats();

  return (
    <div className="status-charts">
      <div className="chart-container">
        <CircularProgress 
          variant="determinate" 
          value={stats.completed} 
          size={120}
          thickness={8}
          sx={{ color: '#4caf50' }}
        />
        <Typography>
          Completed ({stats.completed}%)
        </Typography>
      </div>
      <div className="chart-container">
        <CircularProgress 
          variant="determinate" 
          value={stats.inProgress} 
          size={120}
          thickness={8}
          sx={{ color: '#2196f3' }}
        />
        <Typography>
          In Progress ({stats.inProgress}%)
        </Typography>
      </div>
      <div className="chart-container">
        <CircularProgress 
          variant="determinate" 
          value={stats.notStarted} 
          size={120}
          thickness={8}
          sx={{ color: '#f44336' }}
        />
        <Typography>
          Not Started ({stats.notStarted}%)
        </Typography>
      </div>
    </div>
  );
};

export default TaskStats;
