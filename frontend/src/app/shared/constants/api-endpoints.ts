export const ApiEndpoints = {
  USER: {
    LOGIN: 'api/auth/login'
  },
  LOTS:{
    GETALL:'api/lots/',
    GETLIBRE:'api/lots/libres',
    CREATE:'api/lots/',
    UPDATE:'api/lots/'
  },BOUTIQUES:{
    GETALL:'api/shops/',
    CREATE:'api/shops/',
    UPDATE:'api/shops/'
  },CONTRATS:{
    GETALL:'api/contrats/',
    CREATE:'api/contrats/',
    UPDATE:'api/contrats/'
  },
  CATEGORIES:{
    GETALL:'api/categories_products/'
  },
  FACTURE:{
    GENERATE:'api/factures/generate/',
    GETALL:'api/factures/getall/',
  },PAIEMENT:{
    CREATE:'api/paiements/create/',
  }, 
  DASHBOARD : {
  STATS: 'api/dashboard/admin'
}
};
