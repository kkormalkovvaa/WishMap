import { useState, useRef } from 'react';
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setFormData(prev => ({
      ...prev,
      categoryId: prev.categoryId || categories[0]?.id || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      if (imageFile) {
        const fd = new FormData();
        fd.append('title', formData.title);
        fd.append('description', formData.description);
        if (formData.categoryId) fd.append('categoryId', formData.categoryId);
        if (formData.deadline) fd.append('deadline', formData.deadline);
        fd.append('image', imageFile);
        await dispatch(createWish(fd)).unwrap();
      } else {
        await dispatch(createWish({
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId || null,
          deadline: formData.deadline || null,
        })).unwrap();
      }

      setFormData({ title: '', description: '', categoryId: '', deadline: '' });
      setImageFile(null);
      setImagePreview(null);
      if (fileRef.current) fileRef.current.value = '';
      setIsOpen(false);
    } catch (err) {
      console.error('Create wish error:', err);
      setSubmitError(typeof err === 'string' ? err : 'Ошибка при создании желания');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="create-wish-form">
      <button className="btn-open-form" onClick={handleOpen}>
        <span>+</span> Добавить желание
      </button>

      {isOpen && (
        <div className="wish-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="wish-modal" onClick={(e) => e.stopPropagation()}>
            <form className="wish-form" onSubmit={handleSubmit}>
              <div className="form-header">
                <h3>Новое желание</h3>
                <button type="button" className="btn-close" onClick={() => setIsOpen(false)}>×</button>
              </div>

              <div className="form-group">
                <label htmlFor="title">Название желания *</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Чего вы хотите?" required />
              </div>

              <div className="form-group">
                <label htmlFor="description">Описание</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Подробно опишите своё желание..." rows="3" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoryId">Категория</label>
                  <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange}>
                    <option value="">Выберите категорию</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="deadline">Дедлайн</label>
                  <input type="date" id="deadline" name="deadline" value={formData.deadline} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Изображение</label>
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="" />
                    <button type="button" className="image-remove" onClick={removeImage}>×</button>
                  </div>
                ) : (
                  <label className="image-upload-btn">
                    <span>Выбрать файл</span>
                    <input type="file" ref={fileRef} accept="image/*" onChange={handleImageChange} hidden />
                  </label>
                )}
              </div>

              {submitError && <div className="form-error">{submitError}</div>}

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsOpen(false)}>Отмена</button>
                <button type="submit" className="btn-submit" disabled={!formData.title.trim() || submitting}>
                  {submitting ? 'Создание...' : 'Создать желание'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWishForm;
