import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearSelectedWish, updateWish, deleteWish } from '../store/wishesSlice';
import '../styles/WishModal.css';

const buildFormData = (wish) => ({
  title: wish.title,
  description: wish.description,
  categoryId: wish.categoryId,
  status: wish.status,
  deadline: wish.deadline || '',
});

const STATUS_SHADE = {
  active: '#888',
  in_progress: '#666',
  completed: '#333',
};

const WishModalContent = ({ wish: selectedWish }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => buildFormData(selectedWish));
  const [newImage, setNewImage] = useState(null);
  const [removeImageFlag, setRemoveImageFlag] = useState(false);
  const fileRef = useRef(null);

  const category = categories.find(cat => String(cat.id) === String(selectedWish.categoryId));

  const getStatusColor = (status) => {
    return STATUS_SHADE[status] || '#777';
  };

  const handleClose = () => {
    dispatch(clearSelectedWish());
  };

  const handleEdit = () => {
    setIsEditing(true);
    setNewImage(null);
    setRemoveImageFlag(false);
  };

  const handleCancelEdit = () => {
    setFormData(buildFormData(selectedWish));
    setNewImage(null);
    setRemoveImageFlag(false);
    if (fileRef.current) fileRef.current.value = '';
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImage(file);
    setRemoveImageFlag(false);
  };

  const removeCurrentImage = () => {
    setRemoveImageFlag(true);
    setNewImage(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeNewImage = () => {
    setNewImage(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (newImage) {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      if (formData.categoryId) fd.append('categoryId', formData.categoryId);
      fd.append('status', formData.status);
      if (formData.deadline) fd.append('deadline', formData.deadline);
      fd.append('image', newImage);
      dispatch(updateWish({ id: selectedWish.id, formData: fd }));
    } else if (removeImageFlag) {
      const patch = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId || null,
        status: formData.status,
        deadline: formData.deadline || null,
        removeImage: 'true',
      };
      dispatch(updateWish({ id: selectedWish.id, ...patch }));
    } else {
      const patch = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId || null,
        status: formData.status,
        deadline: formData.deadline || null,
      };
      dispatch(updateWish({ id: selectedWish.id, ...patch }));
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    dispatch(deleteWish(selectedWish.id));
    dispatch(clearSelectedWish());
  };

  const handleStatusChange = (newStatus) => {
    dispatch(updateWish({ id: selectedWish.id, status: newStatus }));
  };

  const currentImage = selectedWish.image && !removeImageFlag ? selectedWish.image : null;
  const previewUrl = newImage ? URL.createObjectURL(newImage) : null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="modal-title-input"
              placeholder="Название желания"
            />
          ) : (
            <h2>{selectedWish.title}</h2>
          )}
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label htmlFor="modal-desc">Описание</label>
                <textarea
                  id="modal-desc"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Подробно опишите своё желание..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-category">Категория</label>
                <select id="modal-category" name="categoryId" value={formData.categoryId} onChange={handleChange}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-status">Статус</label>
                  <select id="modal-status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Активно</option>
                    <option value="in_progress">В процессе</option>
                    <option value="completed">Выполнено</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="modal-deadline">Дедлайн</label>
                  <input type="date" id="modal-deadline" name="deadline" value={formData.deadline} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Изображение</label>
                {previewUrl ? (
                  <div className="image-preview">
                    <img src={previewUrl} alt="" />
                    <button type="button" className="image-remove" onClick={removeNewImage}>×</button>
                  </div>
                ) : currentImage ? (
                  <div className="image-preview">
                    <img src={currentImage} alt="" />
                    <button type="button" className="image-remove" onClick={removeCurrentImage}>×</button>
                  </div>
                ) : (
                  <label className="image-upload-btn">
                    <span>Выбрать файл</span>
                    <input type="file" ref={fileRef} accept="image/*" onChange={handleImageChange} hidden />
                  </label>
                )}
              </div>
            </div>
          ) : (
            <>
              {selectedWish.image && (
                <div className="modal-image">
                  <img src={selectedWish.image} alt="" />
                </div>
              )}

              <div className="wish-info">
                <div className="info-row">
                  <span className="info-label">Статус:</span>
                  <select
                    className="status-select"
                    value={selectedWish.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    style={{ backgroundColor: getStatusColor(selectedWish.status) }}
                  >
                    <option value="active">Активно</option>
                    <option value="in_progress">В процессе</option>
                    <option value="completed">Выполнено</option>
                  </select>
                </div>

                <div className="info-row">
                  <span className="info-label">Категория:</span>
                  <span className="info-value">
                    <span className="category-badge">{category?.name || 'Без категории'}</span>
                  </span>
                </div>

                {selectedWish.deadline && (
                  <div className="info-row">
                    <span className="info-label">Дедлайн:</span>
                    <span className="info-value">
                      {new Date(selectedWish.deadline).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}

                <div className="info-row">
                  <span className="info-label">Дата создания:</span>
                  <span className="info-value">
                    {new Date(selectedWish.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>

              <div className="description-section">
                <h3>Описание</h3>
                <p className="wish-description">{selectedWish.description}</p>
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          {isEditing ? (
            <>
              <button className="btn btn-danger" onClick={handleDelete}>Удалить</button>
              <button className="btn btn-secondary" onClick={handleCancelEdit}>Отмена</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!formData.title?.trim()}>Сохранить</button>
            </>
          ) : (
            <>
              <button className="btn btn-danger" onClick={handleDelete}>Удалить</button>
              <button className="btn btn-secondary" onClick={handleClose}>Закрыть</button>
              <button className="btn btn-primary" onClick={handleEdit}>Редактировать</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const WishModal = () => {
  const { selectedWish, wishes } = useSelector(state => state.wishes);
  const wish = selectedWish ? wishes.find(w => w.id === selectedWish.id) : null;

  if (!wish) return null;

  return <WishModalContent key={wish.id} wish={wish} />;
};

export default WishModal;
