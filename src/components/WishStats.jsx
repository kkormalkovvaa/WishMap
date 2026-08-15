import { useSelector } from 'react-redux';
import { selectAllWishes } from '../store/wishesSlice';
import '../styles/WishStats.css';

const WishStats = () => {
  const wishes = useSelector(selectAllWishes);

  if (wishes.length === 0) return null;

  const completed = wishes.filter(w => w.status === 'completed').length;
  const notCompleted = wishes.length - completed;

  return (
    <div className="wish-stats">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{completed}</div>
          <div className="stat-label">Выполнено</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{notCompleted}</div>
          <div className="stat-label">Не выполнено</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💡</div>
          <div className="stat-value total-value">{wishes.length}</div>
          <div className="stat-label">Всего</div>
        </div>
      </div>
    </div>
  );
};

export default WishStats;
