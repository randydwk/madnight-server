import { Beer, Ellipsis, GlassWater, Martini, Wine } from "lucide-react";

export const drinks = [
  { title: 'Cocktails', type: 'COCKTAIL', icon: <Martini size={24} /> },
  { title: 'Shooters', type: 'SHOOTER', icon: <GlassWater size={24} /> },
  { title: 'Bières', type: 'BEER', icon: <Beer size={24} /> },
  { title: 'Vins', type: 'WINE', icon: <Wine size={24} /> },
  { title: 'Champagnes', type: 'CHAMPAGNE', icon: <Wine size={24} />  },
  { title: 'Produits personnalisés', type: 'CUSTOM', icon: <Ellipsis size={24} />  },
];

export const stock_types = ['ALCOOL', 'SOFT', 'SOLID', 'BIERE', 'VIN', 'CHAMPAGNE'];

export const spiritueux = [
  { name: 'Vodka', spirits: ["Vodka"], active: true },
  { name: 'Rhum', spirits: ["Rhum", "Cachaça"], active: true },
  { name: 'Tequila', spirits: ["Tequila"], active: true },
  { name: 'Gin', spirits: ["Gin"], active: true },
  { name: 'Whisky', spirits: ["Whisky"], active: true },
  { name: 'Brandy', spirits: ["Brandy"], active: true },
  { name: 'Sans alcool', spirits: ["Sans alcool"], active: true },
];
