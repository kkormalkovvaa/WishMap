import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import '../styles/Header.css';

const Header = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="logo">🎯 Карта желаний</h1>
      </div>
      
      <div className="header-right">
        {isAuthenticated ? (
          <>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Пользователь'}</span>
              <div className="user-avatar">
                {user?.name?.charAt(0) || 'П'}
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Выйти
            </button>
          </>
        ) : (
          <div className="auth-info">
            <span>Добро пожаловать!</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;