const Order = require('../models/boutique/Order');

// ----------------------
// Planifier / mettre à jour la livraison (côté boutique)
// ----------------------
exports.updateDeliveryByShop = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { scheduledDate, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    if (order.status !== 'validated') return res.status(400).json({ error: 'Commande non validée' });

    order.delivery.scheduledDate = scheduledDate || order.delivery.scheduledDate;
    order.delivery.status = status || order.delivery.status;

    await order.save();
    res.status(200).json({ message: 'Livraison mise à jour', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Confirmer la livraison (côté client)
// ----------------------
exports.confirmDeliveryByClient = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { actualDate } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    if (order.status !== 'validated') return res.status(400).json({ error: 'Commande non validée' });

    order.delivery.actualDate = actualDate || new Date();
    order.delivery.status = 'delivered';

    await order.save();
    res.status(200).json({ message: 'Livraison confirmée', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Lister les livraisons d'une boutique
// ----------------------
exports.getDeliveriesByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const orders = await Order.find({ shopId, status: 'validated' })
                              .select('delivery customerId totalAmount status')
                              .populate('customerId', 'name email phone');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.markAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Paiement requis avant livraison' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Commande déjà livrée' });
    }

    order.deliveryStatus = 'in_progress';
    order.deliveryDate = new Date();

    await order.save();

    res.status(200).json({ message: 'Commande marquée comme livrée' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const Facture = require('../models/admin/facture/facture');
const PaiementFacture = require('../models/admin/facture/paiementFacture');
const Contrat = require('../models/admin/contrat/contrat');
const Boutique = require('../models/admin/boutique/boutique'); // modèle boutique

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