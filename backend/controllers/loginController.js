const jwt = require('jsonwebtoken');
const User = require('../models/boutique/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Log initial
    console.log("🚀 Login appelé");
    console.log("📩 Email reçu :", email);
    console.log("🔑 Password reçu :", password);

    // 🔹 Vérifie si user existe
    const user = await User.findOne({ email });
    console.log("👤 User trouvé dans DB :", user ? user.email : null);
    console.log("📝 Password stocké (hash) :", user ? user.password : null);

    if (!user) {
      console.warn("⚠️ Aucun utilisateur trouvé avec cet email");
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // 🔹 Vérifie le mot de passe
    const isMatch = await user.comparePassword(password);
    console.log("🔒 Résultat bcrypt.compare :", isMatch);

    if (!isMatch) {
      console.warn("⚠️ Mot de passe incorrect pour l'utilisateur :", email);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // 🔹 Génère le token JWT
    const token = jwt.sign(
      { userId: user._id, shopId: user.shop },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    console.log("✅ JWT généré :", token);

<<<<<<< Updated upstream
    // 🔹 Réponse finale
=======
  
>>>>>>> Stashed changes
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        shopId: user.shopId
      }
    });
    console.log("🎉 Login réussi pour :", email);

  } catch (err) {
    console.error("❌ Erreur serveur login :", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};