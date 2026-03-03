const Product = require('../models/boutique/Products');
const Order = require('../models/boutique/Order');
const Customer = require('../models/boutique/Customer');
const mongoose = require('mongoose');
const Sales = require('../models/boutique/Sales');

const Facture = require('../models/admin/facture/facture');
const PaiementFacture = require('../models/admin/facture/paiementFacture');
const Contrat = require('../models/admin/contrat/contrat');
const Boutique = require('../models/admin/boutique/boutique'); // modèle boutique

exports.getKPI = async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!shopId) return res.status(400).json({ error: "shopId requis" });

    const shopObjectId = new mongoose.Types.ObjectId(shopId);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      const allOrders = await Sales.find({ shopId: shopObjectId });
      console.log(allOrders.map(o => o.createdAt));

      const ordersToday = await Sales.find({
        shopId: shopObjectId,
        createdAt: { $gte: today, $lt: tomorrow }
      });

  const caDuJour = ordersToday.reduce((total, order) => {
    return total + order.products.reduce((sum, p) => {
      return sum + (p.salePrice * p.quantity);
    }, 0);
  }, 0);

    const ventesDuJour = ordersToday.reduce(
      (sum, order) => sum + order.products.reduce((s, p) => s + p.quantity, 0),
      0
    );

    // 2️⃣ Commandes en attente
    const commandesEnAttente = await Order.countDocuments({
      shopId: shopObjectId,
      status: 'pending'
    });

    // 3️⃣ Produits avec stock faible
    const stockFaible = await Product.countDocuments({
      shopId: shopObjectId,
      stock: { $lte: 10 }
    });

    // 4️⃣ Nombre de produits en stock (>0)
    const produitsEnStock = await Product.countDocuments({
      shopId: shopObjectId,
      stock: { $gt: 0 }
    });

    // 5️⃣ Nombre de produits par tranche de stock
    const stockParCategorie = await Product.aggregate([
      { $match: { shopId: shopObjectId } },
      { $project: { 
          trancheStock: {
            $switch: {
              branches: [
                { case: { $eq: ["$stock", 0] }, then: "epuise" },
                { case: { $lte: ["$stock", "$lowStockThreshold"] }, then: "faible" }
              ],
              default: "normal"
            }
          }
        } 
      },
      { $group: { _id: "$trancheStock", total: { $sum: 1 } } }
    ]);

    // 6️⃣ Top 3 articles les plus vendus
    const topArticles = await Sales.aggregate([
      { $match: { shopId: shopObjectId } },
      { $unwind: "$products" },
      { $group: { _id: "$products.productId", totalQuantity: { $sum: "$products.quantity" } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 },
      { 
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $project: { _id: 0, name: "$product.name", totalQuantity: 1 } }
    ]);

  const topClients = await Sales.aggregate([
    { $match: { shopId: shopObjectId } },
    { $unwind: "$products" },
    { $group: {
        _id: "$customerId",
        totalSpent: { $sum: { $multiply: ["$products.quantity", "$products.salePrice"] } }
    }},
    { $sort: { totalSpent: -1 } },
    { $limit: 3 },
    { $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customer"
    }},
    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
    { $project: {
        _id: 0,
        name: { $ifNull: ["$customer.name", "Client inconnu"] },
        contact: { $ifNull: ["$customer.phone", "N/A"] },
        totalSpent: 1
    }}
  ]);

    // 🔹 Retour JSON complet
    res.json({
      caDuJour,
      ventesDuJour,
      commandesEnAttente,
      stockFaible,
      produitsEnStock,
      stockParCategorie,
      topArticles,
      topClients
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= Dashboard =================
exports.getDashboardStats = async (req, res) => {
  try {
    // 🔹 Revenus mensuels (paiements ce mois)
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const revenus = await PaiementFacture.aggregate([
      {
        $match: {
          datePaiement: { $gte: startMonth, $lte: endMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$montant" }
        }
      }
    ]);

    const totalRevenus = revenus[0]?.total || 0;

    // 🔹 Taux d'occupation
    const totalBoutiques = await Boutique.countDocuments();
    const contratsActifs = await Contrat.countDocuments({ statut: "ACTIF" });
    const tauxOccupation = totalBoutiques ? (contratsActifs / totalBoutiques) * 100 : 0;

    // 🔹 Impayés
    const facturesNonPayees = await Facture.find().populate('contratId');
    const paiements = await PaiementFacture.find();
    const paiementsIds = paiements.map(p => p.factureId.toString());
    const impayes = facturesNonPayees.filter(f => !paiementsIds.includes(f._id.toString()));

    res.status(200).json({
      revenusMensuels: totalRevenus,
      tauxOccupation: tauxOccupation.toFixed(2),
      impayes: impayes.map(f => ({
        _id: f._id,
        periode: f.periode,
        boutique: f.contratId?.boutiqueId?.name,
        montant: f.montantTotal
      })),
      totalImpayes: impayes.length
    });
  } catch (error) {
    console.error("Erreur dashboard:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};