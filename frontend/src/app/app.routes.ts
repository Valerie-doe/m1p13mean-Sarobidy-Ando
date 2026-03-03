import { Routes } from '@angular/router';
import { Dashboard } from '../pages/dashboard/dashboard';
import { ShopList } from './pages/shop-list/shop-list';
import { ShopProducts } from './pages/shop-products/shop-products';
import { ShopProductCreate } from './pages/shop-product-create/shop-product-create';
import { PurchaseFormComponent } from './pages/purchases/purchases';
import { SaleFormComponent } from './pages/sales/sales';
import { PromotionFormComponent } from './pages/create-promotions/create-promotions';
import { ListPromotions } from './pages/list-promotions/list-promotions';
import { ListOrdersComponent } from './pages/list-orders/list-orders';
import { Notifications } from './pages/notifications/notifications';
import { ShopNavbarComponent } from './pages/navbar-boutique/navbar-boutique';
import { DashboardBoutique } from './pages/dashboard/dashboard';
import { BoutiqueMain } from './pages/boutique-main/boutique-main';
import { LoginBoutique } from './pages/login-boutique/login-boutique';
import { CustomerOrders } from './pages/customer-orders/customer-orders';
import { Lots } from './pages/lots/lots';
import { AddLot } from './pages/lots/add/add';
import { Boutique } from './pages/boutique/boutique';
import { AddBoutique } from './pages/boutique/add-boutique/add-boutique';
import { Contrats } from './pages/contrats/contrats';
import { AddContrat } from './pages/contrats/add-contrat/add-contrat';
import { GenerateFacture } from './pages/facture/facture';
import { PaiementFactureComponent } from './pages/paiement-facture/paiement-facture';
import { DashboardComponent } from './pages/dashboardAdmin/dashboard';

export const routes: Routes = [
    {path : 'shop-list', component : ShopList},
    {path: 'login',component: LoginBoutique},
    {path : 'products-boutiques', component : ShopProducts},
    {path : 'create-products', component : ShopProductCreate},
    {path : 'purchase', component : PurchaseFormComponent},
    {path : 'sales', component : SaleFormComponent},
    {path : 'promo', component :  PromotionFormComponent},
    {path : 'liste-promo', component : ListPromotions},
    {path : 'liste-notif', component : Notifications},
    {path : 'liste-order', component : ListOrdersComponent},
    {path : 'navbar', component : ShopNavbarComponent},
    {path : 'dashboard', component : DashboardBoutique},
    {path : 'boutique/main', component : BoutiqueMain},
    {path : 'customer-order', component : CustomerOrders},
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {path : 'lots', component : Lots},
    {path : 'lots/add', component : AddLot},
    {path: 'lots/add/:id',component: AddLot}, 
    {path : 'boutiques', component : Boutique},
    {path : 'boutique/add', component : AddBoutique},
    {path: 'boutique/add/:id',component: AddBoutique},  
    {path : 'contrats', component : Contrats},
    {path : 'contrats/add', component : AddContrat},
    {path: 'contrats/add/:id',component: AddContrat},
    {path: 'facture',component: GenerateFacture},
    {path: 'paiement',component: PaiementFactureComponent},
    {path: 'dashboardAdmin',component: DashboardComponent}


  ];
