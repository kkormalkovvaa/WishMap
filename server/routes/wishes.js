import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import Wish from '../models/Wish.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/wishes:
 *   get:
 *     tags: [Wishes]
 *     summary: Получить все желания пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список желаний
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Wish'
 *   post:
 *     tags: [Wishes]
 *     summary: Создать желание
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WishInput'
 *     responses:
 *       201:
 *         description: Желание создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wish'
 *       400:
 *         description: Ошибка валидации
 */
router.get('/', async (req, res) => {
  try {
    const wishes = await Wish.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(wishes.map(w => w.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, categoryId, priority, status, deadline, progress } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Название обязательно' });
    }

    const wish = await Wish.create({
      userId: req.user.id,
      title: title.trim(),
      description: description || '',
      categoryId: categoryId ?? null,
      priority: priority ?? 3,
      status: status || 'active',
      deadline: deadline || null,
      progress: progress ?? 0,
    });

    res.status(201).json(wish.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/wishes/{id}:
 *   put:
 *     tags: [Wishes]
 *     summary: Обновить желание
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
 *             $ref: '#/components/schemas/WishInput'
 *     responses:
 *       200:
 *         description: Желание обновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wish'
 *       404:
 *         description: Не найдено
 *   delete:
 *     tags: [Wishes]
 *     summary: Удалить желание
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
 *         description: Желание удалено
 *       404:
 *         description: Не найдено
 */
router.put('/:id', async (req, res) => {
  try {
    const wish = await Wish.findOne({ _id: req.params.id, userId: req.user.id });
    if (!wish) return res.status(404).json({ error: 'Желание не найдено' });

    const { title, description, categoryId, priority, status, deadline, progress } = req.body;
    if (title !== undefined) wish.title = title.trim();
    if (description !== undefined) wish.description = description;
    if (categoryId !== undefined) wish.categoryId = categoryId;
    if (priority !== undefined) wish.priority = priority;
    if (status !== undefined) wish.status = status;
    if (deadline !== undefined) wish.deadline = deadline || null;
    if (progress !== undefined) wish.progress = progress;

    await wish.save();
    res.json(wish.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Wish.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Желание не найдено' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
