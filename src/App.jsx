import { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import { fetchWishes } from './store/wishesSlice';
import { fetchCategories } from './store/categoriesSlice';
import { loginSuccess } from './store/authSlice';
import { setToken, getCurrentUser } from './utils/api';
import Header from './components/Header';
import WelcomePage from './components/WelcomePage';
import WishList from './components/WishList';
import WishModal from './components/WishModal';
import './styles/App.css';

/** Restores auth state from localStorage token and verifies it with the server. */
function AuthRestorer() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) return; // Already logged in via preloadState
    const token = localStorage.getItem('wishmap_token');
    if (!token) return;

    getCurrentUser()
      .then((user) => {
        dispatch(loginSuccess({ id: user.id, name: user.name, email: user.email }));
      })
      .catch(() => {
        // Token expired or invalid — clear it
        setToken(null);
      });
  }, [isAuthenticated, dispatch]);

  return null;
}

/** Syncs auth state with wish data: loads wishes and categories on login, clears on logout. */
function AuthSync() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const wishesLoaded = useSelector((s) => s.wishes._loaded);
  const categoriesLoaded = useSelector((s) => s.categories.categories.length > 0);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && !wishesLoaded) {
      dispatch(fetchWishes());
    }
    if (isAuthenticated && !categoriesLoaded) {
      dispatch(fetchCategories());
    }
  }, [isAuthenticated, wishesLoaded, categoriesLoaded, dispatch]);

  return null;
}

function AppContent() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  return (
    <>
      <AuthRestorer />
      <AuthSync />
      <div className="app">
        <Header />
        <main className="main-content">
          {!isAuthenticated ? (
            <WelcomePage />
          ) : (
            <WishList />
          )}
        </main>
        <WishModal />
      </div>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
