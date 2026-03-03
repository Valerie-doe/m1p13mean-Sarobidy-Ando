const Facture = require('../models/admin/facture/facture');
const Contrat = require('../models/admin/contrat/contrat');

exports.createFacturesMensuelles = async (req, res) => {
  try {
    const { periode } = req.body;

    if (!periode) {
      return res.status(400).json({
        message: "La période est obligatoire (format YYYY-MM)"
      });
    }

    // Vérifier format YYYY-MM
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!regex.test(periode)) {
      return res.status(400).json({
        message: "Format invalide. Utilisez YYYY-MM"
      });
    }

    const [year, month] = periode.split('-').map(Number);

    // Récupérer contrats ACTIF
    const contratsActifs = await Contrat
      .find({ statut: "ACTIF" })
      .populate("boutiqueId");

    if (!contratsActifs.length) {
      return res.status(404).json({ message: "Aucun contrat actif trouvé" });
    }

    const facturesCreees = [];
    const erreurs = [];

    for (let contrat of contratsActifs) {
      if (!contrat.loyerMensuel) {
        erreurs.push(`Contrat ${contrat._id} sans loyerMensuel`);
        continue;
      }

      const dateDebut = new Date(contrat.dateDebut);
      const dateFin = new Date(contrat.dateFin);

      const startYear = dateDebut.getFullYear();
      const startMonth = dateDebut.getMonth() + 1; // JS months 0-11
      const endYear = dateFin.getFullYear();
      const endMonth = dateFin.getMonth() + 1;

      // Vérifier que la période est entre dateDebut et dateFin
      const afterStart = year > startYear || (year === startYear && month >= startMonth);
      const beforeEnd = year < endYear || (year === endYear && month <= endMonth);

      if (!afterStart || !beforeEnd) {
        erreurs.push(
          `Période ${periode} hors intervalle pour contrat ${contrat._id}`
        );
        continue;
      }

      // Vérifier si facture existe déjà
      const exist = await Facture.findOne({
        contratId: contrat._id,
        periode
      });
      if (exist) {
        erreurs.push(`Facture déjà existante pour contrat ${contrat._id} (${periode})`);
        continue;
      }

      // Créer facture
      const facture = await Facture.create({
        contratId: contrat._id,
        periode,
        montantTotal: contrat.loyerMensuel,
        dateEmission: new Date()
      });

      facturesCreees.push(facture);
    }

    if (!facturesCreees.length) {
      return res.status(400).json({
        message: "Aucune facture créée",
        erreurs
      });
    }

    return res.status(201).json({
      message: "Factures générées avec succès",
      total: facturesCreees.length,
      facturesCreees,
      erreurs
    });

  } catch (error) {
    console.error("Erreur génération factures:", error);
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

exports.getAllFactures = async (req, res) => {
  try {
    const factures = await Facture.find()
      .populate({
        path: 'contratId',
        populate: { path: 'boutiqueId' }
      })
      .sort({ dateEmission: -1 });

    return res.status(200).json(factures);
  } catch (error) {
    console.error("Erreur récupération factures:", error);
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};