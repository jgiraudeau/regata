export function isMediterranean(lat: number, lng: number): boolean {
  // Bounding box approximative pour la côte méditerranéenne française et la Corse
  // De la frontière espagnole (Cerbère ~42.4N, 3.1E) à l'Italie (Menton ~43.8N, 7.5E)
  return lat >= 41.0 && lat <= 44.0 && lng >= 2.5 && lng <= 10.0;
}

export function isRadeDeBrest(lat: number, lng: number): boolean {
  // Rade de Brest, à l'est du Goulet.
  // Limite ouest approx: -4.52 (Le Goulet est autour de -4.6, la Rade s'ouvre à l'est de -4.55 approx)
  return lat >= 48.25 && lat <= 48.42 && lng >= -4.55 && lng <= -4.15;
}

export function isInlandLake(lat: number, lng: number): boolean {
  // Box 1: Lac Léman, Annecy, Bourget (Est de la France, Alpes)
  if (lat >= 45.5 && lat <= 46.8 && lng >= 5.5 && lng <= 7.5) return true;
  // Box 2: Grands lacs landais (Carcans, Lacanau, Biscarrosse, Sanguinet)
  // On s'assure de ne pas mordre sur l'océan (-1.4 à -1.0 approx) 
  // Mais c'est très proche de la mer, on garde une marge. 
  // Si > -1.15 et < -1.0 en Lng dans cette zone
  if (lat >= 44.3 && lat <= 45.2 && lng >= -1.18 && lng <= -1.0) return true;
  // Box 3: Serre-Ponçon / Verdon
  if (lat >= 43.6 && lat <= 44.6 && lng >= 6.0 && lng <= 6.8) return true;
  // Box 4: Est - Der, Orient
  if (lat >= 48.1 && lat <= 48.7 && lng >= 4.2 && lng <= 4.8) return true;
  // Box 5: Centre (Guerlédan, Vassivière, etc)
  if (lat >= 45.7 && lat <= 46.0 && lng >= 1.8 && lng <= 2.0) return true;
  // Box 6: Autriche / Bavière (Attersee, Chiemsee, etc)
  if (lat >= 47.0 && lat <= 48.5 && lng >= 11.0 && lng <= 14.5) return true;

  // Règle générale grossière pour filtrer le centre de la France (sans la Manche ni l'Atlantique)
  // L'Océan/La Manche c'est en gros: 
  // - Manche: Lng de -5.5 à +2.5, Lat > 48.5 (nord Bretagne à Belgique)
  // - Atlantique: Lng < -1.0 (sud de la Bretagne jusqu'à l'Espagne) 
  // Si Lng > 0.0 et Lat > 44.0 et Lat < 48.0 (sud de la Manche, à l'est de l'Atlantique), c'est probablement inland.
  if (lng > 0.0 && lng < 5.0 && lat > 44.0 && lat < 48.0) return true;

  return false;
}

export function hasTides(lat: number, lng: number): boolean {
  if (isMediterranean(lat, lng)) return false;
  if (isInlandLake(lat, lng)) return false;
  return true;
}

export function hasSwell(lat: number, lng: number): boolean {
  // Pas de houle formée dans la Rade de Brest (sauf le goulet qui est à l'ouest de -4.55)
  if (isRadeDeBrest(lat, lng)) return false;
  // Les lacs n'ont pas de vraie houle océanique (swell), seulement du clapot (wind waves)
  if (isInlandLake(lat, lng)) return false;
  return true;
}
