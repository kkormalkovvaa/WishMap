import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginStart, loginSuccess, loginFailure,
  registerStart, registerSuccess, registerFailure,
} from '../store/authSlice';
import { setToken } from '../utils/api';
import {
  registerUser, loginUser,
  validateRegistration, validateLogin,
} from '../utils/authService';
import '../styles/AuthModal.css';

const AuthForm = ({ initialTab, onClose }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const [tab, setTab] = useState(initialTab || 'login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const switchTab = (newTab) => {
    setTab(newTab);
    setFieldErrors({});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = validateLogin(loginForm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    dispatch(loginStart());
    try {
      const user = await loginUser(loginForm);
      if (user.token) setToken(user.token);
      dispatch(loginSuccess(user));
      onClose();
    } catch (err) {
      dispatch(loginFailure(err.message));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validateRegistration(registerForm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    dispatch(registerStart());
    try {
      const user = await registerUser(registerForm);
      if (user.token) setToken(user.token);
      dispatch(registerSuccess(user));
      onClose();
    } catch (err) {
      dispatch(registerFailure(err.message));
    }
  };

  return (
    <>
      <div className="auth-tabs">
        <button
          className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
          onClick={() => switchTab('login')}
        >
          Вход
        </button>
        <button
          className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
          onClick={() => switchTab('register')}
        >
          Регистрация
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {tab === 'login' ? (
        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm(f => ({ ...f, email: e.target.value }))}
              placeholder="your@email.com"
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Пароль</label>
            <input
              id="login-password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Введите пароль"
              className={fieldErrors.password ? 'input-error' : ''}
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleRegister} noValidate>
          <div className="form-group">
            <label htmlFor="reg-name">Имя</label>
            <input
              id="reg-name"
              type="text"
              value={registerForm.name}
              onChange={(e) => setRegisterForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ваше имя"
              className={fieldErrors.name ? 'input-error' : ''}
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm(f => ({ ...f, email: e.target.value }))}
              placeholder="your@email.com"
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Пароль</label>
            <input
              id="reg-password"
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Минимум 6 символов"
              className={fieldErrors.password ? 'input-error' : ''}
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Подтвердите пароль</label>
            <input
              id="reg-confirm"
              type="password"
              value={registerForm.confirmPassword}
              onChange={(e) => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Повторите пароль"
              className={fieldErrors.confirmPassword ? 'input-error' : ''}
            />
            {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
      )}
    </>
  );
};

const AuthModal = ({ isOpen, initialTab, onClose }) => {
  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleEsc]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}>✕</button>
        <AuthForm initialTab={initialTab} onClose={onClose} />
      </div>
    </div>
  );
};

export default AuthModal;
