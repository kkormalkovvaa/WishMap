import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createCategory, deleteCategory } from '../store/categoriesSlice';
import '../styles/AddCategoryModal.css';

const CATEGORY_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#f43f5e',
  '#6b7280',
];

const AddCategoryModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[7]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch(createCategory({ name: name.trim(), color }));
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
                <span
                  className="cat-dot"
                  style={{ backgroundColor: cat.color || '#9ca3af' }}
                />
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
          <div className="color-picker">
            {CATEGORY_COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`color-option ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                aria-label={`Выбрать цвет ${c}`}
              />
            ))}
          </div>
          <button type="submit" disabled={!name.trim()}>Добавить</button>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
