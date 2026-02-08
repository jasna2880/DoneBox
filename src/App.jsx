import { useState, useEffect } from 'react'
import { FaThLarge, FaTasks, FaFolderOpen, FaChartBar, FaCog, FaBell, FaTrash, FaCalendarAlt, FaSearch, FaEdit, FaUserEdit, FaCamera } from 'react-icons/fa'
import './App.css'
import confetti from 'canvas-confetti';

function App() {
  // --- STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("taskify-isLoggedIn") === "true");
  const [userName, setUserName] = useState(() => localStorage.getItem("taskify-user") || "");
  const [jobRole, setJobRole] = useState(() => localStorage.getItem("taskify-job") || "UI/UX Designer");
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem("taskify-pic") || "https://i.pravatar.cc/150?u=kj");

  const [password, setPassword] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempJob, setTempJob] = useState(jobRole);

  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Work");
  const [dueDate, setDueDate] = useState("");
  const [editId, setEditId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [todoList, setTodoList] = useState(() => {
    const saved = localStorage.getItem("taskify-data");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("taskify-data", JSON.stringify(todoList));
  }, [todoList]);

  // --- CONFETTI LOGIC ---
  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6c5ce7', '#a29bfe', '#ffffff']
    });
  };

  const handleToggleDone = (id) => {
    setTodoList(prevList => 
      prevList.map(item => {
        if (item.id === id) {
          // ടാസ്ക് കംപ്ലീറ്റ് ചെയ്യുമ്പോൾ (Undo അല്ലെങ്കില്‍) മാത്രം കോൺഫെറ്റി
          if (!item.completed) {
            fireConfetti();
          }
          return { ...item, completed: !item.completed };
        }
        return item;
      })
    );
  };

  // --- LOGIN & LOGOUT ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (userName.trim() !== "") {
      setIsLoggedIn(true);
      localStorage.setItem("taskify-isLoggedIn", "true");
      localStorage.setItem("taskify-user", userName);
      localStorage.setItem("taskify-job", jobRole);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
    window.location.reload();
  };

  const saveProfile = () => {
    setUserName(tempName);
    setJobRole(tempJob);
    localStorage.setItem("taskify-user", tempName);
    localStorage.setItem("taskify-job", tempJob);
    setIsEditingProfile(false);
  };

  const handleTaskAction = () => {
    if (task.trim() === "") return;
    if (editId) {
      setTodoList(todoList.map(item => item.id === editId ? { ...item, text: task, priority, category, date: dueDate || "No Date" } : item));
      setEditId(null);
    } else {
      const newTask = { id: Date.now(), text: task, completed: false, priority, category, date: dueDate || "No Date" };
      setTodoList([...todoList, newTask]);
    }
    setTask(""); setDueDate("");
  };

  const startEdit = (item) => {
    setEditId(item.id); setTask(item.text); setPriority(item.priority); setCategory(item.category);
    setDueDate(item.date === "No Date" ? "" : item.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredTasks = todoList.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || (filterStatus === "Completed" && item.completed) || (filterStatus === "Active" && !item.completed) || (filterStatus === item.priority);
    return matchesSearch && matchesFilter;
  });

  const total = todoList.length;
  const completedCount = todoList.filter(t => t.completed).length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="logo-section"><div className="logo-dot"></div><h1>Taskify</h1></div>
          <h2>Welcome Back!</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Username" value={userName} onChange={(e) => setUserName(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="login-submit-btn">Continue</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"></div>
          <h2>Taskify</h2>
        </div>
        <nav className="nav-list">
          <div className="nav-group">
            <div className="nav-item active"><FaCalendarAlt /> Today</div>
            <div className="nav-item"><FaBell /> Inbox</div>
          </div>
          <div className="nav-section-title">Categories</div>
          <div className="nav-group">
            <div className="nav-item">💼 Work</div>
            <div className="nav-item">🏠 Personal</div>
            <div className="nav-item">📦 Shopping</div>
            <div className="nav-item">📚 Learning</div>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout} style={{color: '#ff4d4d'}}>Logout</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <div className="user-welcome">
              <h3>Hi, {userName}</h3>
              <p>Let's finish your task today!</p>
            </div>
            <div className="header-search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="notif-box"><FaBell /></div>
        </header>

        <div className="hero-card">
          <div className="hero-text">
            <h2>Today Task</h2>
            <div className="progress-container">
               <div className="progress-bar-main"><div className="progress-fill" style={{width: `${percentage}%`}}></div></div>
               <span>{percentage}% Done</span>
            </div>
            <button className="schedule-btn">Today's schedule</button>
          </div>
          <div className="hero-img"><img src="https://illustrations.popsy.co/purple/creative-work.svg" alt="task" /></div>
        </div>
        
        

        <div className="filter-container">
          <div className="filter-chips">
            {["All", "Active", "Completed", "High"].map(status => (
              <button key={status} className={`chip ${filterStatus === status ? 'active' : ''}`} onClick={() => setFilterStatus(status)}>{status}</button>
            ))}
          </div>
          <button onClick={() => setTodoList([])} className="clear-all-btn">Clear All</button>
        </div>

        <div className="advanced-input-box">
          <input type="text" placeholder={editId ? "Update task..." : "What needs to be done?"} value={task} onChange={(e) => setTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleTaskAction()} />
          <div className="input-options">
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Work">💼 Work</option>
              <option value="Personal">🏠 Personal</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <button onClick={handleTaskAction} className="add-main-btn">{editId ? "Update" : "Add Task"}</button>
          </div>
        </div>

        <div className="task-grid">
          {filteredTasks.map((item) => (
            <div key={item.id} className={`task-card-mini ${item.completed ? 'is-done' : ''} priority-${item.priority}`}>
              <div className="card-top">
                <span className="category-tag">{item.category}</span>
                <div className="card-actions">
                  <FaEdit className="edit-icon" onClick={() => startEdit(item)} />
                  <FaTrash className="trash-icon" onClick={() => setTodoList(todoList.filter(t => t.id !== item.id))} />
                </div>
              </div>
              <h4 style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>{item.text}</h4>
              <button className="done-btn" onClick={() => handleToggleDone(item.id)}>
                {item.completed ? "Undo" : "Mark Done"}
              </button>
            </div>
          ))}
        </div>
      </main>

      <aside className="right-sidebar">
        <div className="profile-card" onClick={() => { setShowProfile(true); setTempName(userName); setTempJob(jobRole); }} style={{cursor: 'pointer'}}>
           <img src={profilePic} alt="profile" />
           <div className="profile-info"><h4>{userName}</h4><p>{jobRole}</p></div>
        </div>
      </aside>

      {showProfile && (
        <div className="modal-overlay" onClick={() => { setShowProfile(false); setIsEditingProfile(false); }}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => { setShowProfile(false); setIsEditingProfile(false); }}>&times;</button>
            <div className="modal-header">
              <div className="profile-img-container" style={{position: 'relative', display: 'inline-block'}}>
                <img src={profilePic} alt="user" style={{width: '100px', height: '100px', borderRadius: '50%'}} />
                {isEditingProfile && <div className="camera-overlay"><FaCamera /></div>}
              </div>
              {isEditingProfile ? (
                <div className="edit-fields" style={{marginTop: '20px'}}>
                  <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Name" className="edit-input" />
                  <input type="text" value={tempJob} onChange={(e) => setTempJob(e.target.value)} placeholder="Job Role" className="edit-input" />
                  <button className="save-profile-btn" onClick={saveProfile}>Save Changes</button>
                </div>
              ) : (
                <>
                  <h2>{userName}</h2>
                  <p>{jobRole}</p>
                  <button className="edit-profile-trigger" onClick={() => setIsEditingProfile(true)}>
                    <FaUserEdit /> Edit Profile
                  </button>
                </>
              )}
            </div>
            <div className="modal-body">
              <div className="detail-item"><strong>Tasks:</strong> {total} Total | {completedCount} Done</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App