import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectWish } from '../store/wishesSlice';
import WishCard from './WishCard';
import CreateWishForm from './CreateWishForm';
import WishStats from './WishStats';
import AddCategoryModal from './AddCategoryModal';
import '../styles/WishList.css';

const WishList = () => {
  const dispatch = useDispatch();
  const { wishes } = useSelector(state => state.wishes);
  const { categories } = useSelector(state => state.categories);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const filteredWishes = wishes.filter(wish => {
    const matchesCategory = selectedCategory === 'all' || String(wish.categoryId) === String(selectedCategory);
    const matchesSearch = wish.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (wish.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleWishClick = (wish) => {
    dispatch(selectWish(wish));
  };

  return (
    <div className="wish-list-container">
      <div className="wish-list-header">
        <h2>Мои желания</h2>
        <div className="controls">
          <input
            type="text"
            placeholder="Поиск желаний..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">Все категории</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            className="btn-add-category"
            onClick={() => setShowAddCategory(true)}
            title="Добавить категорию"
          >
            +
          </button>
        </div>
      </div>

      <CreateWishForm />

      <WishStats />

      <div className="wishes-grid">
        {filteredWishes.length > 0 ? (
          filteredWishes.map(wish => (
            <WishCard
              key={wish.id}
              wish={wish}
              onClick={() => handleWishClick(wish)}
            />
          ))
        ) : (
          <div className="empty-state">
            <p>У вас пока нет желаний. Создайте первое!</p>
          </div>
        )}
      </div>

      {showAddCategory && (
        <AddCategoryModal onClose={() => setShowAddCategory(false)} />
      )}
    </div>
  );
};

export default WishList;