import { Beer, Ellipsis, GlassWater, Martini, Wine } from "lucide-react";

export const drinks = [
  { title: 'Cocktails', type: 'COCKTAIL', icon: <Martini size={24} /> },
  { title: 'Shooters', type: 'SHOOTER', icon: <GlassWater size={24} /> },
  { title: 'Bières', type: 'BEER', icon: <Beer size={24} /> },
  { title: 'Vins', type: 'WINE', icon: <Wine size={24} /> },
  { title: 'Champagnes', type: 'CHAMPAGNE', icon: <Wine size={24} />  },
  { title: 'Produits personnalisés', type: 'CUSTOM', icon: <Ellipsis size={24} />  },
];

export const stock_types = [
  { title: 'Alcools', type: 'ALCOOL'},
  { title: 'Liqueurs', type: 'LIQUEUR'},
  { title: 'Softs', type: 'SOFT'},
  { title: 'Jus de fruits', type: 'JUICE'},
  { title: 'Fruits et aromatiques', type: 'SOLID'},
  { title: 'Bières', type: 'BEER'},
  { title: 'Vins', type: 'WINE'},
  { title: 'Champagnes', type: 'CHAMPAGNE'}
];

export const spiritueux = [
  { title: 'Vodka', spirits: ["Vodka"], active: true },
  { title: 'Rhum', spirits: ["Rhum", "Cachaça"], active: true },
  { title: 'Tequila', spirits: ["Tequila"], active: true },
  { title: 'Gin', spirits: ["Gin"], active: true },
  { title: 'Whisky', spirits: ["Whisky"], active: true },
  { title: 'Brandy', spirits: ["Brandy"], active: true },
  { title: 'Liqueur', spirits: ["Amaretto","Crème de Menthe","Crème de Pêche","Crème de Whisky","Curaçao","Liqueur de Fraise","Liqueur de Réglisse","Triple Sec"], active: true },
  { title: 'Sans alcool', spirits: ["Sans alcool"], active: true },
  { title: '···', spirits: ["Surprise"], active: true },
];
