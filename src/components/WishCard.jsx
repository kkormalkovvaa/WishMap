import { useSelector } from 'react-redux';
import '../styles/WishCard.css';

const STATUS_SHADE = {
  active: '#888',
  in_progress: '#666',
  completed: '#333',
};

const WishCard = ({ wish, onClick }) => {
  const { categories } = useSelector(state => state.categories);
  const category = categories.find(cat => String(cat.id) === String(wish.categoryId));

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Активно';
      case 'in_progress':
        return 'В процессе';
      case 'completed':
        return 'Выполнено';
      default:
        return '';
    }
  };

  return (
    <div className="wish-card" onClick={onClick}>
      {wish.image && (
        <div className="wish-card-image">
          <img src={wish.image} alt="" />
        </div>
      )}
      <div className="wish-card-header">
        <div className="category-badge">
          {category?.name || 'Без категории'}
        </div>
        {getStatusLabel(wish.status) && (
          <div
            className="status-badge"
            style={{ backgroundColor: STATUS_SHADE[wish.status] || '#999' }}
          >
            {getStatusLabel(wish.status)}
          </div>
        )}
      </div>

      <h3 className="wish-title">{wish.title}</h3>
      <p className="wish-description">{wish.description}</p>

      <div className="wish-card-footer">
        <div className="wish-date">
          {new Date(wish.createdAt).toLocaleDateString('ru-RU')}
        </div>
      </div>
    </div>
  );
};

export default WishCard;