import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createCategory, deleteCategory } from '../store/categoriesSlice';
import '../styles/AddCategoryModal.css';

const AddCategoryModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch(createCategory({ name: name.trim() }));
    setName('');
  };

  const handleDelete = (id) => {
    dispatch(deleteCategory(id));
  };

  return (
    <div className="add-cat-overlay" onClick={onClose}>
      <div className="add-cat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-cat-header">
          <h3>Категории</h3>
          <button className="add-cat-close" onClick={onClose}>×</button>
        </div>

        {categories.length > 0 && (
          <ul className="add-cat-list">
            {categories.map(cat => (
              <li key={cat.id}>
                <span>{cat.name}</span>
                <button onClick={() => handleDelete(cat.id)} title="Удалить">×</button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="add-cat-form">
          <input
            type="text"
            placeholder="Новая категория"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={!name.trim()}>Добавить</button>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
