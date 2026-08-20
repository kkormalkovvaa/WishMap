import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Types } from "mongoose";
import { authenticate } from "../middleware/auth.js";
import Wish from "../models/Wish.js";

const ObjectIdRegex = /^[0-9a-fA-F]{24}$/;

function cleanCategoryId(val) {
  if (!val || !ObjectIdRegex.test(val)) return null;
  return val;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else
      cb(
        new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname),
        false,
      );
  },
});

// Wrapper to catch multer errors and return JSON instead of crashing
function handleUpload(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const messages = {
          LIMIT_FILE_SIZE: "Файл слишком большой (макс. 5 МБ)",
          LIMIT_UNEXPECTED_FILE: "Только изображения",
          LIMIT_FILE_COUNT: "Слишком много файлов",
        };
        return res
          .status(400)
          .json({ error: messages[err.code] || err.message });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

const router = Router();

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название желания (обязательно)
 *               description:
 *                 type: string
 *                 description: Описание
 *               categoryId:
 *                 type: string
 *                 description: ObjectId категории
 *               status:
 *                 type: string
 *                 enum: [active, in_progress, completed]
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Изображение (до 5 МБ)
 *     responses:
 *       201:
 *         description: Желание создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wish'
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const wishes = await Wish.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(wishes.map((w) => w.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, handleUpload, async (req, res) => {
  try {
    const { title, description, categoryId, status, deadline } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Название обязательно" });
    }

    const wish = await Wish.create({
      userId: req.user.id,
      title: title.trim(),
      description: description || "",
      categoryId: cleanCategoryId(categoryId),
      status: status || "active",
      deadline: deadline || null,
      image: req.file ? `/uploads/${req.file.filename}` : null,
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, in_progress, completed]
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               removeImage:
 *                 type: string
 *                 description: 'передавайте true, чтобы удалить изображение'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Новое изображение (до 5 МБ)
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
router.put("/:id", authenticate, handleUpload, async (req, res) => {
  try {
    const wish = await Wish.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!wish) return res.status(404).json({ error: "Желание не найдено" });

    const { title, description, categoryId, status, deadline, removeImage } =
      req.body;
    if (title !== undefined) wish.title = title.trim();
    if (description !== undefined) wish.description = description;
    if (categoryId !== undefined) wish.categoryId = cleanCategoryId(categoryId);
    if (status !== undefined) wish.status = status;
    if (deadline !== undefined) wish.deadline = deadline || null;
    if (req.file) wish.image = `/uploads/${req.file.filename}`;
    else if (removeImage === "true") wish.image = null;

    await wish.save();
    res.json(wish.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const result = await Wish.deleteOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Желание не найдено" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
