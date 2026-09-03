import Category from "../models/Category.js";

export const DEFAULT_CATEGORIES = [
  { name: "Путешествия", color: "#FF6B6B" },
  { name: "Здоровье", color: "#4ECDC4" },
  { name: "Материальное", color: "#45B7D1" },
  { name: "Личностный рост", color: "#96CEB4" },
  { name: "Карьера", color: "#FFEAA7" },
  { name: "Отношения", color: "#DDA0DD" },
  { name: "Хобби", color: "#98D8C8" },
  { name: "Другое", color: "#F7DC6F" },
];

export async function seedDefaultCategories(userId) {
  const count = await Category.countDocuments({ userId });
  if (count > 0) return;
  await Category.insertMany(DEFAULT_CATEGORIES.map(c => ({ ...c, userId })));
}
