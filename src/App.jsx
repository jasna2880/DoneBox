import { useState, useEffect } from 'react'
import { FaCog, FaTrash, FaCalendarAlt, FaSearch, FaEdit, FaUserEdit, FaCamera } from 'react-icons/fa';
import { LuInbox } from 'react-icons/lu';
import './App.css'
import confetti from 'canvas-confetti';

function App() {
  // --- STATES ---
  

  
  const [noteTitle, setNoteTitle] = useState(""); // നോട്ടിന്റെ ടൈറ്റിലിന് വേണ്ടി
  
const [inboxNotes, setInboxNotes] = useState(() => {
    const savedInbox = localStorage.getItem("taskify-inbox");
    return savedInbox ? JSON.parse(savedInbox) : [];
  });
const [newNote, setNewNote] = useState(""); 
const [showInboxInput, setShowInboxInput] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
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
  useEffect(() => {
  localStorage.setItem("taskify-inbox", JSON.stringify(inboxNotes));
}, [inboxNotes]);

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
          if (!item.completed) fireConfetti();
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
  // ഇൻബോക്സിൽ നോട്ട്/ടാസ്ക് ആഡ് ചെയ്യാനുള്ള ഫങ്ക്ഷൻ
const handleInboxAdd = () => {
  if (newNote.trim() === "") return;
  const newItem = {
    id: Date.now(),
    // നോട്ട് ആണെങ്കിൽ മാത്രം ടൈറ്റിൽ സേവ് ചെയ്യുന്നു
    title: category === "Note" ? noteTitle : "", 
    text: newNote,
    type: category, // "Note" അല്ലെങ്കിൽ "Task"
    completed: false, // ടാസ്ക് ടിക് ചെയ്യാൻ
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  setInboxNotes([newItem, ...inboxNotes]);
  setNewNote("");
  setNoteTitle(""); // സേവ് ചെയ്ത ശേഷം ടൈറ്റിൽ ക്ലിയർ ആക്കുന്നു
  setShowInboxInput(false);
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
          <div className="logo-section"><div className="logo-dot"></div><h1>DoneBox</h1></div>
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
      {/* --- LEFT SIDEBAR --- */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"></div>
          <h2>DoneBox</h2>
          
        </div>
        <nav className="nav-list">
          <div className="nav-group">
            {/* Dashboard Button */}
<div 
  className={`nav-item ${activeTab === "Dashboard" ? "active" : ""}`} 
  onClick={() => setActiveTab("Dashboard")}
>
  🏠 Dashboard
</div>
            <div className="nav-item active"><FaCalendarAlt /> Today</div>
<div 
  className={`nav-item ${activeTab === "Inbox" ? "active" : ""}`} 
  onClick={() => setActiveTab("Inbox")}
>
  <LuInbox /> Inbox
</div>
          </div>
          <div className="nav-section-title">Categories</div>
          <div className="nav-group">
            <div className="nav-item">💼 Work</div>
            <div className="nav-item">🏠 Personal</div>
            <div className="nav-item">📦 Shopping</div>
            <div className="nav-item">📚 Learning</div>
            <div className="nav-item">🦄 Wish List</div>
            <div className="nav-item">🏃 Fitness</div>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="nav-item add-btn"><span className="plus-icon">+</span> Add List</div>
          <div className="nav-item settings-btn" onClick={() => setShowProfile(true)}><FaCog /> Settings</div>
          <div className="nav-item logout-btn" onClick={handleLogout}>Logout</div>
        </div>
      </aside>

{/* --- MAIN CONTENT --- */}
<main className="main-content">
  
  {/* DASHBOARD ടാബ് ആക്ടീവ് ആണെങ്കിൽ മാത്രം ഇത് കാണിക്കും */}
  {activeTab === "Dashboard" && (
    <div className="dashboard-content-wrapper">
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
        <div className="notif-box"><LuInbox /></div>
      </header>

      <div className="hero-card">
        <div className="hero-text">
          <h2>Today Task</h2>
          <div className="progress-container">
            <div className="progress-bar-main"><div className="progress-fill" style={{ width: `${percentage}%` }}></div></div>
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
            <div className="task-date-info">
              <FaCalendarAlt size={12} /> <span>{item.date}</span>
            </div>
            <button className="done-btn" onClick={() => handleToggleDone(item.id)}>
              {item.completed ? "Undo" : "Mark Done"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* INBOX ടാബ് ആക്ടീവ് ആണെങ്കിൽ മാത്രം ഇത് കാണിക്കും */}
{activeTab === "Inbox" && (
  <div className="inbox-page-container">
    <div className="white-card-inbox">
      
      {/* 1. ഹെഡർ എപ്പോഴും കാണണം */}
      <div className="inbox-header">
        <h2>📬 Inbox</h2>
        <p>Quickly add your thoughts or tasks</p>
      </div>

      {/* 2. ഇൻപുട്ട് ബോക്സ് - പ്ലസ് അമർത്തുമ്പോൾ മാത്രം വരുന്നത് */}
   {showInboxInput && (
  <div className="inbox-input-wrapper">
    <div className="type-selector">
      <button className={category === "Note" ? "active" : ""} onClick={() => setCategory("Note")}>📝 Note</button>
      <button className={category === "Task" ? "active" : ""} onClick={() => setCategory("Task")}>✅ Task</button>
    </div>
    
    <div className="inbox-input-field" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* നോട്ട് ആണെങ്കിൽ മാത്രം ടൈറ്റിൽ ബോക്സ് കാണിക്കും */}
      {category === "Note" && (
        <input 
          type="text" 
          placeholder="Note Title..." 
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="note-title-input"
        />
      )}
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder={category === "Note" ? "Note description..." : "Task name..."} 
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInboxAdd()}
        />
        <button onClick={handleInboxAdd}>Add</button>
      </div>
    </div>
  </div>
)}

      {/* 3. ലിസ്റ്റ് - നോട്ടുകൾ ഉണ്ടെങ്കിൽ അത്, ഇല്ലെങ്കിൽ എംപ്റ്റി സ്റ്റേറ്റ് */}
      <div className="inbox-list-container">
        {inboxNotes.length > 0 ? (
          inboxNotes.map(item => (
            <div key={item.id} className={`inbox-item-card ${item.type.toLowerCase()}`}>
              {item.type === "Task" && (
          <input 
            type="checkbox" 
            className="task-checkbox" 
            checked={item.completed}
            onChange={() => {
              setInboxNotes(inboxNotes.map(n => n.id === item.id ? {...n, completed: !n.completed} : n))
            }} 
          />
        )}
              <div className="item-content">
                <span className="type-tag">{item.type}</span>
                {item.type === "Note" && item.title && (
            <h4 className="note-display-title">{item.title}</h4>
          )}
          
          <p className={item.completed ? "strikethrough" : ""}>{item.text}</p>
          <small className="item-time">{item.time}</small>


                
              </div>
              <button className="del-btn" onClick={() => setInboxNotes(inboxNotes.filter(n => n.id !== item.id))}>×</button>
            </div>
          ))
        ) : (
          !showInboxInput && (
            <div className="inbox-empty-state">
              <img src="https://illustrations.popsy.co/purple/creative-work.svg" alt="empty" style={{width: '180px'}} />
              <h3>Inbox is empty!</h3>
              <p>Click the + button to start.</p>
            </div>
          )
        )}
      </div>

      {/* 4. ഫ്ലോട്ടിങ് പ്ലസ് ബട്ടൺ */}
      <button className="floating-plus-btn" onClick={() => setShowInboxInput(!showInboxInput)}>
        {showInboxInput ? "×" : "+"}
      </button>

    </div>
  </div>
)}
</main>

      {/* --- RIGHT SIDEBAR --- */}
     <aside className="right-sidebar">
  {/* 1. പ്രൊഫൈൽ സെക്ഷൻ */}
  <div className="profile-container-premium">
    <div className="avatar-frame" style={{ marginBottom: '15px' }}>
      <img src={profilePic} alt="User" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
    </div>
    <div className="user-meta">
      <h3 style={{ fontSize: '18px', margin: '5px 0' }}>{userName}</h3>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '15px' }}>{jobRole}</p>
    </div>
    <button className="profile-action-btn" onClick={() => setShowProfile(true)} style={{ width: '100%', padding: '10px', borderRadius: '12px', border: 'none', background: '#7c7cf8', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
      Profile
    </button>
  </div>

  {/* 2. കലണ്ടർ സെക്ഷൻ */}
 <div className="calendar-card-premium">
    <div className="calendar-header">
      <button className="cal-nav-btn">&lt;</button>
      <h4>February 2026</h4>
      <button className="cal-nav-btn">&gt;</button>
    </div>
    <div className="calendar-days-grid">
      {/* ആഴ്ചയിലെ ദിവസങ്ങൾ */}
      <span style={{ fontWeight: 'bold', color: '#6c5ce7' }}>M</span>
      <span style={{ fontWeight: 'bold', color: '#6c5ce7' }}>T</span>
      <span style={{ fontWeight: 'bold', color: '#6c5ce7' }}>W</span>
      <span style={{ fontWeight: 'bold', color: '#6c5ce7' }}>T</span>
      <span style={{ fontWeight: 'bold', color: '#6c5ce7' }}>F</span>
      <span style={{ fontWeight: 'bold', color: '#6c5ce7' }}>S</span>
      <span style={{ fontWeight: 'bold', color: '#6c5ce7' }}>S</span>
      
      {/* തീയതികൾ - ഫെബ്രുവരി 2026 പ്രകാരം */}
      <span className="fade-day">26</span><span className="fade-day">27</span><span className="fade-day">28</span><span className="fade-day">29</span><span className="fade-day">30</span><span className="fade-day">31</span><span>1</span>
      <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span>
      <span className="today-circle">9</span><span>10</span><span className="active-dot">11</span><span>12</span><span>13</span><span>14</span><span>15</span>
      <span>16</span><span>17</span><span>18</span><span>19</span><span className="active-dot">20</span><span>21</span><span>22</span>
      <span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span className="fade-day">1</span>
    </div>
  </div>

  {/* 3. റിമൈൻഡർ സെക്ഷൻ (ഇത് ശ്രദ്ധിച്ചു കോപ്പി ചെയ്യുക) */}
  <div className="reminders-section">
    <h5>Reminders</h5>
    
    <div className="reminder-item">
      <div className="bell-icon">🔔</div>
      <div className="rem-text">
        <h6>Eng - Vocabulary test</h6>
        <p>12 Dec 2022, Friday</p>
      </div>
    </div>

    <div className="reminder-item">
      <div className="bell-icon">🔔</div>
      <div className="rem-text">
        <h6>Eng - Essay writing</h6>
        <p>13 Dec 2022, Saturday</p>
      </div>
    </div>

    <div className="reminder-item">
      <div className="bell-icon">🔔</div>
      <div className="rem-text">
        <h6>Math - Quiz setup</h6>
        <p>14 Dec 2022, Sunday</p>
      </div>
    </div>
  </div>
</aside>
      {/* --- PROFILE MODAL --- */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => { setShowProfile(false); setIsEditingProfile(false); }}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => { setShowProfile(false); setIsEditingProfile(false); }}>&times;</button>
            <div className="modal-header">
              <div className="profile-img-container" style={{ position: 'relative', display: 'inline-block' }}>
                <img src={profilePic} alt="user" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
                {isEditingProfile && <div className="camera-overlay"><FaCamera /></div>}
              </div>
              {isEditingProfile ? (
                <div className="edit-fields" style={{ marginTop: '20px' }}>
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
  );
}

export default App;