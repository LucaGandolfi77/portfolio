/* ============================================================
   Seba — fourteen cities, each with a rave and an after
   ------------------------------------------------------------
   Real city names, invented venues, invented drinks.
   lat/lon place the pin on the postcard map.
   ============================================================ */
const C = (id, lat, lon, level, price, tier, sky, scene, bpm, root, it, en) =>
  ({ id, lat, lon, level, price, tier, sky, scene, bpm, root, it, en });

export const CITIES = [
  C('milano', 45.46, 9.19, 1, 0, 1, ['#2a1a4a', '#c2526b'], 'duomo', 124, 45,
    { name: 'Milano', drink: 'Naviglio Sporco', rave: 'Il Capannone dei Navigli', after: 'una lavanderia a gettoni in viale Padova', hello: 'Casa! Qui l’aperitivo non finisce, cambia solo nome.' },
    { name: 'Milan', drink: 'Dirty Canal', rave: 'The Canal Warehouse', after: 'a coin laundry on Viale Padova', hello: 'Home! Aperitivo never ends here, it just changes its name.' }),
  C('rimini', 44.06, 12.57, 1, 8, 1.1, ['#1c3f7a', '#ffb26b'], 'riviera', 128, 43,
    { name: 'Rimini', drink: 'Bagnino Triste', rave: 'Bagno 69 dopo il tramonto', after: 'la ruota panoramica ferma in cima', hello: 'Rimini! Piadina, sabbia nelle mutande e speranza.' },
    { name: 'Rimini', drink: 'Sad Lifeguard', rave: 'Beach Club 69 after dusk', after: 'the Ferris wheel, stuck at the top', hello: 'Rimini! Flatbread, sand in my pants and hope.' }),
  C('amsterdam', 52.37, 4.9, 2, 20, 1.3, ['#173a4d', '#e8956b'], 'canals', 126, 41,
    { name: 'Amsterdam', drink: 'Bici Annegata', rave: 'La Chiatta Rumorosa', after: 'una casa galleggiante con un gatto che giudica', hello: 'Ventimila biciclette e neanche una mia.' },
    { name: 'Amsterdam', drink: 'Drowned Bike', rave: 'The Noisy Barge', after: 'a houseboat with a judgemental cat', hello: 'Twenty thousand bikes and not one of them is mine.' }),
  C('berlino', 52.52, 13.4, 2, 22, 1.4, ['#14141c', '#5a4a7a'], 'tower', 134, 38,
    { name: 'Berlino', drink: 'Bunker Mate', rave: 'La Centrale Grigia (tre ore di fila)', after: 'un tetto con un divano senza gambe', hello: 'Vestito di nero. Sono pronto. Mi faranno entrare? No. Forse. Sì!' },
    { name: 'Berlin', drink: 'Bunker Mate', rave: 'The Grey Power Plant (three-hour queue)', after: 'a rooftop with a legless sofa', hello: 'Dressed in black. Ready. Will they let me in? No. Maybe. Yes!' }),
  C('lisbona', 38.72, -9.14, 3, 24, 1.5, ['#2b5d86', '#ffcf8a'], 'tram', 122, 45,
    { name: 'Lisbona', drink: 'Saudade Doppia', rave: 'Il Magazzino sul Fiume', after: 'un tram di servizio con un autista complice', hello: 'Tutte salite. Seba rotola in discesa: ottimizzazione.' },
    { name: 'Lisbon', drink: 'Double Saudade', rave: 'The River Depot', after: 'an off-duty tram with a friendly driver', hello: 'All uphill. Seba rolls downhill: optimisation.' }),
  C('ibiza', 38.9, 1.43, 3, 30, 1.7, ['#ff6f61', '#ffd36b'], 'beach', 126, 48,
    { name: 'Ibiza', drink: 'Tramonto Isterico', rave: 'La Cala dei Bassi', after: 'una barca di sconosciuti diretta chissà dove', hello: 'Il tramonto! Applaudiamo il sole, che si è impegnato.' },
    { name: 'Ibiza', drink: 'Hysterical Sunset', rave: 'Bass Cove', after: 'a boat full of strangers heading somewhere', hello: 'The sunset! Let’s clap for the sun, it really tried.' }),
  C('bangkok', 13.75, 100.5, 4, 40, 2, ['#3a1247', '#ff9a52'], 'temple', 130, 44,
    { name: 'Bangkok', drink: 'Tuk-Tuk Ghiacciato', rave: 'Il Tetto del Mercato Notturno', after: 'un banchetto di noodle che non chiude mai', hello: 'Piccante. Piccantissimo. Ancora, grazie.' },
    { name: 'Bangkok', drink: 'Frozen Tuk-Tuk', rave: 'The Night Market Rooftop', after: 'a noodle stall that never closes', hello: 'Spicy. Very spicy. More, please.' }),
  C('messico', 19.43, -99.13, 4, 42, 2, ['#40205a', '#ff7a8a'], 'pyramid', 118, 40,
    { name: 'Città del Messico', drink: 'Coniglio Furioso', rave: 'La Vecchia Fabbrica di Piñatas', after: 'il cortile di una nonna che ti fa mangiare per forza', hello: 'La nonna dice che sono sciupato. Ho trovato la mia gente.' },
    { name: 'Mexico City', drink: 'Furious Rabbit', rave: 'The Old Piñata Factory', after: 'a grandmother’s courtyard, forced feeding included', hello: 'Grandma says I look starved. I have found my people.' }),
  C('tokyo', 35.68, 139.69, 5, 48, 2.3, ['#10123a', '#ff4fa3'], 'neon', 138, 46,
    { name: 'Tokyo', drink: 'Neon Gentile', rave: 'Il Seminterrato 7½', after: 'un izakaya da quattro posti con karaoke', hello: 'Quattro sgabelli, un microfono e un signore che canta benissimo.' },
    { name: 'Tokyo', drink: 'Polite Neon', rave: 'Basement 7½', after: 'a four-seat izakaya with karaoke', hello: 'Four stools, one mic and a gentleman who sings beautifully.' }),
  C('detroit', 42.33, -83.05, 5, 45, 2.3, ['#101820', '#6a8a9a'], 'factory', 132, 36,
    { name: 'Detroit', drink: 'Pistone Caldo', rave: 'L’Officina Numero Nove', after: 'un diner alle sei con il caffè infinito', hello: 'Qui la cassa dritta è nata prima di me. Mi tolgo la cresta.' },
    { name: 'Detroit', drink: 'Hot Piston', rave: 'Workshop Number Nine', after: 'a 6 a.m. diner with bottomless coffee', hello: 'The four-to-the-floor was born here before me. Crest off, respect.' }),
  C('newyork', 40.71, -74.0, 6, 55, 2.7, ['#0f1b3d', '#f0a35a'], 'skyline', 128, 43,
    { name: 'New York', drink: 'Taxi Giallo', rave: 'Il Loft senza Ascensore', after: 'una bodega con un panino che salva la vita', hello: 'Sette rampe di scale. Il rave è il defibrillatore.' },
    { name: 'New York', drink: 'Yellow Cab', rave: 'The Walk-Up Loft', after: 'a bodega with a life-saving sandwich', hello: 'Seven flights of stairs. The rave is the defibrillator.' }),
  C('goa', 15.3, 74.0, 6, 50, 2.6, ['#1a2f4f', '#ffb347'], 'palms', 142, 42,
    { name: 'Goa', drink: 'Palma Ipnotica', rave: 'La Radura Fluorescente', after: 'un’amaca condivisa con una mucca', hello: 'Tutto fluo, anche i pensieri.' },
    { name: 'Goa', drink: 'Hypnotic Palm', rave: 'The Glowing Clearing', after: 'a hammock shared with a cow', hello: 'Everything glows, even the thoughts.' }),
  C('rio', -22.9, -43.17, 7, 60, 3.2, ['#0e5a6a', '#ffe066'], 'sugarloaf', 130, 47,
    { name: 'Rio', drink: 'Samba Liquida', rave: 'Il Carro Fuori Percorso', after: 'una scuola di samba che prova alle sette', hello: 'Carnevale! Ho tre piume e nessun piano.' },
    { name: 'Rio', drink: 'Liquid Samba', rave: 'The Off-Route Float', after: 'a samba school rehearsing at seven', hello: 'Carnival! I own three feathers and zero plans.' }),
  C('islanda', 64.14, -21.9, 8, 70, 3.8, ['#041022', '#1f8f7a'], 'aurora', 120, 39,
    { name: 'Islanda', drink: 'Geyser Timido', rave: 'Il Rave sotto l’Aurora', after: 'una pozza termale con sette vichinghi in cuffia', hello: 'Il cielo fa le luci da solo. Licenziate il tecnico.' },
    { name: 'Iceland', drink: 'Shy Geyser', rave: 'The Aurora Rave', after: 'a hot spring with seven vikings in headphones', hello: 'The sky does its own lights. Fire the technician.' }),
];

export const cityById = (id) => CITIES.find((c) => c.id === id) || CITIES[0];
