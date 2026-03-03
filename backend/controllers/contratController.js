const Contrat = require("../models/admin/contrat/contrat");
const Boutique = require("../models/admin/boutique/boutique");
const Lot = require("../models/admin/lot/lot");
const Shop = require("../models/boutique/Shop");

async function checkAndExpireContrat(contrat) {
    const now = new Date();
    const nouveauStatut = now > new Date(contrat.dateFin) ? "EXPIRE" : "ACTIF";

    if (contrat.statut !== nouveauStatut) {
        contrat.statut = nouveauStatut;
        await contrat.save();
    }

    const lot = await Lot.findById(contrat.lotId);
    if (lot) {
        lot.statut = nouveauStatut === "EXPIRE" ? "LIBRE" : "OCCUPE";
        await lot.save();
    }
}

// CREATE
exports.createContrat = async (req, res) => {
    try {
        const { boutiqueId, lotId, dateDebut, dateFin, datePaiement, dateEnvoie } = req.body;

        const boutique = await Shop.findById(boutiqueId);
        if (!boutique) return res.status(400).json({ message: "Boutique invalide" });

        const lot = await Lot.findById(lotId);
        if (!lot) return res.status(400).json({ message: "Lot invalide" });

        const loyerMensuel = lot.prix;
        const statut = new Date(dateFin) < new Date() ? "EXPIRE" : "ACTIF";

        const contrat = new Contrat({
            boutiqueId,
            lotId,
            dateDebut,
            dateFin,
            datePaiement: datePaiement || null,
            dateEnvoie: dateEnvoie || null,
            loyerMensuel,
            statut
        });

        await contrat.save();
        res.status(201).json(contrat);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET ALL
exports.getContrats = async (req, res) => {
    try {
        const contrats = await Contrat.find({ deletedAt: null })
            .populate("boutiqueId")
            .populate("lotId");

        for (const c of contrats) {
            await checkAndExpireContrat(c);
        }

        res.status(200).json(contrats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
exports.updateContrat = async (req, res) => {
    try {
        const contrat = await Contrat.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!contrat) return res.status(404).json({ message: "Contrat non trouvé" });

        await checkAndExpireContrat(contrat);

        res.status(200).json(contrat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// GET ACTIFS
exports.getContratsActifs = async (req, res) => {
    try {
        const contrats = await Contrat.find({ statut: "ACTIF", deletedAt: null })
            .populate("boutiqueId")
            .populate("lotId");

        for (const c of contrats) {
            await checkAndExpireContrat(c);
        }

        // Re-filtrer au cas où certains sont devenus EXPIRE
        const actifs = contrats.filter(c => c.statut === "ACTIF");

        res.status(200).json(actifs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET BY ID
exports.getContratById = async (req, res) => {
    try {
        const contrat = await Contrat.findOne({ _id: req.params.id, deletedAt: null })
            .populate("boutiqueId")
            .populate("lotId");

        if (!contrat) return res.status(404).json({ message: "Contrat non trouvé" });

        await checkAndExpireContrat(contrat);

        res.status(200).json(contrat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// DELETE
exports.deleteContrat = async (req, res) => {
    try {
        const contrat = await Contrat.findByIdAndUpdate(
            req.params.id,
            { deletedAt: new Date() },
            { new: true }
        );

        if (!contrat) return res.status(404).json({ message: "Contrat non trouvé" });

        res.status(200).json({ message: "Contrat supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};