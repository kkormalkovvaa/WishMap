import { useState } from 'react';
import AuthModal from './AuthModal';
import '../styles/WelcomePage.css';

const WelcomePage = () => {
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });

  const openModal = (tab) => {
    setAuthModal({ open: true, tab });
  };

  const closeModal = () => {
    setAuthModal({ open: false, tab: 'login' });
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Карта желаний</h1>
        <p className="welcome-subtitle">
          Записывайте свои желания, создавайте категории и следите за их исполнением
        </p>

        <div className="auth-buttons">
          <button className="btn btn-primary" onClick={() => openModal('login')}>
            Войти
          </button>
          <button className="btn btn-outline" onClick={() => openModal('register')}>
            Зарегистрироваться
          </button>
        </div>

        <div className="welcome-footer">
          <p>Начните свой путь к исполнению желаний прямо сейчас</p>
        </div>
      </div>

      <AuthModal
        isOpen={authModal.open}
        initialTab={authModal.tab}
        onClose={closeModal}
      />
    </div>
  );
};

export default WelcomePage;