import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticate } from "../middleware/auth.js";
import User from "../models/User.js";
import { seedDefaultCategories } from "../config/seedCategories.js";

const router = Router();

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Регистрация нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Екатерина
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: secret123
 *     responses:
 *       201:
 *         description: Пользователь создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: Email уже занят
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Имя должно содержать минимум 2 символа" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Пароль должен содержать минимум 6 символов" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Пользователь с таким email уже существует" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
    });

    await seedDefaultCategories(user._id);

    const token = signToken(user._id);

    res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Вход в систему
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Неверные credentials
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Неверный пароль" });
    }

    const token = signToken(user._id);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Получить текущего пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Текущий пользователь
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 */
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Обновить профиль текущего пользователя
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Екатерина Иванова
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *     responses:
 *       200:
 *         description: Профиль обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: Email уже занят
 *       404:
 *         description: Пользователь не найден
 */
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (name !== undefined && name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Имя должно содержать минимум 2 символа" });
    }
    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    // Check duplicate email only if email is being changed
    if (email) {
      const existing = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.user.id },
      });
      if (existing) {
        return res
          .status(409)
          .json({ error: "Пользователь с таким email уже существует" });
      }
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.toLowerCase();

    await user.save();
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/password:
 *   put:
 *     tags: [Auth]
 *     summary: Изменить пароль
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: oldpass123
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: newpass456
 *     responses:
 *       200:
 *         description: Пароль изменён
 *       400:
 *         description: Новые данные не могут совпадать со старыми
 *       401:
 *         description: Неверный текущий пароль
 */
router.put("/password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Текущий и новый пароль обязательны" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Новый пароль должен содержать минимум 6 символов" });
    }
    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({ error: "Новый пароль не может совпадать с текущим" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Неверный текущий пароль" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
