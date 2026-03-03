const PaiementFacture = require('../models/admin/facture/paiementFacture');
const Facture = require('../models/admin/facture/facture');

// ================= CREATE PAIEMENT =================
exports.createPaiement = async (req, res) => {
  try {
    const { factureId, datePaiement } = req.body;

    if (!factureId) {
      return res.status(400).json({ message: "Facture obligatoire" });
    }

    const facture = await Facture.findById(factureId).populate({
      path: 'contratId',
      populate: { path: 'boutiqueId' }
    });

    if (!facture) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    // Vérifier si déjà payé
    const exist = await PaiementFacture.findOne({ factureId });
    if (exist) {
      return res.status(400).json({ message: "Cette facture est déjà payée" });
    }

    const paiement = await PaiementFacture.create({
      factureId,
      montant: facture.montantTotal,
      datePaiement: datePaiement ? new Date(datePaiement) : new Date()
    });

    return res.status(201).json({
      message: "Paiement effectué avec succès",
      paiement
    });

  } catch (error) {
    console.error("Erreur paiement:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ================= GET ALL PAIEMENTS =================
exports.getAllPaiements = async (req, res) => {
  try {
    const paiements = await PaiementFacture.find()
      .populate({
        path: 'factureId',
        populate: {
          path: 'contratId',
          populate: { path: 'boutiqueId' }
        }
      })
      .sort({ datePaiement: -1 });

    return res.status(200).json(paiements);
  } catch (error) {
    console.error("Erreur récupération paiements:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};