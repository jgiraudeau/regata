# Product Brief — Regatta

**Date** : 2026-02-28
**Auteur** : Jacques (Antigravity)
**Agent BMAD** : Mary (Analyst)

---

## 1. Vision

**Regatta** est une application d'aide à la décision tactique pour les régatiers professionnels, entraîneurs et coachs. Elle analyse en temps réel les conditions de navigation (vent, courants, marées, houle) et génère des briefings tactiques structurés pour optimiser les choix de bord et d'options sur un parcours de régate.

### Proposition de valeur
> "Donner à chaque entraîneur et régatier l'analyse tactique d'un weather router professionnel, en temps réel, pour chaque régate."

---

## 2. Utilisateurs cibles

### Persona principal : L'entraîneur / Coach de régate
- Encadre des équipages en compétition (Habitable, Monotype, Dériveur)
- Prépare les briefings avant chaque manche
- A besoin de croiser rapidement courants, vent et marées sur la zone
- Utilise actuellement : cartes papier SHOM + Windguru + intuition

### Persona secondaire : Le régatier pro / semi-pro
- Navigue en solitaire ou en équipage réduit
- Veut un briefing pré-course rapide sur mobile
- Consulte pendant les temps morts (entre les manches)

### Persona tertiaire : Le directeur de course / comité de course
- Doit placer le parcours dans la zone optimale
- A besoin de comprendre l'évolution des conditions

---

## 3. Problèmes à résoudre

1. **Données dispersées** : Le régatier doit croiser manuellement 4-5 sources (Windguru, SHOM, Météo France, cartes de courants papier)
2. **Analyse complexe** : Combiner vent + courant + marée + type de parcours demande une expertise pointue
3. **Manque de temps** : Le briefing se fait souvent 30 min avant le départ, sous pression
4. **Pas d'outil dédié** : Aucune app ne fournit un briefing tactique contextualisé pour la régate

---

## 4. Fonctionnalités clés (MVP)

### F1 — Configuration de la régate
- Saisie de la zone de navigation (carte interactive ou coordonnées)
- Type de parcours (banane, triangle, côtier, parcours permanent)
- Positionnement du parcours (orientation, position des bouées)
- Horaires (départ prévu, durée estimée, nombre de manches)

### F2 — Collecte de données en temps réel
- **Vent** : Direction, force, rafales, prévisions de rotation (Open-Meteo / AROME)
- **Marées** : Horaires PM/BM, hauteurs, coefficients (SHOM API)
- **Courants** : Cartes de courants de marée interpolées selon le coefficient actuel (SHOM 2D)
- **Houle/vagues** : Hauteur, période, direction (Open-Meteo Marine / MFWAM)

### F3 — Analyse tactique IA
- Moteur d'analyse qui croise toutes les données sur la fenêtre horaire de la régate
- Identification des interactions vent/courant (vent contre courant = mer formée, courant portant = VMG impacté)
- Analyse par leg du parcours (au près, vent arrière, reaching)

### F4 — Briefing tactique structuré
- **Résumé des conditions** : Vue d'ensemble claire
- **Options favorables** : Bords à privilégier, côté du plan d'eau avantagé, timing des manœuvres
- **Options défavorables** : Zones de courant adverse, pièges, erreurs à éviter
- **Recommandations clés** : 3-5 actions prioritaires et concrètes
- **Évolution temporelle** : Comment les conditions changent pendant la course

### F5 — Visualisation cartographique
- Carte de la zone avec overlay des courants
- Direction du vent visualisée
- Parcours superposé
- Zones favorables/défavorables colorées

---

## 5. Fonctionnalités futures (post-MVP)

- **Mode live** : Mise à jour pendant la régate (refresh automatique)
- **Historique** : Enregistrement des briefings pour analyse post-course
- **Polaires bateau** : Intégration des polaires pour calcul de VMG réel
- **Multi-parcours** : Comparaison de scénarios de placement de parcours
- **Replay** : Analyse post-régate avec données réelles vs prévisions
- **Notifications push** : Alertes de changement de conditions
- **Collaboration** : Partage du briefing avec l'équipage
- **Mode hors-ligne** : Téléchargement des données avant départ

---

## 6. Sources de données

| Donnée | Source | Format | Coût |
|---|---|---|---|
| Vent (prévision haute résolution) | Open-Meteo (AROME Météo-France) | JSON REST | Gratuit |
| Vent (backup / multi-modèle) | Météo-France API officielle | GRIB2/JSON | Gratuit |
| Marées (horaires, hauteurs, coefficients) | SHOM API (SPM) | XML/TXT | Abonnement payant |
| Courants de marée 2D | SHOM données ouvertes | Mesh/Grid | Gratuit (Etalab) |
| Courants océaniques | Copernicus Marine (CMEMS) | NetCDF | Gratuit |
| Vagues / houle | Open-Meteo Marine (MFWAM) | JSON REST | Gratuit |

---

## 7. Stack technique envisagé

- **Frontend** : Next.js (App Router) + Tailwind CSS
- **Cartographie** : Mapbox GL JS ou Leaflet
- **Backend / API** : Next.js API Routes
- **IA** : Claude API (analyse tactique et génération de briefing)
- **Données** : APIs externes (Open-Meteo, SHOM, Copernicus)
- **Déploiement** : Vercel
- **Base de données** : Supabase ou Firebase (sessions, favoris, historique)

---

## 8. Plateformes

- **Web** (responsive desktop + mobile) — MVP
- **PWA** (Progressive Web App) pour usage mobile sur l'eau
- **App native** (React Native) — post-MVP si besoin

---

## 9. Modèle économique

### Phase 1 : Gratuit / Freemium
- Briefing de base gratuit (1 zone, 1 session)
- Premium : zones illimitées, historique, polaires, mode live

### Phase 2 : Abonnement
- **Solo** : ~15€/mois (1 utilisateur, zones France)
- **Coach** : ~39€/mois (multi-équipages, partage briefings)
- **Club** : ~99€/mois (tous les entraîneurs du club)

---

## 10. Métriques de succès

- **Adoption** : 100 utilisateurs actifs en 6 mois
- **Rétention** : 60% d'utilisation récurrente (chaque week-end de régate)
- **Satisfaction** : NPS > 50 auprès des entraîneurs
- **Précision** : Corrélation briefing vs conditions réelles > 80%

---

## 11. Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Coût API SHOM élevé | Moyenne | Fort | Commencer avec WorldTides + ajout SHOM en premium |
| Précision insuffisante des prévisions | Moyenne | Fort | Multi-modèle + disclaimer sur la fiabilité |
| Courants SHOM en format complexe | Haute | Moyen | Pré-traiter et cacher les données interpolées |
| Complexité UX (trop de données) | Moyenne | Fort | UX épuré, briefing texte prioritaire sur les graphiques |
| Latence Copernicus (pas REST) | Haute | Moyen | Proxy Python + cache des données |

---

## 12. Concurrence

- **Windguru** : Prévisions vent uniquement, pas de conseil tactique, pas d'API
- **PredictWind** : Bon pour la croisière/routing, pas spécifiquement régate
- **SailGrib** : Routage météo, focalisé navigation hauturière
- **RaceQs** : Tracking post-course, pas de briefing pré-course
- **TacticalSailing** : Simulateur tactique, pas de données réelles

**Aucun concurrent ne fait de briefing tactique IA basé sur des données temps réel pour la régate côtière.**
