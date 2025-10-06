import { useAuth } from '../../context/AuthContext'
import NotificationSystem from '../common/NotificationSystem'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>SkoolMate</h2>
      </div>
      <div className="navbar-user">
        <NotificationSystem />
        <span>Welcome, {user?.username}</span>
        <button onClick={logout} className="btn btn-outline">
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar