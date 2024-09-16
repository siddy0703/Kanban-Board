import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const defaultAvatar = 'https://via.placeholder.com/50';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState('status'); // default grouping by status
  const [sortBy, setSortBy] = useState('priority'); // default sorting by priority
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        setTickets(result.data.tickets);
        setUsers(result.data.users);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Save user preferences in localStorage
  useEffect(() => {
    const savedGroupBy = localStorage.getItem('groupBy');
    const savedSortBy = localStorage.getItem('sortBy');
    if (savedGroupBy) setGroupBy(savedGroupBy);
    if (savedSortBy) setSortBy(savedSortBy);
  }, []);

  useEffect(() => {
    localStorage.setItem('groupBy', groupBy);
  }, [groupBy]);

  useEffect(() => {
    localStorage.setItem('sortBy', sortBy);
  }, [sortBy]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Kanban Board</h1>
      <Controls 
        groupBy={groupBy} 
        setGroupBy={setGroupBy} 
        sortBy={sortBy} 
        setSortBy={setSortBy} 
      />
      <KanbanBoard tickets={tickets} users={users} groupBy={groupBy} sortBy={sortBy} />
    </div>
  );
};

const Controls = ({ groupBy, setGroupBy, sortBy, setSortBy }) => {
  return (
    <div className="controls">
      <label>Group by: </label>
      <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
        <option value="status">Status</option>
        <option value="user">User</option>
        <option value="priority">Priority</option>
      </select>
      <label>Sort by: </label>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </select>
    </div>
  );
};

const KanbanBoard = ({ tickets, users, groupBy, sortBy }) => {

  // Group tickets based on the selected option (status, user, or priority)
  const groupedTickets = tickets.reduce((groups, ticket) => {
    let groupKey;
    if (groupBy === 'status') {
      groupKey = ticket.status;
    } else if (groupBy === 'user') {
      groupKey = users.find(user => user.id === ticket.userId)?.name || 'Unassigned';
    } else if (groupBy === 'priority') {
      groupKey = ticket.priority;
    }
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(ticket);
    return groups;
  }, {});

  // Sort tickets based on the selected sorting option (priority or title)
  const sortedTickets = (group) => {
    return group.sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority; // Descending order for priority
      } else {
        return a.title.localeCompare(b.title); // Ascending order for title
      }
    });
  };

  return (
    <div className="kanban-board">
      {Object.keys(groupedTickets).map(group => (
        <div key={group} className="kanban-column">
          <h2>{group}</h2>
          {sortedTickets(groupedTickets[group]).map(ticket => (
            <Ticket key={ticket.id} ticket={ticket} users={users} />
          ))}
        </div>
      ))}
    </div>
  );
};

const Ticket = ({ ticket, users }) => {
  const user = users.find(user => user.id === ticket.userId); 

  // Function to get color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 4: return '#e74c3c'; // Urgent - Red
      case 3: return '#e67e22'; // High - Orange
      case 2: return '#f1c40f'; // Medium - Yellow
      case 1: return '#2ecc71'; // Low - Green
      case 0: return '#bdc3c7'; // No priority - Gray
      default: return '#ecf0f1';
    }
  };

  return (
    <div className="ticket" style={{ borderLeft: `5px solid ${getPriorityColor(ticket.priority)}` }}>
      <div className="ticketImage">
        <p className="ticket-id">{ticket.id}</p> 
        <div className="ticket-user">
          <img 
            src={defaultAvatar} 
            alt={user?.name || 'User Avatar'} 
            className="user-avatar"
          />
        </div>
      </div>   

      {/* Checkbox for marking ticket as complete */}
      <div className="ticket-checkbox">
        <input type="checkbox" id={`check-${ticket.id}`} />
        {/* <label htmlFor={`check-${ticket.id}`}>Mark as complete</label> */}
        <h4>{ticket.title}</h4>
      </div>

      {/* Tag */}
      <div className="ticket-tag">
        {ticket.tag.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
};

export default App;


