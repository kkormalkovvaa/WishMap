import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createWish } from '../store/wishesSlice';
import '../styles/CreateWishForm.css';

const CreateWishForm = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    deadline: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      categoryId: formData.categoryId || null,
      deadline: formData.deadline || null,
    };

    dispatch(createWish(payload));

    // Сброс формы
    setFormData({
      title: '',
      description: '',
      categoryId: '',
      deadline: '',
    });
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="create-wish-form">
      {!isOpen ? (
        <button 
          className="btn-open-form"
          onClick={() => setIsOpen(true)}
        >
          <span>+</span> Добавить желание
        </button>
      ) : (
        <form className="wish-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h3>Новое желание</h3>
            <button 
              type="button"
              className="btn-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="title">Название желания *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Чего вы хотите достичь?"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Подробно опишите своё желание..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Категория</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
            >
              <option value="">Выберите категорию</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Дедлайн (опционально)</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button"
              className="btn-cancel"
              onClick={() => setIsOpen(false)}
            >
              Отмена
            </button>
            <button 
              type="submit"
              className="btn-submit"
              disabled={!formData.title.trim()}
            >
              Создать желание
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateWishForm;