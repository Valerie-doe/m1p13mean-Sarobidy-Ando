const Shop = require('../models/boutique/Shop');
const crypto = require("crypto");
const Utilisateur = require("../models/admin/utilisateur/utilisateur"); 

// Créer une boutique
exports.createShop = async (req, res) => {
    try {
                const generatedPassword = crypto.randomBytes(4).toString("hex");
        
        const shop = await Shop.create(req.body);
        
                // ✅ Création user lié à la boutique
                const user = new Utilisateur({
                    nom: shop.name,
                    email: shop.email,
                    password: generatedPassword,
                    role: "BOUTIQUE",
                    boutiqueId: shop._id
                });
        
                await user.save();
        
                res.status(201).json({
                    message: "Boutique et utilisateur créés avec succès",
                    shop,
                    user: {
                        email: user.email,
                        password: generatedPassword
                    }
                });
        
        
        res.status(201).json(shop);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lister toutes les boutiques
exports.getShops = async (req, res) => {
  try {
    // Populate category pour récupérer label, icon, etc.
    const shops = await Shop.find()
      .populate('categoryId', 'name description') // champ 'category' à peupler, et sélectionner seulement certains champs
      .exec();

    res.status(200).json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateShop = async (req, res) => {
    try {
        const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true , runValidators: true });
        if (!shop) return res.status(404).json({ error: 'Shop not found' });
        res.status(200).json(shop);
    } catch (err) {     
        res.status(500).json({ error: err.message });
    }   
};

exports.deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findByIdAndDelete(req.params.id);
        if (!shop) return res.status(404).json({ error: 'Shop not found' });
        res.status(200).json({ message: 'Shop deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 

// lister les boutiques actives
exports.getActiveShops = async (req, res) => {
  try {
    const shops = await Shop.find({ status: 'active' })
      .populate('categoryId', 'name description')  // peupler la catégorie
      .sort({ name: 1 })
      .exec();  // exécute la requête

    res.status(200).json(shops);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      success: false,
      message: 'Failed to retrieve active shops'
    });
  }
};

exports.getShopById = async (req, res) => {     
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ error: 'Shop not found' });
        res.status(200).json(shop);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getShopsByCategory = async (req, res) => {
  try {
    console.log('--- Début getShopsByCategory ---');
    console.log('Params reçus :', req.params);

    const { categoryId } = req.params;
    console.log('categoryId extrait :', categoryId);

    if (!categoryId) {
      console.warn('⚠️ categoryId manquant dans la requête');
      return res.status(400).json({
        message: 'categoryId manquant'
      });
    }

    console.log('Recherche des shops actifs pour cette catégorie...');

    const shops = await Shop.find({ categoryId: categoryId, status: 'active' })
      .populate('categoryId', 'name description')
      .sort({ name: 1 });

    console.log(`Nombre de boutiques trouvées : ${shops.length}`);
    console.log('Boutiques récupérées :', shops);

    // ⚡ Retourner directement le tableau
    res.status(200).json(shops);

    console.log('--- Fin getShopsByCategory ---');
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des boutiques :', err);
    res.status(500).json({
      message: 'Erreur lors de la récupération des boutiques',
      error: err.message
    });
  }
};