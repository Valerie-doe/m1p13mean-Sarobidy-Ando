import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/service/api.service';
import { Header } from '../header/header';
import { ApiEndpoints } from '../../shared/constants/api-endpoints';

@Component({
  selector: 'app-generate-facture',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './facture.html',
  styleUrls: ['./facture.css']
})
export class GenerateFacture {

  factureForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  errorList: string[] = []; // <-- pour afficher les erreurs détaillées

  moisList = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.factureForm = this.fb.group({
      mois: ['', Validators.required],
      annee: ['', [Validators.required, Validators.min(2000), Validators.max(2100)]]
    });
  }

  onGenerate(): void {

    if (this.factureForm.invalid) {
      this.factureForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.errorList = [];

    const { mois, annee } = this.factureForm.value;
    const periode = `${annee}-${mois}`;

    this.api.create(ApiEndpoints.FACTURE.GENERATE, { periode })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.successMessage = res.message || 'Factures générées avec succès';

          // Si l'API renvoie des erreurs pour certains contrats
          if (res.erreurs && res.erreurs.length) {
            this.errorList = res.erreurs;
          }
        },
        error: (err) => {
          this.loading = false;

          // Si l'API renvoie un tableau d'erreurs
          if (err.error?.erreurs && Array.isArray(err.error.erreurs)) {
            this.errorList = err.error.erreurs;
          } else {
            this.errorMessage = err.error?.message || 'Erreur lors de la génération';
          }
        }
      });
  }
}