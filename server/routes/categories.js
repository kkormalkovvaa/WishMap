import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import Category from '../models/Category.js';

const router = Router();
router.use(authenticate);

const DEFAULT_CATEGORIES = [
  { name: 'Путешествия', color: '#FF6B6B' },
  { name: 'Здоровье', color: '#4ECDC4' },
  { name: 'Материальное', color: '#45B7D1' },
  { name: 'Личностный рост', color: '#96CEB4' },
  { name: 'Карьера', color: '#FFEAA7' },
  { name: 'Отношения', color: '#DDA0DD' },
  { name: 'Хобби', color: '#98D8C8' },
  { name: 'Другое', color: '#F7DC6F' },
];

async function seedDefaults(userId) {
  const count = await Category.countDocuments({ userId });
  if (count > 0) return;
  await Category.insertMany(DEFAULT_CATEGORIES.map(c => ({ ...c, userId })));
}

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Получить все категории пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список категорий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     tags: [Categories]
 *     summary: Создать категорию
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Категория создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */
router.get('/', async (req, res) => {
  try {
    await seedDefaults(req.user.id);
    const categories = await Category.find({ userId: req.user.id }).sort({ createdAt: 1 });
    res.json(categories.map(c => c.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Название обязательно' });
    }
    const category = await Category.create({
      userId: req.user.id,
      name: name.trim(),
      color: color || '#9E9E9E',
    });
    res.status(201).json(category.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Обновить категорию
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       200:
 *         description: Категория обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Не найдено
 *   delete:
 *     tags: [Categories]
 *     summary: Удалить категорию
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Категория удалена
 *       404:
 *         description: Не найдено
 */
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user.id });
    if (!category) return res.status(404).json({ error: 'Категория не найдена' });

    const { name, color } = req.body;
    if (name !== undefined) category.name = name.trim();
    if (color !== undefined) category.color = color;

    await category.save();
    res.json(category.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Category.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
