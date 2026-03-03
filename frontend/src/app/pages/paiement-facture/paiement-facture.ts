import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/service/api.service';
import { ApiEndpoints } from '../../shared/constants/api-endpoints';
import { Header } from '../header/header';

@Component({
  selector: 'app-paiement-facture',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './paiement-facture.html',
  styleUrls: ['./paiement-facture.css']
})
export class PaiementFactureComponent implements OnInit {

  paiementForm!: FormGroup;
  factures: any[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit(): void {
    this.paiementForm = this.fb.group({
      factureId: ['', Validators.required]
    });
    this.loadFactures();
  }

  // Charger toutes les factures
  loadFactures(): void {
    this.api.getList(ApiEndpoints.FACTURE.GETALL).subscribe({
      next: (res: any) => {
        this.factures = res;
      },
      error: (err) => {
        console.error('Erreur chargement factures', err);
        this.errorMessage = 'Impossible de charger les factures';
      }
    });
  }

  // Effectuer le paiement
  onPaiement(): void {
    if (this.paiementForm.invalid) {
      this.paiementForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { factureId } = this.paiementForm.value;

    const facture = this.factures.find(f => f._id === factureId);
    if (!facture) {
      this.errorMessage = 'Facture introuvable';
      this.loading = false;
      return;
    }

    this.api.create(ApiEndpoints.PAIEMENT.CREATE, {
      factureId
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = res.message || 'Paiement effectué';
        // Optionnel : retirer la facture payée de la liste
        this.factures = this.factures.filter(f => f._id !== factureId);
        this.paiementForm.reset();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors du paiement';
      }
    });
  }

}