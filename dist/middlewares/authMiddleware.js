import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-food-waste-project';
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                res.status(403).json({ message: 'Token inválido o expirado' });
                return;
            }
            req.user = user;
            next();
        });
    }
    else {
        res.status(401).json({ message: 'Se requiere token de autenticación' });
    }
};
export const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
            return;
        }
        next();
    };
};
