import jwt from 'jwt-simple';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    req.user = decoded; // Добавляем информацию о пользователе в запрос
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Неверный или просроченный токен' });
  }
};

export default authenticateToken;
