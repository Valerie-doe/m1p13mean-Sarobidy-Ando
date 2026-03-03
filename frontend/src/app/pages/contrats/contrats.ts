import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/service/api.service';
import { ApiEndpoints } from '../../shared/constants/api-endpoints';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Header } from '../header/header';
export interface Contrat {
  _id?: string;
  boutiqueId: string | { _id: string; name: string };
  lotId: string | { _id: string; numero: string; prix?: number };

  dateDebut: string;
  dateFin: string;
  datePaiement?: string | null;
  dateEnvoie?: string | null;
  
  loyerMensuel?: number;
  statut?: 'ACTIF' | 'EXPIRE';
}
@Component({
  selector: 'app-contrats',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, Header],
  templateUrl: './contrats.html',
  styleUrls: ['./contrats.css']
})
export class Contrats implements OnInit {

  contrats: Contrat[] = [];
  filteredContrats: Contrat[] = [];
  searchTerm: string = '';
filterBoutique: string = '';
filterLot: string = '';
filterDateDebut: string = '';
filterDateFin: string = '';
filterStatut: string = '';
  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadContrats();
  }

  loadContrats(): void {
    this.api.getList<Contrat[]>(ApiEndpoints.CONTRATS.GETALL).subscribe({
      next: data => {
        this.contrats = data;
        this.filteredContrats = data;
      },
      error: err => console.error('Erreur chargement contrats', err)
    });
    console.log(this.contrats);

  }

  goToEditContrat(id: string) {
    this.router.navigate(['/contrats/add', id]);
  }


applyFilters(): void {
  this.filteredContrats = this.contrats.filter(c => {
    // Filtre boutique
    const boutiqueMatch =
      !this.filterBoutique ||
      (c.boutiqueId && typeof c.boutiqueId !== 'string' && c.boutiqueId.name.toLowerCase().includes(this.filterBoutique.toLowerCase()));

    // Filtre lot
    const lotMatch =
      !this.filterLot ||
      (c.lotId && typeof c.lotId !== 'string' && c.lotId.numero.toLowerCase().includes(this.filterLot.toLowerCase()));

    // Filtre dates : chevauchement avec la période choisie
    const dateDebutContrat = new Date(c.dateDebut);
    const dateFinContrat = new Date(c.dateFin);
    const filterDebut = this.filterDateDebut ? new Date(this.filterDateDebut) : null;
    const filterFin = this.filterDateFin ? new Date(this.filterDateFin) : null;

    const dateMatch =
      (!filterDebut || dateFinContrat >= filterDebut) &&
      (!filterFin || dateDebutContrat <= filterFin);

    // Filtre statut
    const statutMatch = !this.filterStatut || c.statut === this.filterStatut;

    // Tous les filtres combinés
    return boutiqueMatch && lotMatch && dateMatch && statutMatch;
  });
}
onSearch(): void {
  const term = this.searchTerm.trim().toLowerCase();
  if (!term) {
    this.filteredContrats = this.contrats;
  } else {
    this.filteredContrats = this.contrats.filter(c => 
      (typeof c.boutiqueId !== 'string' && c.boutiqueId?.name.toLowerCase().includes(term)) ||
      (typeof c.lotId !== 'string' && c.lotId?.numero.toLowerCase().includes(term))
    );
  }
}
  deleteContrat(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce contrat ?')) {
      this.api.delete(ApiEndpoints.CONTRATS.GETALL, id).subscribe({
        next: () => this.loadContrats(),
        error: err => console.error('Erreur suppression contrat', err)
      });
    }
  }
}