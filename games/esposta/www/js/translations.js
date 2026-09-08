window.TRANSLATIONS = {
  it: {},
  en: {}
};

/* ================================================================
   ITALIAN (DEFAULT) — UI strings
   ================================================================ */
(function() {
  const it = window.TRANSLATIONS.it;

  // --- Menu ---
  it['menu_subtitle'] = "Dalla camera oscura all'agenzia digitale. L'archivio di Nonna Olga ti insegna l'arte completa.";
  it['menu_continue'] = "Continua";
  it['menu_continue_from'] = "Continua dal Cap.";
  it['menu_restart'] = "Ricomincia da Capitolo 1";
  it['menu_start'] = "Inizia l'Archivio 📸";
  it['menu_agency'] = "🏢 L'Agenzia Infinita";
  it['menu_reset'] = "🗑️ Reset Totale";
  it['menu_reset_confirm'] = "Vuoi davvero resettare?";

  // --- Navigation ---
  it['nav_back'] = "🏠";
  it['nav_back_title'] = "Menu";

  // --- Story ---
  it['story_next'] = "Avanti";
  it['story_skip'] = "⏭️ Salta";
  it['story_start_chapter'] = "Inizia il Capitolo!";
  it['story_speaker_zio'] = "Zio Peppe";
  it['story_speaker_nonna'] = "Note di Nonna Olga";
  it['story_speaker_filtro'] = "Filtro Verde";
  it['story_speaker_narratore'] = "Narratore";

  // --- Concept overlay ---
  it['concept_close'] = "Chiudi ✕";
  it['concept_next'] = "Avanti →";
  it['concept_prefix'] = "📚 ";

  // --- Case study ---
  it['case_prefix'] = "📋 Caso Reale: ";
  it['case_lesson'] = "Lezione";
  it['case_metrics'] = "Metriche";
  it['case_source'] = "Fonte:";

  // --- Modals ---
  it['modal_exam_passed'] = "Esame Superato!";
  it['modal_exam_passed_msg'] = "Sei pronta per aprire l'agenzia!";
  it['modal_exam_open_agency'] = "🏢 Apri l'Agenzia";
  it['modal_exam_study'] = "Studio necessario";
  it['modal_exam_retry'] = "🔄 Riprova";
  it['modal_exam_retry_msg'] = "Studia meglio e riprova!";
  it['modal_chapter_done'] = "Completato!";
  it['modal_score'] = "Punteggio:";
  it['modal_next_chapter'] = "Capitolo Successivo →";
  it['modal_all_done'] = "Archivio Completo!";
  it['modal_all_done_msg'] = "Hai completato tutti i capitoli! Ora puoi aprire l'Agenzia.";
  it['modal_open_agency'] = "🏢 L'Agenzia Infinita";
  it['modal_menu'] = "🏠 Menu";

  // --- Minigames ---
  it['mg_completed'] = "Completato!";
  it['mg_continue'] = "Avanti →";
  it['mg_esposizione_title'] = "Sviluppa il Negativo";
  it['mg_esposizione_sub'] = "Regola i tre sliders per ottenere l'esposizione corretta!";
  it['mg_esposizione_btn'] = "Svilupa!";
  it['mg_esposizione_perfect'] = "Esposizione perfetta! Il negativo è perfetto.";
  it['mg_esposizione_retry'] = "Il negativo è un po' bruciato/scuro. Riprova!";
  it['mg_esposizione_noise_high'] = "Alto rumore";
  it['mg_esposizione_noise_mod'] = "Rumore moderato";
  it['mg_esposizione_noise_clean'] = "Pulito";
  it['mg_esposizione_depth_extreme'] = "Bokeh estremo";
  it['mg_esposizione_depth_medium'] = "Media";
  it['mg_esposizione_depth_all'] = "Tutto a fuoco";
  it['mg_esposizione_freeze_frozen'] = "Congelato";
  it['mg_esposizione_freeze_still'] = "Fermo";
  it['mg_esposizione_freeze_trail'] = "Scia/mosso";
  it['mg_composizione_title'] = "Componi la Scena";
  it['mg_composizione_sub'] = "Trascina il soggetto sul PUNTO d'intersezione della regola dei terzi";
  it['mg_composizione_natural'] = "Composizione naturale!";
  it['mg_composizione_hint'] = "Prova a posizionare il soggetto sui punti d'intersezione.";
  it['mg_composizione_target_left_top'] = "Terzo sinistro-alto";
  it['mg_composizione_target_right_top'] = "Terzo destro-alto";
  it['mg_composizione_target_left_bottom'] = "Terzo sinistro-basso";
  it['mg_composizione_target_right_bottom'] = "Terzo destro-basso";
  it['mg_luce_title'] = "Caccia alla Luce";
  it['mg_luce_sub'] = "Scegli la luce giusta per ogni scena";
  it['mg_luce_eye'] = "Hai l'occhio per la luce!";
  it['mg_luce_practice'] = "La luce è una questione di pratica.";
  it['mg_momento_title'] = "Scatta al Momento Giusto";
  it['mg_momento_sub'] = "Premi SCATTA quando il cursore è nella zona dorata";
  it['mg_momento_btn'] = "📸 SCATTA";
  it['mg_momento_caught'] = "Hai colto il momento decisivo!";
  it['mg_momento_practice'] = "L'istante giusto richiede pratica.";
  it['mg_algoritmo_title'] = "Sfida l'Algoritmo";
  it['mg_algoritmo_sub'] = "Scegli l'opzione che l'algoritmo premia di più";
  it['mg_algoritmo_loves'] = "L'algoritmo ti ama!";
  it['mg_algoritmo_buries'] = "Il feed ti seppellisce...";
  it['mg_contenuto_title'] = "Hook in 3 Secondi";
  it['mg_contenuto_sub'] = "Quale hook funziona meglio?";
  it['mg_contenuto_ninja'] = "Hai il ninja dell'hook!";
  it['mg_contenuto_practice'] = "L'hook è la prima cosa che conta.";
  it['mg_community_title'] = "Gestione Crisi";
  it['mg_community_sub'] = "Cosa fai?";
  it['mg_community_expert'] = "Gestore crisi esperto!";
  it['mg_community_practice'] = "Le crisi si gestiscono con calma e strategia.";
  it['mg_analytics_title'] = "Leggi il Dashboard";
  it['mg_analytics_sub'] = "Interpreta le metriche";
  it['mg_analytics_expert'] = "Analista esperto!";
  it['mg_analytics_practice'] = "Le numeri raccontano storie, se sai leggerle.";
  it['mg_marketing_title'] = "Il Mix Perfetto";
  it['mg_marketing_sub'] = "Cosa rappresenta questa P?";
  it['mg_marketing_master'] = "Master del Marketing Mix!";
  it['mg_marketing_practice'] = "Le 7P richiedono una visione olistica.";
  it['mg_funnel_title'] = "Costruisci il Funnel";
  it['mg_funnel_sub'] = "Quali contenuti vanno in";
  it['mg_funnel_confirm'] = "Conferma";
  it['mg_funnel_master'] = "Funnel master!";
  it['mg_funnel_practice'] = "Il funnel è un percorso, non una cassa.";
  it['mg_brand_title'] = "Posiziona il Brand";
  it['mg_brand_sub'] = "Dove si posiziona questo brand nella mappa percettiva?";
  it['mg_brand_strategist'] = "Stratega del positioning!";
  it['mg_brand_practice'] = "Il positioning è la battaglia per la mente.";
  it['mg_persuasione_title'] = "Il Copy che Converte";
  it['mg_persuasione_sub'] = "Identifica il copy giusto";
  it['mg_persuasione_persuasive'] = "Copy persuasivo!";
  it['mg_persuasione_practice'] = "Le parole sono armi: impara a sceglierle.";
  it['mg_esame_title'] = "Esame del Feed";
  it['mg_esame_passed'] = "Esame Superato!";
  it['mg_esame_failed'] = "Studio necessario";
  it['mg_esame_ready'] = "Sei pronta per aprire l'agenzia!";
  it['mg_esame_retry_msg'] = "Ripassa i capitoli e riprova.";
  it['mg_esame_enter_agency'] = "Entra nell'Agenzia 🏢";
  it['mg_esame_retry_btn'] = "Riprova 📖";

  // --- Agency ---
  it['agency_title'] = "📸 L'Agenzia Infinita";
  it['agency_reputation'] = "Reputazione:";
  it['agency_clients_served'] = "Clienti serviti:";
  it['agency_total_earned'] = "Guadagni totali:";
  it['agency_no_client'] = "Nessun cliente in corso. Accetta un nuovo brief!";
  it['agency_new_client'] = "Nuovo Cliente 📋";
  it['agency_stats'] = "📊 Statistiche Agenzia";
  it['agency_close'] = "Chiudi Agenzia (vedi risultato finale)";
  it['agency_sector'] = "Settore:";
  it['agency_budget'] = "Budget:";
  it['agency_difficulty'] = "Difficoltà:";
  it['agency_tone'] = "Tono:";
  it['agency_needs'] = "Servizi richiesti:";
  it['agency_budget_left'] = "Budget rimasto:";
  it['agency_execute'] = "Esegui Campagna ✅";
  it['agency_reject'] = "Rifiuta ❌";
  it['agency_campaign_done'] = "Campagna Completata!";
  it['agency_continue'] = "Continua 🏢";
  it['agency_completed'] = "Agenzia Completata!";
  it['agency_grade'] = "Grado:";
  it['agency_diff_easy'] = "Facile";
  it['agency_diff_medium'] = "Medio";
  it['agency_diff_hard'] = "Difficile";

  // --- Agency grades ---
  it['agency_grade_S'] = "Eccellente! Il cliente è estatico.";
  it['agency_grade_A'] = "Ottimo lavoro! Consiglio vivamente lo Studio Olga.";
  it['agency_grade_B'] = "Buon lavoro. Il cliente è soddisfatto.";
  it['agency_grade_C'] = "Discreto. C'era margine di miglioramento.";
  it['agency_grade_D'] = "Deludente. Il cliente potrebbe non tornare.";

  // --- Client types (agency) ---
  it['client_ristorante'] = "ristorante";
  it['client_legale'] = "legale";
  it['client_fashion'] = "fashion";
  it['client_fitness'] = "fitness";
  it['client_fotografo'] = "fotografo";
  it['client_turismo'] = "turismo";
  it['client_salute'] = "salute";
  it['client_artigiano'] = "artigiano";
  it['client_educazione'] = "educazione";
  it['client_botanica'] = "botanica";
  it['client_architettura'] = "architettura";
  it['client_beauty'] = "beauty";
  it['client_no_profit'] = "no-profit";
  it['client_food'] = "food";
  it['client_tech'] = "tech";
  it['client_veterinario'] = "veterinario";
  it['client_beauty2'] = "beauty";
  it['client_cultura'] = "cultura";
  it['client_servizi'] = "servizi";
  it['client_mestiere'] = "mestiere";

  // --- Client tone ---
  it['tone_ristorante'] = "caldo, tradizionale, familiare";
  it['tone_legale'] = "autorevole, professionale, fiducia";
  it['tone_fashion'] = "elegante, femminile, aspirazionale";
  it['tone_fitness'] = "energico, motivante, diretto";
  it['tone_fotografo'] = "artistico, minimal, emozionale";
  it['tone_turismo'] = "sognante, rilassante, autentico";
  it['tone_salute'] = "fiducioso, competente, vicino";
  it['tone_artigiano'] = "autentico, artigianale, unico";
  it['tone_educazione'] = "educativo, appassionato, accessibile";
  it['tone_botanica'] = "naturale, verde, cura";
  it['tone_architettura'] = "minimal, sofisticato, visionario";
  it['tone_beauty'] = "pulito, etico, consapevole";
  it['tone_no_profit'] = "ispirante, urgente, comunitario";
  it['tone_food'] = "gustoso, colorato, divertente";
  it['tone_tech'] = "innovativo, diretto, datato";
  it['tone_veterinario'] = "affettuoso, competente, rassicurante";
  it['tone_beauty2'] = "trendy, creativo, sociale";
  it['tone_cultura'] = "culturale, caldo, curioso";
  it['tone_servizi'] = "rassicurante, pratico, accessibile";
  it['tone_mestiere'] = "onesto, preciso, tradizionale";

  // --- Client needs ---
  it['need_social_media'] = "Social Media";
  it['need_menu_design'] = "Menu design";
  it['need_foto_piatti'] = "Foto piatti";
  it['need_sito_web'] = "Sito web";
  it['need_branding'] = "Branding";
  it['need_linkedin'] = "LinkedIn";
  it['need_instagram'] = "Instagram";
  it['need_collaborazioni'] = "Collaborazioni";
  it['need_e_commerce'] = "E-commerce";
  it['need_tiktok'] = "TikTok";
  it['need_reels'] = "Reels";
  it['need_community'] = "Community";
  it['need_portfolio'] = "Portfolio";
  it['need_seo'] = "SEO";
  it['need_booking'] = "Booking";
  it['need_tripadvisor'] = "TripAdvisor";
  it['need_google_my_business'] = "Google My Business";
  it['need_facebook'] = "Facebook";
  it['need_consulenze'] = "Consulenze";
  it['need_marketplace'] = "Marketplace";
  it['need_storia_del_brand'] = "Storia del brand";
  it['need_youtube'] = "YouTube";
  it['need_workshop'] = "Workshop";
  it['need_newsletter'] = "Newsletter";
  it['need_eventi'] = "Eventi";
  it['need_pr'] = "PR";
  it['need_influencer'] = "Influencer";
  it['need_social'] = "Social";
  it['need_donazioni'] = "Donazioni";
  it['need_campagne'] = "Campagne";
  it['need_google'] = "Google";
  it['need_loyalty'] = "Loyalty";
  it['need_content'] = "Content";
  it['need_ads'] = "Ads";
  it['need_recensioni'] = "Recensioni";
  it['need_passaparola'] = "Passaparola";
  it['need_video'] = "Video";

  // --- Minigame question/option labels ---
  // Exposure minigame labels
  it['exp_label_clean'] = "Pulito";
  it['exp_label_medium'] = "Media";
  it['exp_label_still'] = "Fermo";
  it['exp_slider_iso'] = "ISO";
  it['exp_slider_aperture'] = "f/ Apertura";
  it['exp_slider_shutter'] = "Tempo (ms)";

  // Light scenarios
  it['light_midday'] = "🌞 Mezzogiosto d'estate, spiaggia";
  it['light_sunset'] = "🌅 Tramonto sul mare";
  it['light_overcast'] = "☁️ Giorno coperto, parco";
  it['light_candle'] = "🕯️ Ristorante con candele";
  it['light_wedding'] = "👰 Matrimonio in chiesa";

  // Composizione targets
  it['comp_target_left_top'] = "Terzo sinistro-alto";
  it['comp_target_right_top'] = "Terzo destro-alto";
  it['comp_target_left_bottom'] = "Terzo sinistro-basso";
  it['comp_target_right_bottom'] = "Terzo destro-basso";

  // Content hooks
  it['hook_photo_studio'] = "Post per uno studio fotografico — B&W portraits";
  it['hook_reel_bts'] = "Reel Instagram — Dietro le quinte di un servizio";
  it['hook_tiktok_tutorial'] = "TikTok — Tutorial fotografia";
  it['hook_linkedin_case'] = "Post LinkedIn — Caso studio marketing";

  // Community crises
  it['crisis_negative_review'] = "Un cliente pubblica una recensione negativa: \"Servizio pessimo, foto sfocate, mai più\"";
  it['crisis_tone_deaf'] = "Un post viene accusato di essere \"tone-deaf\" su un tema sociale";
  it['crisis_copycat'] = "Un competitor copia il tuo contenuto originale";

  // Analytics questions
  it['analytics_q1'] = "Reach: 10.000 | Impressions: 50.000. Cosa significa?";
  it['analytics_q2'] = "CTR della campagna: 0.5%. È buono?";
  it['analytics_q3'] = "Spesa: €1000 | Ricavi: €4000. Qual è il ROAS?";
  it['analytics_q4'] = "Un post ha ER 8% con 1000 follower. È meglio di uno con ER 2% e 100K follower?";

  // Marketing Mix Ps
  it['mp_product'] = "📦 Product";
  it['mp_price'] = "💰 Price";
  it['mp_place'] = "🏪 Place";
  it['mp_promotion'] = "📢 Promotion";
  it['mp_people'] = "👥 People";
  it['mp_process'] = "⚙️ Process";
  it['mp_physical'] = "📋 Physical Evidence";

  // Brand positioning
  it['brand_lowcost'] = "Scatto Low-Cost";
  it['brand_leica'] = "Studio Leica";
  it['brand_ai'] = "Fotoritocco AI";
  it['brand_olga'] = "Lo Studio Olga";

  // Funnel stages
  it['funnel_tofu'] = "TOFU: Awareness";
  it['funnel_mofu'] = "MOFU: Consideration";
  it['funnel_bofu'] = "BOFU: Decision";
  it['funnel_retention'] = "Retention";

  // Persuasion questions
  it['pers_q_reciprocity'] = "Quale copy usa la RECIPROCITÀ di Cialdini?";
  it['pers_q_social_proof'] = "Quale copy usa la PROVA SOCIALE?";
  it['pers_q_scarcity'] = "Quale copy usa la SCARSITÀ?";
  it['pers_q_awareness'] = "Quale copy è adatto a chi è CONSAPEVOLE DEL PROBLEMA?";

  // --- New Chapter titles ---
  it['next_chapter'] = "Prossimo capitolo";

  // --- Meta ---
  it['meta_description'] = "Esposta: fotografia, social media e marketing — impara attraverso l'archivio di Nonna Olga. PWA installabile.";
})();

/* ================================================================
   ENGLISH — UI strings
   ================================================================ */
(function() {
  const en = window.TRANSLATIONS.en;

  // --- Menu ---
  en['menu_subtitle'] = "From the darkroom to the digital agency. Nonna Olga's archive teaches you the complete art.";
  en['menu_continue'] = "Continue";
  en['menu_continue_from'] = "Continue from Ch.";
  en['menu_restart'] = "Restart from Chapter 1";
  en['menu_start'] = "Start the Archive 📸";
  en['menu_agency'] = "🏢 The Infinite Agency";
  en['menu_reset'] = "🗑️ Full Reset";
  en['menu_reset_confirm'] = "Do you really want to reset?";

  // --- Navigation ---
  en['nav_back'] = "🏠";
  en['nav_back_title'] = "Menu";

  // --- Story ---
  en['story_next'] = "Next";
  en['story_skip'] = "⏭️ Skip";
  en['story_start_chapter'] = "Start the Chapter!";
  en['story_speaker_zio'] = "Uncle Peppe";
  en['story_speaker_nonna'] = "Nonna Olga's Notes";
  en['story_speaker_filtro'] = "Green Filter";
  en['story_speaker_narratore'] = "Narrator";

  // --- Concept overlay ---
  en['concept_close'] = "Close ✕";
  en['concept_next'] = "Next →";
  en['concept_prefix'] = "📚 ";

  // --- Case study ---
  en['case_prefix'] = "📋 Real Case: ";
  en['case_lesson'] = "Lesson";
  en['case_metrics'] = "Metrics";
  en['case_source'] = "Source:";

  // --- Modals ---
  en['modal_exam_passed'] = "Exam Passed!";
  en['modal_exam_passed_msg'] = "You're ready to open the agency!";
  en['modal_exam_open_agency'] = "🏢 Open the Agency";
  en['modal_exam_study'] = "More study needed";
  en['modal_exam_retry'] = "🔄 Retry";
  en['modal_exam_retry_msg'] = "Study harder and try again!";
  en['modal_chapter_done'] = "Completed!";
  en['modal_score'] = "Score:";
  en['modal_next_chapter'] = "Next Chapter →";
  en['modal_all_done'] = "Archive Complete!";
  en['modal_all_done_msg'] = "You've completed all chapters! Now you can open the Agency.";
  en['modal_open_agency'] = "🏢 The Infinite Agency";
  en['modal_menu'] = "🏠 Menu";

  // --- Minigames ---
  en['mg_completed'] = "Completed!";
  en['mg_continue'] = "Next →";
  en['mg_esposizione_title'] = "Develop the Negative";
  en['mg_esposizione_sub'] = "Adjust the three sliders to get the correct exposure!";
  en['mg_esposizione_btn'] = "Develop!";
  en['mg_esposizione_perfect'] = "Perfect exposure! The negative is perfect.";
  en['mg_esposizione_retry'] = "The negative is a bit burned/dark. Try again!";
  en['mg_esposizione_noise_high'] = "High noise";
  en['mg_esposizione_noise_mod'] = "Moderate noise";
  en['mg_esposizione_noise_clean'] = "Clean";
  en['mg_esposizione_depth_extreme'] = "Extreme bokeh";
  en['mg_esposizione_depth_medium'] = "Medium";
  en['mg_esposizione_depth_all'] = "Everything in focus";
  en['mg_esposizione_freeze_frozen'] = "Frozen";
  en['mg_esposizione_freeze_still'] = "Still";
  en['mg_esposizione_freeze_trail'] = "Trail/motion blur";
  en['mg_composizione_title'] = "Compose the Scene";
  en['mg_composizione_sub'] = "Drag the subject to the INTERSECTION point of the rule of thirds";
  en['mg_composizione_natural'] = "Natural composition!";
  en['mg_composizione_hint'] = "Try placing the subject on the intersection points.";
  en['mg_composizione_target_left_top'] = "Left-top third";
  en['mg_composizione_target_right_top'] = "Right-top third";
  en['mg_composizione_target_left_bottom'] = "Left-bottom third";
  en['mg_composizione_target_right_bottom'] = "Right-bottom third";
  en['mg_luce_title'] = "Light Hunt";
  en['mg_luce_sub'] = "Choose the right light for each scene";
  en['mg_luce_eye'] = "You have an eye for light!";
  en['mg_luce_practice'] = "Light is a matter of practice.";
  en['mg_momento_title'] = "Shoot at the Right Moment";
  en['mg_momento_sub'] = "Press SHOOT when the cursor is in the golden zone";
  en['mg_momento_btn'] = "📸 SHOOT";
  en['mg_momento_caught'] = "You caught the decisive moment!";
  en['mg_momento_practice'] = "The right instant requires practice.";
  en['mg_algoritmo_title'] = "Beat the Algorithm";
  en['mg_algoritmo_sub'] = "Choose the option the algorithm rewards the most";
  en['mg_algoritmo_loves'] = "The algorithm loves you!";
  en['mg_algoritmo_buries'] = "The feed buries you...";
  en['mg_contenuto_title'] = "Hook in 3 Seconds";
  en['mg_contenuto_sub'] = "Which hook works best?";
  en['mg_contenuto_ninja'] = "You're a hook ninja!";
  en['mg_contenuto_practice'] = "The hook is the first thing that matters.";
  en['mg_community_title'] = "Crisis Management";
  en['mg_community_sub'] = "What do you do?";
  en['mg_community_expert'] = "Expert crisis manager!";
  en['mg_community_practice'] = "Crises are managed with calm and strategy.";
  en['mg_analytics_title'] = "Read the Dashboard";
  en['mg_analytics_sub'] = "Interpret the metrics";
  en['mg_analytics_expert'] = "Expert analyst!";
  en['mg_analytics_practice'] = "Numbers tell stories, if you know how to read them.";
  en['mg_marketing_title'] = "The Perfect Mix";
  en['mg_marketing_sub'] = "What does this P represent?";
  en['mg_marketing_master'] = "Marketing Mix Master!";
  en['mg_marketing_practice'] = "The 7Ps require a holistic vision.";
  en['mg_funnel_title'] = "Build the Funnel";
  en['mg_funnel_sub'] = "Which content goes in";
  en['mg_funnel_confirm'] = "Confirm";
  en['mg_funnel_master'] = "Funnel master!";
  en['mg_funnel_practice'] = "The funnel is a journey, not a box.";
  en['mg_brand_title'] = "Position the Brand";
  en['mg_brand_sub'] = "Where does this brand sit on the perceptual map?";
  en['mg_brand_strategist'] = "Positioning strategist!";
  en['mg_brand_practice'] = "Positioning is the battle for the mind.";
  en['mg_persuasione_title'] = "The Copy That Converts";
  en['mg_persuasione_sub'] = "Identify the right copy";
  en['mg_persuasione_persuasive'] = "Persuasive copy!";
  en['mg_persuasione_practice'] = "Words are weapons: learn to choose them.";
  en['mg_esame_title'] = "Feed Exam";
  en['mg_esame_passed'] = "Exam Passed!";
  en['mg_esame_failed'] = "More study needed";
  en['mg_esame_ready'] = "You're ready to open the agency!";
  en['mg_esame_retry_msg'] = "Review the chapters and try again.";
  en['mg_esame_enter_agency'] = "Enter the Agency 🏢";
  en['mg_esame_retry_btn'] = "Retry 📖";

  // --- Agency ---
  en['agency_title'] = "📸 The Infinite Agency";
  en['agency_reputation'] = "Reputation:";
  en['agency_clients_served'] = "Clients served:";
  en['agency_total_earned'] = "Total earnings:";
  en['agency_no_client'] = "No client in progress. Accept a new brief!";
  en['agency_new_client'] = "New Client 📋";
  en['agency_stats'] = "📊 Agency Stats";
  en['agency_close'] = "Close Agency (see final result)";
  en['agency_sector'] = "Sector:";
  en['agency_budget'] = "Budget:";
  en['agency_difficulty'] = "Difficulty:";
  en['agency_tone'] = "Tone:";
  en['agency_needs'] = "Services needed:";
  en['agency_budget_left'] = "Budget left:";
  en['agency_execute'] = "Run Campaign ✅";
  en['agency_reject'] = "Reject ❌";
  en['agency_campaign_done'] = "Campaign Completed!";
  en['agency_continue'] = "Continue 🏢";
  en['agency_completed'] = "Agency Completed!";
  en['agency_grade'] = "Grade:";
  en['agency_diff_easy'] = "Easy";
  en['agency_diff_medium'] = "Medium";
  en['agency_diff_hard'] = "Hard";

  // --- Agency grades ---
  en['agency_grade_S'] = "Excellent! The client is ecstatic.";
  en['agency_grade_A'] = "Great work! I highly recommend Studio Olga.";
  en['agency_grade_B'] = "Good job. The client is satisfied.";
  en['agency_grade_C'] = "Decent. There was room for improvement.";
  en['agency_grade_D'] = "Disappointing. The client may not return.";

  // --- Client types (agency) ---
  en['client_ristorante'] = "restaurant";
  en['client_legale'] = "legal";
  en['client_fashion'] = "fashion";
  en['client_fitness'] = "fitness";
  en['client_fotografo'] = "photographer";
  en['client_turismo'] = "tourism";
  en['client_salute'] = "health";
  en['client_artigiano'] = "artisan";
  en['client_educazione'] = "education";
  en['client_botanica'] = "botanical";
  en['client_architettura'] = "architecture";
  en['client_beauty'] = "beauty";
  en['client_no_profit'] = "non-profit";
  en['client_food'] = "food";
  en['client_tech'] = "tech";
  en['client_veterinario'] = "veterinary";
  en['client_beauty2'] = "beauty";
  en['client_cultura'] = "culture";
  en['client_servizi'] = "services";
  en['client_mestiere'] = "craft";

  // --- Client tone ---
  en['tone_ristorante'] = "warm, traditional, family-oriented";
  en['tone_legale'] = "authoritative, professional, trustworthy";
  en['tone_fashion'] = "elegant, feminine, aspirational";
  en['tone_fitness'] = "energetic, motivating, direct";
  en['tone_fotografo'] = "artistic, minimal, emotional";
  en['tone_turismo'] = "dreamy, relaxing, authentic";
  en['tone_salute'] = "trustworthy, competent, approachable";
  en['tone_artigiano'] = "authentic, handcrafted, unique";
  en['tone_educazione'] = "educational, passionate, accessible";
  en['tone_botanica'] = "natural, green, nurturing";
  en['tone_architettura'] = "minimal, sophisticated, visionary";
  en['tone_beauty'] = "clean, ethical, conscious";
  en['tone_no_profit'] = "inspiring, urgent, community-driven";
  en['tone_food'] = "tasty, colorful, fun";
  en['tone_tech'] = "innovative, direct, data-driven";
  en['tone_veterinario'] = "caring, competent, reassuring";
  en['tone_beauty2'] = "trendy, creative, social";
  en['tone_cultura'] = "cultural, warm, curious";
  en['tone_servizi'] = "reassuring, practical, accessible";
  en['tone_mestiere'] = "honest, precise, traditional";

  // --- Client needs ---
  en['need_social_media'] = "Social Media";
  en['need_menu_design'] = "Menu design";
  en['need_foto_piatti'] = "Food photography";
  en['need_sito_web'] = "Website";
  en['need_branding'] = "Branding";
  en['need_linkedin'] = "LinkedIn";
  en['need_instagram'] = "Instagram";
  en['need_collaborazioni'] = "Collaborations";
  en['need_e_commerce'] = "E-commerce";
  en['need_tiktok'] = "TikTok";
  en['need_reels'] = "Reels";
  en['need_community'] = "Community";
  en['need_portfolio'] = "Portfolio";
  en['need_seo'] = "SEO";
  en['need_booking'] = "Booking";
  en['need_tripadvisor'] = "TripAdvisor";
  en['need_google_my_business'] = "Google My Business";
  en['need_facebook'] = "Facebook";
  en['need_consulenze'] = "Consulting";
  en['need_marketplace'] = "Marketplace";
  en['need_storia_del_brand'] = "Brand story";
  en['need_youtube'] = "YouTube";
  en['need_workshop'] = "Workshop";
  en['need_newsletter'] = "Newsletter";
  en['need_eventi'] = "Events";
  en['need_pr'] = "PR";
  en['need_influencer'] = "Influencer";
  en['need_social'] = "Social";
  en['need_donazioni'] = "Donations";
  en['need_campagne'] = "Campaigns";
  en['need_google'] = "Google";
  en['need_loyalty'] = "Loyalty";
  en['need_content'] = "Content";
  en['need_ads'] = "Ads";
  en['need_recensioni'] = "Reviews";
  en['need_passaparola'] = "Word of mouth";
  en['need_video'] = "Video";

  // --- Minigame labels ---
  en['exp_label_clean'] = "Clean";
  en['exp_label_medium'] = "Medium";
  en['exp_label_still'] = "Still";
  en['exp_slider_iso'] = "ISO";
  en['exp_slider_aperture'] = "f/ Aperture";
  en['exp_slider_shutter'] = "Shutter (ms)";

  // Light scenarios
  en['light_midday'] = "🌞 Midsummer midday, beach";
  en['light_sunset'] = "🌅 Sunset over the sea";
  en['light_overcast'] = "☁️ Overcast day, park";
  en['light_candle'] = "🕯️ Restaurant with candles";
  en['light_wedding'] = "👰 Wedding in church";

  // Composizione targets
  en['comp_target_left_top'] = "Left-top third";
  en['comp_target_right_top'] = "Right-top third";
  en['comp_target_left_bottom'] = "Left-bottom third";
  en['comp_target_right_bottom'] = "Right-bottom third";

  // Content hooks
  en['hook_photo_studio'] = "Post for a photography studio — B&W portraits";
  en['hook_reel_bts'] = "Instagram Reel — Behind the scenes of a shoot";
  en['hook_tiktok_tutorial'] = "TikTok — Photography tutorial";
  en['hook_linkedin_case'] = "LinkedIn Post — Marketing case study";

  // Community crises
  en['crisis_negative_review'] = "A customer posts a negative review: \"Terrible service, blurry photos, never again\"";
  en['crisis_tone_deaf'] = "A post is accused of being \"tone-deaf\" on a social issue";
  en['crisis_copycat'] = "A competitor copies your original content";

  // Analytics questions
  en['analytics_q1'] = "Reach: 10,000 | Impressions: 50,000. What does it mean?";
  en['analytics_q2'] = "Campaign CTR: 0.5%. Is it good?";
  en['analytics_q3'] = "Spend: $1,000 | Revenue: $4,000. What's the ROAS?";
  en['analytics_q4'] = "A post has 8% ER with 1,000 followers. Is it better than one with 2% ER and 100K followers?";

  // Marketing Mix Ps
  en['mp_product'] = "📦 Product";
  en['mp_price'] = "💰 Price";
  en['mp_place'] = "🏪 Place";
  en['mp_promotion'] = "📢 Promotion";
  en['mp_people'] = "👥 People";
  en['mp_process'] = "⚙️ Process";
  en['mp_physical'] = "📋 Physical Evidence";

  // Brand positioning
  en['brand_lowcost'] = "Budget Snap";
  en['brand_leica'] = "Studio Leica";
  en['brand_ai'] = "AI Photo Edit";
  en['brand_olga'] = "Studio Olga";

  // Funnel stages
  en['funnel_tofu'] = "TOFU: Awareness";
  en['funnel_mofu'] = "MOFU: Consideration";
  en['funnel_bofu'] = "BOFU: Decision";
  en['funnel_retention'] = "Retention";

  // Persuasion questions
  en['pers_q_reciprocity'] = "Which copy uses Cialdini's RECIPROCITY?";
  en['pers_q_social_proof'] = "Which copy uses SOCIAL PROOF?";
  en['pers_q_scarcity'] = "Which copy uses SCARCITY?";
  en['pers_q_awareness'] = "Which copy is suitable for someone AWARE OF THE PROBLEM?";

  en['next_chapter'] = "Next chapter";

  en['meta_description'] = "Esposta: photography, social media and marketing — learn through Nonna Olga's archive. Installable PWA.";

  // ======== STORY DIALOGUE TRANSLATIONS ========
  window.STORYTranslations = {
    en: {
      esposizione: [
        { who:'narratore', text:'The Olga Studio is cold. The walls are covered with black-and-white photographs. A yellowish negative lies on the darkroom table.' },
        { who:'zio', text:'Hey kiddo, see that envelope? The negative is poorly exposed: either too much light or too little. But it\'s not the negative\'s fault — it\'s the photographer\'s fault.' },
        { who:'nonna', text:'"Exposure is the foundation. Every shot is a triangle: ISO (sensor sensitivity), Aperture (how wide the f/ diaphragm opens) and Shutter Speed (how long it stays open). The law of reciprocity links them: EV = log₂(N²/t)." — Nonna Olga\'s Notes, 1987.' },
        { who:'zio', text:'Listen, think of the triangle like a radio volume: ISO is the background noise, aperture is the light faucet, shutter speed is how long you keep the faucet open. Too open = burned photo. Too closed = dark photo.' },
        { who:'nonna', text:'"The aperture: f/1.4 = maximum opening (bokeh, shallow depth of field), f/22 = minimum opening (everything in focus). Standard values: f/1.4, f/2, f/2.8, f/4, f/5.6, f/8, f/11, f/16, f/22. Each stop doubles or halves the light." — Nonna Olga\'s Notes.' },
        { who:'zio', text:'Now you try: adjust the three sliders to get a perfect exposure! The negative won\'t wait!' }
      ],
      composizione: [
        { who:'narratore', text:'The first negative developed, another envelope awaits. This one contains a photo of Paris, 1962. Nonna Olga captured a perfect moment.' },
        { who:'zio', text:'Look at how she framed it: the subject isn\'t in the center, but on the right line. There\'s space in front of it, as if looking toward something. It\'s the composition that makes the difference.' },
        { who:'nonna', text:'"The rule of thirds: dividing the frame into 9 sections with 2 horizontal and 2 vertical lines. The intersection points are the zones of maximum visual attention. Cartier-Bresson: \'Composition is the most continuous form of attention.\'"' },
        { who:'nonna', text:'"The golden ratio (φ ≈ 1.618) is the proportion the human eye naturally finds harmonious. It\'s the basis of the Fibonacci spiral, used by Leonardo and MoMA photographers."' },
        { who:'zio', text:'Think of it this way: leading lines guide the viewer\'s eye toward the subject. A path, a fence, a river... they\'re invisible arrows in the photo!' }
      ],
      luce: [
        { who:'narratore', text:'The third envelope contains a photo of a square at sunset. The light wraps everything in gold.' },
        { who:'zio', text:'Light changes EVERYTHING. At noon the sun beats straight down: hard shadows, unflattering skin. At sunset (golden hour) the light becomes warm, soft, almost magical.' },
        { who:'nonna', text:'"Color temperature is measured in Kelvin (K): candle 1800K (orange), sunset 3500K (warm), daylight 5500K (neutral), overcast 7000K (cool), shade 9000K (blue). The camera\'s WB (White Balance) determines how it interprets these values."' },
        { who:'nonna', text:'"Light directions: frontal (flat, little drama), side (texture, volume), backlight (silhouette, backlit), rim light (halo, separation from background). Side light at 45° is the classic Rembrandt portrait light."' },
        { who:'zio', text:'Next photo: "Wedding, 6:30 PM, garden." Choose the right light and see if you can read Kelvin!' }
      ],
      momento: [
        { who:'narratore', text:'The last envelope of the first act contains an iconic photo: a child jumping over a puddle, with the perfect shadow projected on the wall.' },
        { who:'zio', text:'Nonna took this in Naples, 1968. A single shot, just one. The child in mid-air, the shadow touching the wall, perfect side light. She waited HOURS for that moment.' },
        { who:'nonna', text:'"The decisive moment (l\'instant décisif) of Cartier-Bresson: the simultaneous recognition of the meaning of an event and the precise visual arrangement that gives the appropriate forms their expression." — Henri Cartier-Bresson, "The Decisive Moment" (1952).' },
        { who:'nonna', text:'"Roland Barthes distinguishes Studium (cultural interest, context, technique) from Punctum (the wound, the detail that pierces you). The punctum cannot be designed — it happens." — "Camera Lucida" (1980).' },
        { who:'nonna', text:'"Susan Sontag: \'To photograph is to appropriate the thing photographed. It means establishing with it an intimacy that resembles knowledge — or love.\'" — "On Photography" (1977).' }
      ],
      algoritmo: [
        { who:'narratore', text:'The negative is developed. But in 2025, photos no longer live in the photo album. They live in the FEED. And the feed has an invisible master: the algorithm.' },
        { who:'filtro', text:'Uh, grandpa\'s studio? How vintage! But you know what really matters? THE NUMBERS. I have 50K followers and my post reached 200K people! How many do you have?' },
        { who:'nonna', text:'"The algorithm isn\'t a bad thing: it\'s a sorting system. Every platform (Instagram, TikTok, YouTube) ranks content based on a predictive score: P(interaction) = w₁·like + w₂·comment + w₃·share + w₄·save + w₅·dwell time." — Nonna Olga\'s Notes, 2024.' },
        { who:'zio', text:'In simple terms: the algorithm wants people to stay in the app. If your post keeps people there, the algorithm shows it to more people. If people scroll past, it buries it.' },
        { who:'nonna', text:'"Organic reach vs paid reach: organic is free but limited. Shadowban: when the algorithm penalizes content without warning (spam, off-topic). Virality: K > 1 means each person shares with more than one person."' }
      ],
      contenuto: [
        { who:'filtro', text:'But if I post my coffee every morning and people love it, why do I need to think about "content pillars"?' },
        { who:'nonna', text:'"Content pillars are the 3-5 thematic categories that define your account. Every post must belong to a pillar. Example for a photography studio: Portraits, Behind the Scenes, Tutorials, Client Stories, Retrospectives."' },
        { who:'zio', text:'And the most important thing: the FIRST 3 SECONDS. If you don\'t hook them immediately, people scroll past. Like a newspaper headline: it has to be magnetic!' },
        { who:'nonna', text:'"Jonah Berger, Contagious (2013): content that spreads shares STEPPS — Social Currency (you seem cool), Triggers (reminds you of something), Emotion (strong feeling), Public (visible), Practical Value (useful), Stories (narrative)."' }
      ],
      community: [
        { who:'filtro', text:'Hey, I have 10K comments! ...wait, they\'re all "🔥🔥🔥" and "DM me". Is this engagement?' },
        { who:'nonna', text:'"Engagement rate = (total interactions / reach) × 100. An ER of 3-6% on Instagram is good. But quality > quantity: 10 meaningful comments are worth more than 1000 emojis."' },
        { who:'zio', text:'And when things go wrong? Remember the Barilla case in 2013? The CEO said they would never advertise with same-sex couples. The web exploded. Barilla lost 22% of revenue in 24 hours.' },
        { who:'nonna', text:'"Kevin Kelly, 1000 True Fans (2008): you don\'t need millions of followers. You need 1000 people who buy EVERYTHING you produce. Retention beats acquisition."' },
        { who:'nonna', text:'"UGC (User Generated Content): user-created content is 6.9x more engaging than brand content. But it requires permission and credibility. Ethics: don\'t appropriate others\' work."' }
      ],
      analytics: [
        { who:'zio', text:'The dashboard of Filtro Verde\'s agency is open. Look at his metrics... they\'re inflated like a balloon.' },
        { who:'nonna', text:'"REACH = unique people reached. IMPRESSIONS = total times shown (one person can see the same post 5 times). A photo with 10K reach and 50K impressions has an impression/reach ratio of 5: the content was seen on average 5 times."' },
        { who:'nonna', text:'"CTR (Click-Through Rate) = clicks / impressions × 100. CPM (Cost Per Mille) = cost / impressions × 1000. CPC (Cost Per Click) = cost / clicks. ROAS (Return On Ad Spend) = revenue / ad spend. A ROAS of 4:1 means €4 revenue for every €1 spent."' },
        { who:'zio', text:'In practice: reach tells you HOW MANY people you touched. CTR tells you HOW MANY took action. ROAS tells you IF it was worth it.' }
      ],
      marketing_mix: [
        { who:'narratore', text:'The second act is over. Studio Olga has a digital presence. But to survive it needs a STRATEGY. This is where Philip Kotler comes in.' },
        { who:'nonna', text:'"The 7P Marketing Mix (Booms & Bitner, 1981, extension of McCarthy\'s 4P 1960): Product (what you sell), Price (what it costs), Place (where to find it), Promotion (how you communicate it), People (who sells it), Process (how it\'s delivered), Physical evidence (tangible proof)."' },
        { who:'zio', text:'For Studio Olga: Product = photography packages; Price = €200/€500/€1000; Place = studio + online; Promotion = social + word of mouth; People = us; Process = booking→shoot→editing→delivery; Evidence = portfolio, reviews, certificates.' },
        { who:'nonna', text:'"Price is never just a number: it\'s a SIGNAL. High price = perceived quality. Low price = volume. The sweet spot is where perceived value exceeds the price paid." — Kotler & Armstrong, "Principles of Marketing" (2021).' }
      ],
      funnel: [
        { who:'nonna', text:'"The marketing funnel: TOFU (Top of Funnel) = Awareness — the customer discovers you exist. MOFU (Middle) = Consideration — they evaluate options. BOFU (Bottom) = Decision — they choose you."' },
        { who:'zio', text:'Think of the studio gallery: 100 people enter (TOFU), 30 ask for info (MOFU), 10 book (BOFU), 5 become regular clients (retention).' },
        { who:'nonna', text:'"AIDA: Attention, Interest, Desire, Action — the model by Elias St. Elmo Lewis (1898). Still valid. Every piece of content must capture ATTENTION, spark INTEREST, create DESIRE, and drive ACTION."' },
        { who:'nonna', text:'"Attribution models: last-click (gives 100% to the final touchpoint), linear (divided equally), time-decay (more weight to recent touches). The right one depends on the business."' }
      ],
      brand: [
        { who:'filtro', text:'My brand is: yo I\'m cool and people follow me. Done, right?' },
        { who:'nonna', text:'"POSITIONING (Ries & Trout, 1981) is the position you occupy in the customer\'s MIND. It\'s not what you are, it\'s what you REPRESENT in people\'s heads compared to competitors."' },
        { who:'nonna', text:'"USP (Unique Selling Proposition, Rosser Reeves 1961): what is the UNIQUE ADVANTAGE only YOU can offer? It must be: 1) unique, 2) relevant, 3) credible."' },
        { who:'zio', text:'For Studio Olga, the USP could be: "Portraits that become memories that become family." We don\'t sell photos, we sell memory.' },
        { who:'nonna', text:'"Byron Sharp, "How Brands Grow" (2010): brands grow with MENTAL AVAILABILITY (they come to mind) and PHYSICAL AVAILABILITY (they\'re easy to find). Familiarity beats loyalty." — Paradigm shifts in modern marketing.' },
        { who:'nonna', text:'"Tone of voice is the brand\'s personality in writing. It\'s not just "what you say" but "how you say it." It must be consistent across every touchpoint: posts, emails, comment replies, delivery notes."' }
      ],
      persuasione: [
        { who:'narratore', text:'The final chapter. The archive is almost complete. Nonna Olga had one last note on persuasion.' },
        { who:'nonna', text:'"Robert Cialdini, The Weapons of Persuasion (1984): RECIPROCITY (give first), COMMITMENT (gradual engagement), SOCIAL PROOF (others do it), AUTHORITY (expert), LIKING (I like you), SCARCITY (few left). In 2025: + AWARENESS."' },
        { who:'nonna', text:'"David Ogilvy: \'Never write a headline that doesn\'t promise something useful to the reader.\' Copywriting is selling with words. Every word must earn its place."' },
        { who:'nonna', text:'"Eugene Schwartz, 5 levels of awareness: 1) Unaware (doesn\'t know they have a problem), 2) Problem-aware, 3) Solution-aware, 4) Product-aware, 5) Most aware (ready to buy). The copy must adapt to the level."' },
        { who:'zio', text:'A/B test: publish TWO versions of the same post with one different variable (headline, image, CTA). The one that performs better wins. No assumptions: only data!' }
      ],
      esame: [
        { who:'narratore', text:'The archive is complete. But Nonna Olga had prepared one last test: The Feed Exam. Eighteen questions on everything you\'ve learned. From photography to social media to marketing, with real cases.' },
        { who:'zio', text:'This is the moment of truth, kiddo. All the tools you\'ve received... now use them. Nonna wanted you to be ready.' },
        { who:'nonna', text:'"Knowledge without application is just an encyclopedia. The exam verifies that you can USE what you\'ve learned. Good luck." — Nonna Olga\'s last note.' },
        { who:'filtro', text:'...good luck indeed. You\'ve gotten good. I even learned something watching you.' }
      ]
    }
  };

  // ======== CONCEPT TRANSLATIONS ========
  window.CONCEPTSTranslations = {
    en: {
      esposizione: [
        {
          title: 'The Exposure Triangle',
          body: `<b>Exposure</b> is the total amount of light reaching the sensor/film. The Photography Triangle consists of three interdependent variables:
<br><br><span class="c-term">ISO</span> — Sensor sensitivity to light. ISO 100 = low sensitivity (maximum quality), ISO 3200+ = high sensitivity (grainy). Each stop doubles the sensitivity.
<br><br><span class="c-term">Aperture (f/)</span> — Diaphragm opening in the lens. f/1.4 = maximum opening (lots of light, shallow depth of field). f/22 = minimum opening (little light, entire scene in focus). Standard values form a geometric sequence: each step halves the light.
<br><br><span class="c-term">Shutter Speed (T)</span> — Duration the shutter stays open. 1/1000s = motion freeze. 30s = light trail (light painting, stars). Each stop doubles/halves the time.
<br><br><span class="c-formula">EV = log₂(N² / t) where N = f-number, t = time in seconds</span>
<br><br>The <b>Law of Reciprocity</b> says: if you double the aperture (f/4 → f/2.8), you can halve the shutter speed while maintaining the same exposure. This means there are many combinations for the same exposure — and EACH produces a different result.
<br><br><span class="c-paper">Source: Ansel Adams, "The Camera" (1980), ch. III — System Approach to Exposure</span>`
        },
        {
          title: 'Adams Zone System',
          body: `<b>Ansel Adams</b> developed the <b>Zone System</b>: a scale of 11 zones (0 = pure black, X = pure white) for precise control of exposure and printing.
<br><br>Zone V is 18% gray — the midpoint that camera light meters use as reference.
<br><br>How to use it: if your subject is in Zone III (detailed shadow), you can underexpose by 2 stops relative to middle gray to maintain shadow detail.
<br><br><b>ETTR</b> (Expose To The Right) is the modern digital technique: expose as much as possible without clipping highlights, then correct in post. More highlight detail means less noise.
<br><br><span class="c-paper">Source: Ansel Adams, "The Negative" (1981), Zone System</span>`
        },
        {
          title: 'Digital vs Analog Exposure',
          body: `<b>Reciprocity in analog</b>: for long exposures (>1s), film loses sensitivity. Corrections of +0.5/+1 stop are needed.
<br><br><b>In digital</b>: the CCD/CMOS sensor has a linear response. There's no reciprocity loss, but there's <b>clipping</b>: burned pixels (255,255,255) CANNOT be recovered.
<br><br><b>Bracketing</b>: shooting 3-5 photos at different exposures (-2, -1, 0, +1, +2 EV) and merging them into <b>HDR</b> (High Dynamic Range). RAW is essential: it contains 12-14 stops of range vs the 8 of JPEG.
<br><br><span class="c-paper">Source: Michael Freeman, "The Photographer's Eye" (2007), ch. Exposure</span>`
        }
      ],
      composizione: [
        {
          title: 'Rule of Thirds and Golden Ratio',
          body: `The <b>Rule of Thirds</b> divides the image into 9 sections with 2 horizontal and 2 vertical lines. The 4 intersection points are the <b>zones of maximum visual attention</b>.
<br><br>The <b>Golden Ratio</b> (φ ≈ 1.618) is the proportion the human eye naturally finds harmonious. The <b>Fibonacci Spiral</b> is its visual representation: the subject is positioned where the spiral converges.
<br><br>Practical difference: the Thirds are a simplification of the Golden Ratio. For most photos, the Thirds suffice. For more sophisticated compositions (architecture, landscapes), the Golden Ratio produces more elegant results.
<br><br><span class="c-quote">"Composition is the most continuous form of attention." — Henri Cartier-Bresson</span>
<br><br><span class="c-paper">Source: Michael Freeman, "The Photographer's Eye" (2007)</span>`
        },
        {
          title: 'Leading Lines and Depth',
          body: `<b>Leading lines</b> are image elements (roads, fences, rivers, buildings) that guide the viewer's eye toward the subject.
<br><br><b>Converging</b> lines: create perspective depth (narrowing roads). <b>Curved</b> lines: fluid movement, naturalness. <b>Diagonal</b> lines: energy, dynamism.
<br><br><b>Layering</b> (overlapping planes) creates depth: foreground (near element), midground (subject), background (context).
<br><br><span class="c-paper">Source: Michael Freeman, "The Photographer's Composition" (2010)</span>`
        },
        {
          title: 'Negative Space and Minimalism',
          body: `<b>Negative space</b> is the "empty" area around the subject. It's not wasted: it gives the image breathing room and isolates the subject.
<br><br>In portraits, the empty space in front of the subject (lead room/nose room) creates a sense of direction and movement.
<br><br><b>Minimalist photography</b> uses negative space as the protagonist element: a bird on a bare branch, a shadow on a white wall.
<br><br><span class="c-quote">"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupéry</span>`
        }
      ],
      luce: [
        {
          title: 'Color Temperature and Kelvin',
          body: `<b>Color temperature</b> is measured in Kelvin (K) and describes the color of light:
<br><br><span class="c-formula">1800K → Candle (deep orange)
2700K → Sunrise/Sunset (warm)
3500K → Domestic light (ambient)
5500K → Direct sun (neutral)
6500K → Overcast day (cool)
7500K → Shade (bluish)
9000K → Clear sky in shade (cold blue)</span>
<br><br>The camera's <b>White Balance</b> (WB) compensates for these differences. Auto WB works well 90% of the time, but for creative control use manual WB or shoot in RAW.
<br><br><span class="c-paper">Source: Ernst Haas, "Color Correction" (1971)</span>`
        },
        {
          title: 'Direction of Light',
          body: `<b>Frontal</b>: light straight on the subject. Flat, few shadows. Used for beauty/fashion where makeup matters.
<br><br><b>Side (45°)</b>: creates volume and texture. Rembrandt light: triangle shadow under the opposite eye. Ideal for dramatic portraits.
<br><br><b>Backlight</b>: light comes from behind the subject. Creates silhouette or "backlit" effect with golden halo. Watch out for flare!
<br><br><b>Rim light</b>: light from behind that creates a luminous outline, separating subject from background. Essential in professional shoots.
<br><br><b>Hard vs Soft</b>: depends on the light source size relative to the subject. Sun = hard (sharp shadows). Softbox/clouds = soft (gradual shadows).
<br><br><span class="c-paper">Source: John S. Freedman, "Light: Science & Magic" (2020)</span>`
        },
        {
          title: 'Golden Hour and Blue Hour',
          body: `<b>Golden Hour</b>: the 30-40 minutes after sunrise or before sunset. The light is low, warm, soft. Shadows are long and creative.
<br><br><b>Blue Hour</b>: the 20-30 minutes before sunrise or after sunset. Tones are cool, blue, ethereal. Ideal for architecture and urban landscapes.
<br><br>Why they work: the atmosphere filters wavelengths. At noon, light is white/dry. At sunset, the path through the atmosphere is longer → blue frequencies dissipate → orange/red remains.
<br><br><span class="c-paper">Source: Ernst Haas, "Color Correction" (1971)</span>`
        }
      ],
      momento: [
        {
          title: 'The Decisive Moment',
          body: `<span class="c-quote">"Photography is the simultaneous recognition, in a fraction of a second, of the significance of an event and of the precise visual arrangement that gives the appropriate forms their expression." — Henri Cartier-Bresson, "The Decisive Moment" (1952)</span>
<br><br>Cartier-Bresson saw photography as an <b>act of instant geometry</b>: composition and moment fuse in an unrepeatable instant.
<br><br>The lesson: you can prepare the composition, the light, the equipment. But the moment? That is a gift from the universe. That's why great photographers dedicate HOURS to waiting.
<br><br><span class="c-paper">Source: Henri Cartier-Bresson, "Images à la Sauvette" (1952)</span>`
        },
        {
          title: 'Punctum and Studium (Barthes)',
          body: `<span class="c-quote">"The Studium is always covered by the photographer's intention... The Punctum is: what pricks, it's a detail that pierces." — Roland Barthes, "Camera Lucida" (1980)</span>
<br><br><b>Studium</b>: cultural interest, technique, context. It's what you "understand" about the photo. You can explain it.
<br><br><b>Punctum</b>: the emotional wound. The unexpected detail that strikes you without knowing why. It cannot be designed — it happens. A untied shoe, a dust grain on the lens, an involuntary expression.
<br><br><span class="c-paper">Source: Roland Barthes, "La Chambre Claire" (1980)</span>`
        },
        {
          title: 'Photography and Power (Sontag)',
          body: `<span class="c-quote">"To photograph is to appropriate the thing photographed. It means establishing with it a relationship that resembles knowledge — or love." — Susan Sontag, "On Photography" (1977)</span>
<br><br>Sontag sees photography as an <b>act of power</b>: the photographer decides what gets seen, what gets remembered, what gets forgotten.
<br><br>In the digital age this concept is amplified: every selfie, every post, every story is an act of appropriating reality. The <b>ethical dimension</b>: image rights, privacy, using others' photos.
<br><br><span class="c-paper">Source: Susan Sontag, "On Photography" (1977)</span>`
        }
      ],
      algoritmo: [
        {
          title: 'How the Feed Algorithm Works',
          body: `Every social platform uses a <b>ranking</b> system to decide what to show. Simplified model:
<br><br><span class="c-formula">P(interaction) = w₁·like + w₂·comment + w₃·share + w₄·save + w₅·dwell time</span>
<br><br><b>Key factors in 2025</b>:
<br>• <b>Saves</b> and <b>shares</b> weigh MORE than likes
<br>• <b>Dwell time</b> is the strongest signal for Reels
<br>• <b>Initial velocity</b>: the first 30-60 minutes determine distribution
<br>• <b>"Fresh" accounts</b> often receive an initial boost
<br><br><span class="c-paper">Source: Instagram Engineering Blog (2023); TikTok Research (2024)</span>`
        },
        {
          title: 'Organic vs Paid Reach',
          body: `<b>Organic reach</b>: how many people you reach without paying. Instagram 2025: ~5-10% of followers (was 26% in 2016). TikTok: higher, ~20-30%.
<br><br><b>Paid reach</b>: ads, sponsored posts, partnerships. Measured in <b>CPM</b> (cost per 1000 impressions). Instagram: ~€6-12 CPM. TikTok: ~€3-8 CPM.
<br><br><b>Shadowban</b>: feed penalty without notification. Causes: content violating guidelines, banned hashtags, spam behavior. Lasts days to weeks.
<br><br><span class="c-paper">Source: Hootsuite Digital Trends Report (2025)</span>`
        },
        {
          title: 'Virality and Diffusion Coefficient',
          body: `<b>Virality</b> is measured with the <b>K coefficient</b>:
<br><br><span class="c-formula">K = average number of invites × conversion rate</span>
<br><br>If K > 1, each person shares with more than one person who converts → exponential growth.
<br><br>If K < 1, diffusion dies out → the content dies.
<br><br><b>Why some posts go viral</b>: often it's the combination of emotionally charged content + perfect timing + right platform. There's no universal formula, but STEPPS patterns (Berger) increase the odds.
<br><br><span class="c-paper">Source: Jonah Berger, "Contagious: Why Things Catch On" (2013)</span>`
        }
      ],
      contenuto: [
        {
          title: 'Content Pillars and Editorial Strategy',
          body: `<b>Content pillars</b> are the 3-5 fixed thematic categories that define an account. Every post must belong to a pillar.
<br><br><b>Example for a photography studio</b>:
<br>1. 📸 Portraits (completed work)
<br>2. 🎬 Behind the Scenes (making of)
<br>3. 📚 Tutorials (technical tips)
<br>4. 💬 Client Stories (testimonials)
<br>5. 🖼️ Retrospectives (archive)
<br><br>The <b>content calendar</b> plans: when to post what, on which platform, with what format. Consistency beats quantity.
<br><br><span class="c-paper">Source: Joe Pulizzi, "Epic Content Marketing" (2023)</span>`
        },
        {
          title: 'Hook and the Very First Seconds',
          body: `<b>Hook</b> = the catch in the first 3 seconds (Reels/TikTok) or first line (post/text).
<br><br>5 hook techniques:
<br>1. <b>Provocative question</b>: "Did you know 90% of photos are thrown away?"
<br>2. <b>Shock statement</b>: "I lost $5000 in one month of ads"
<br>3. <b>Visual hook</b>: something visually unusual in the first frame
<br>4. <b>Promise</b>: "In 60 seconds I'll show you how..."
<br>5. <b>Storytelling</b>: "Yesterday something absurd happened..."
<br><br><span class="c-quote">"Never write a headline that doesn't promise something useful to the reader." — David Ogilvy</span>
<br><br><span class="c-paper">Source: David Ogilvy, "Confessions of an Advertising Man" (1963)</span>`
        },
        {
          title: 'STEPPS: The Virality Model',
          body: `Jonah Berger identifies 6 factors that make content contagious:
<br><br><b>1. Social Currency</b>: sharing makes you seem cool. "Did you know..." gives exclusive knowledge.
<br><b>2. Triggers</b>: something that reminds you of the product. "Monday = coffee" (English: Monday = Monday).
<br><b>3. Emotion</b>: wonder, anger, excitement. High-activation emotions get shared.
<br><b>4. Public</b>: if everyone does it, everyone does it (bandwagon effect). Visible behavior gets imitated.
<br><b>5. Practical Value</b>: useful tips get shared. "10 ways to..." always works.
<br><b>6. Stories</b>: content is embedded in a narrative. The story is the vehicle, the message is the passenger.
<br><br><span class="c-paper">Source: Jonah Berger, "Contagious" (2013), Wharton School</span>`
        }
      ],
      community: [
        {
          title: 'Engagement Rate and Quality',
          body: `<span class="c-formula">ER = (likes + comments + saves + shares) / reach × 100</span>
<br><br><b>Instagram 2025 benchmarks</b>:
<br>• Micro-influencer (10K-50K): 3-6%
<br>• Mid-tier (50K-500K): 2-4%
<br>• Macro (500K+): 1-2%
<br><br><b>Quality > Quantity</b>: 10 comments with genuine questions are worth more than 1000 emojis. Long comments indicate real engagement.
<br><br><span class="c-paper">Source: Sprout Social Index (2025)</span>`
        },
        {
          title: '1000 True Fans and Retention',
          body: `<span class="c-quote">"You don't need millions of followers. You need 1000 True Fans who buy EVERYTHING you produce." — Kevin Kelly (2008)</span>
<br><br>The math: 1000 fans × €100/year average spend = €100,000/year income. Enough for a small creative business.
<br><br><b>Retention</b> beats <b>acquisition</b>: it costs 5-25x more to acquire a new customer than to retain an existing one.
<br><br>Retention tactics: email list, exclusive communities, early access content, loyalty programs.
<br><br><span class="c-paper">Source: Kevin Kelly, "1000 True Fans" (2008)</span>`
        },
        {
          title: 'UGC and Community Crisis',
          body: `<b>UGC (User Generated Content)</b>: content created by consumers. It's 6.9x more engaging than brand content (Stackla, 2021).
<br><br>But: <b>permission</b> and <b>credibility</b> are required. Appropriating others' work is a legal and reputational risk.
<br><br><b>Crisis management</b>: the 3 golden rules:
<br>1. <b>Respond quickly</b> (< 1 hour in the first 24h)
<br>2. <b>Empathy first</b>, explanation after
<br>3. <b>No beating around the bush</b>: admit, apologize, fix
<br><br>Case study: Barilla 2013 (anti-LGBTQ CEO) → -22% revenue in 24h. Then 2 years of inclusive campaigns to recover.
<br><br><span class="c-paper">Source: Stackla Consumer Content Report (2021)</span>`
        }
      ],
      analytics: [
        {
          title: 'Digital KPIs: The Dictionary',
          body: `<b>REACH</b> = unique people reached
<br><b>IMPRESSIONS</b> = total times shown (1 person can see the same post 5 times)
<br><b>Impression/reach ratio</b> = average frequency. If >3, the content was seen too many times (ad fatigue).
<br><br><b>CTR</b> = clicks / impressions × 100
<br>• Ads: 2-5% is good
<br>• Email: 15-25% is good
<br><br><b>CPM</b> = cost / (impressions / 1000) → cost per 1000 impressions
<br><b>CPC</b> = cost / clicks → cost per single click
<br><b>CPA</b> = cost / conversions → cost per action (purchase, sign-up)
<br><br><span class="c-paper">Source: Google Analytics Documentation (2025)</span>`
        },
        {
          title: 'ROAS and Return on Investment',
          body: `<span class="c-formula">ROAS = Campaign Revenue / Ad Spend</span>
<br><br>• ROAS < 1 = you're losing money
<br>• ROAS = 1 = breaking even
<br>• ROAS = 4 = for every €1 spent, €4 comes back
<br>• ROAS > 5 = excellent (depends on margin)
<br><br><b>ROAS vs ROI</b>: ROAS only measures ad spend. ROI (Return on Investment) includes ALL costs (labor, equipment, software, etc.).
<br><br><span class="c-formula">ROI = (Revenue - Total Cost) / Total Cost × 100</span>
<br><br><span class="c-paper">Source: Kotler & Armstrong, "Principles of Marketing" (2021)</span>`
        }
      ],
      marketing_mix: [
        {
          title: "Kotler's 7Ps",
          body: `<b>Philip Kotler</b> (2021) defines the Marketing Mix as 7 controllable variables:
<br><br><b>1. Product</b>: what do you sell? Not the physical product, but the <b>transformation</b> it offers.
<br><b>2. Price</b>: what does it cost? Not just the number, but the <b>value signal</b>.
<br><b>3. Place</b>: where can it be found? Omnichannel: studio + website + social + marketplace.
<br><b>4. Promotion</b>: how do you communicate it? Ads, social, PR, email, events.
<br><b>5. People</b>: who sells it? The face of the brand is the product.
<br><b>6. Process</b>: how is it delivered? Booking → delivery → follow-up.
<br><b>7. Physical Evidence</b>: tangible proof of value. Portfolio, reviews, certificates, packaging.
<br><br><span class="c-paper">Source: Philip Kotler & Gary Armstrong, "Principles of Marketing" (17th ed., 2021)</span>`
        },
        {
          title: 'Price as Signal',
          body: `Price isn't just a number. It's a <b>signal</b>:
<br><br>• <b>High price</b> → perceived quality, exclusivity (Rolex, Leica)
<br>• <b>Low price</b> → volume, accessibility (IKEA, Ryanair)
<br>• <b>"Charm" price</b>: €99 instead of €100. Still works.
<br>• <b>Decoy effect</b>: 3 options, the middle one is what you want to sell
<br><br>The <b>sweet spot</b>: where <b>perceived value</b> exceeds <b>price paid</b>. If the customer thinks the service is worth €500 and pays €300, they're happy.
<br><br><span class="c-paper">Source: Dan Ariely, "Predictably Irrational" (2008)</span>`
        }
      ],
      funnel: [
        {
          title: 'TOFU / MOFU / BOFU',
          body: `The <b>funnel</b> describes the customer journey:
<br><br><b>TOFU (Top of Funnel)</b> = Awareness
<br>• Goal: get discovered
<br>• Content: blog, educational videos, social posts, SEO
<br>• Metrics: reach, impressions, traffic
<br><br><b>MOFU (Middle of Funnel)</b> = Consideration
<br>• Goal: get evaluated
<br>• Content: case studies, demos, webinars, email nurture
<br>• Metrics: newsletter signups, downloads, time on site
<br><br><b>BOFU (Bottom of Funnel)</b> = Decision
<br>• Goal: get purchased
<br>• Content: offers, testimonials, comparisons, call-to-action
<br>• Metrics: conversions, sales, ROAS
<br><br><span class="c-paper">Source: HubSpot Inbound Marketing (2024)</span>`
        },
        {
          title: 'AIDA: The Classic Model',
          body: `<b>AIDA</b> (Elias St. Elmo Lewis, 1898) — still fundamental:
<br><br><b>A - ATTENTION</b>: capture attention. Visual hook, strong headline, interrupt the scroll.
<br><b>I - INTEREST</b>: spark interest. Talk about the CUSTOMER'S problem, not your product.
<br><b>D - DESIRE</b>: create desire. Show the possible future, transformations, testimonials.
<br><b>A - ACTION</b>: drive action. Clear CTA, urgency, ease of access.
<br><br>Every piece of marketing content should cover at least one of these steps.
<br><br><span class="c-paper">Source: E. St. Elmo Lewis, "Financial Advertising" (1898)</span>`
        },
        {
          title: 'Attribution Models',
          body: `When a customer buys, who gets the credit?
<br><br><b>Last-Click</b>: 100% to the last touchpoint. Simple but unfair (ignores awareness).
<br><b>Linear</b>: divided equally among all touchpoints. Fairer, less precise.
<br><b>Time-Decay</b>: more weight to recent touchpoints. Realistic for short cycles.
<br><b>Position-Based</b>: 40% first, 40% last, 20% middle. Good compromise.
<br><b>Data-Driven</b>: uses ML to assign weight (Google Analytics 4). Most precise.
<br><br><span class="c-paper">Source: Google Analytics 4 Documentation (2025)</span>`
        }
      ],
      brand: [
        {
          title: 'Positioning: The Place in the Mind',
          body: `<b>Al Ries & Jack Trout</b> (1981): positioning is NOT what you do with the product. It's what you do with the customer's <b>MIND</b>.
<br><br>The mind has room for about <b>7 brands per category</b>. The first choice (top of mind) captures 30-40% of the market.
<br><br><b>Positioning strategies</b>:
<br>• <b>Benefit</b>: associate an advantage (Volvo = safety)
<br>• <b>Class</b>: category leader (Ferrari = supercar)
<br>• <b>Use</b>: a specific occasion (Gatorade = sports hydration)
<br>• <b>Competitor</b>: against another brand (Pepsi vs Coca-Cola)
<br><br><span class="c-paper">Source: Al Ries & Jack Trout, "Positioning: The Battle for Your Mind" (1981)</span>`
        },
        {
          title: 'USP and Tone of Voice',
          body: `<b>USP</b> (Unique Selling Proposition, Rosser Reeves 1961):
<br>• <b>Unique</b>: only you can say it
<br>• <b>Relevant</b>: the customer cares about it
<br>• <b>Credible</b>: you can prove it
<br><br><b>Tone of voice</b>: the brand's personality expressed in words. It's not "what you say" but "how you say it".
<br><br>Examples:
<br>• Nike: inspiring, direct, iconic ("Just Do It")
<br>• Innocent Drinks: playful, innocent, ironic
<br>• Studio Olga: warm, technical, affectionate ("photos that become memories")
<br><br><span class="c-paper">Source: Rosser Reeves, "Reality in Advertising" (1961)</span>`
        },
        {
          title: 'Byron Sharp: How Brands Grow',
          body: `<b>Byron Sharp</b> ("How Brands Grow", 2010) revolutionized marketing with empirical data:
<br><br><b>1. MENTAL AVAILABILITY</b>: a brand grows if it comes to mind often in the category.
<br><b>2. PHYSICAL AVAILABILITY</b>: a brand grows if it's easy to find (distribution).
<br><br>Paradigm shift: brand <b>loyalty</b> matters less than <b>familiarity</b>. "Loyal" customers often buy other brands in the same category too.
<br><br>To create <b>memorable assets</b>: easy-to-remember names, distinctive colors, jingles, mascots, repeated slogans. Repetition beats creativity.
<br><br><span class="c-paper">Source: Byron Sharp, "How Brands Grow" (2010), Ehrenberg-Bass Institute</span>`
        }
      ],
      persuasione: [
        {
          title: 'The 6 Weapons of Persuasion',
          body: `<b>Robert Cialdini</b> (1984, updated 2021 with the 7th weapon):
<br><br><b>1. Reciprocity</b>: give first, receive later. A free sample, advice, a gift.
<br><b>2. Commitment & Consistency</b>: commit small, then consistency carries you forward. (Signed disclaimer → easy upsell)
<br><b>3. Social Proof</b>: "others do it." Reviews, numbers, UGC.
<br><b>4. Authority</b>: experts, certifications, awards. "92% of professional photographers recommend..."
<br><b>5. Liking</b>: we trust people we like more. The brand must be "likable".
<br><b>6. Scarcity</b>: "last 3 spots", "offer ends Friday". Fear of missing out (FOMO) is powerful.
<br><b>7. Unity</b> (2021): "we're from the same tribe." Belonging, shared identity.
<br><br><span class="c-paper">Source: Robert Cialdini, "Influence: The Psychology of Persuasion" (1984, 2021 ed.)</span>`
        },
        {
          title: 'Copywriting: Every Word Counts',
          body: `<b>David Ogilvy</b>: rules of effective copywriting:
<br><br>• "Never write a headline that doesn't promise something useful to the reader"
<br>• The headline is 80% of the result. If the headline doesn't work, the rest is wasted.
<br>• Length vs brevity: long sells (if interesting), short engages (if impactful)
<br><br><b>Michael Masterson's 4 U's</b>:
<br>• <b>Useful</b>: useful to the reader
<br>• <b>Urgent</b>: time urgency
<br>• <b>Unique</b>: unique, different
<br>• <b>Ultra-specific</b>: specific, not generic
<br><br><span class="c-quote">"The customer is not an idiot. She's your wife." — David Ogilvy</span>
<br><br><span class="c-paper">Source: David Ogilvy, "Confessions of an Advertising Man" (1963)</span>`
        },
        {
          title: 'The 5 Levels of Awareness',
          body: `<b>Eugene Schwartz</b> ("Breakthrough Advertising", 1966) identifies 5 levels:
<br><br><b>1. Unaware</b>: doesn't know they have a problem. Copy: create awareness of the problem.
<br><b>2. Problem-aware</b>: knows there's a problem but doesn't know the solution. Copy: educate on the solution.
<br><b>3. Solution-aware</b>: knows the solution but not your product. Copy: differentiate from competitors.
<br><b>4. Product-aware</b>: knows your product but isn't convinced. Copy: eliminate objections with proof.
<br><b>5. Most aware</b>: ready to buy. Copy: close with CTA and urgency.
<br><br>The same product requires DIFFERENT copy for each level.
<br><br><span class="c-paper">Source: Eugene Schwartz, "Breakthrough Advertising" (1966)</span>`
        }
      ]
    }
  };

  // ======== CASE STUDY TRANSLATIONS ========
  window.CASESTranslations = {
    en: {
      oreo: {
        brand: 'Oreo',
        year: 2013,
        title: 'The Oreo Super Bowl Tweet',
        story: 'During the 2013 Super Bowl blackout, Oreo tweeted: "Power out? No problem. You can still dunk in the dark." A single tweet, 15,000 retweets, 20,000 likes. Cost: $0.',
        lesson: 'Agility in marketing (real-time marketing) beats millions in budget. But it requires a team ready 24/7 and the freedom to act without 17 levels of approval.',
        metrics: '15K retweets, 20K likes, 8M impressions. Generated more engagement than Oreo\'s $4M Super Bowl campaign.',
        source: 'Ad Age, "Oreo\'s Super Bowl Tweet" (2013)'
      },
      taffo: {
        brand: 'Taffo',
        year: 2017,
        title: 'The Art of Provocation',
        story: 'Taffo revolutionized Italian funeral marketing with provocative campaigns: "Don\'t be cool with the motorcycle, be wise with the helmet" (road safety), "We\'ll put your ashes in Nutella" (ironic communication). Turned a taboo into conversation.',
        lesson: 'Irony can break enormous cultural barriers, but it takes courage and deep knowledge of your audience. The "right tone" is everything.',
        metrics: '+300% website traffic in 6 months. Free national media coverage worth millions of euros.',
        source: 'Marketing Arena (2017); Corriere della Sera'
      },
      als_ice: {
        brand: 'ALS Association',
        year: 2014,
        title: 'The Ice Bucket Challenge',
        story: 'The ice bucket challenge raised $115M for ALS research. Pete Frates, a former baseball player with ALS, launched it. The magic: personal engagement + social challenge + chain tagging.',
        lesson: 'Social proof + emotional engagement + ease of participation = winning formula. Experiential marketing beats traditional marketing.',
        metrics: '$115M raised, 17M videos uploaded, 440M views. The most successful viral fundraising campaign in history.',
        source: 'ALS Association Annual Report (2015)'
      },
      barilla: {
        brand: 'Barilla',
        year: 2013,
        title: 'The Homophobia Crisis',
        story: 'CEO Guido Barilla said on radio: "We will never advertise with same-sex couples; if they like another brand\'s pasta, buon appetito." The web exploded: boycott, #boycottbarilla hashtag, global protests. In 24 hours: -22% of revenue.',
        lesson: 'A statement can destroy a brand. The 3 R\'s of crisis management: Recognize (admit immediately), Regret (genuinely apologize), Remedy (fix with concrete actions). Barilla took 2 years with LGBTQ+ campaigns to recover.',
        metrics: '-22% revenue in 24h, then 2 years of recovery with Pride campaigns, LGBTQ+ organization partnerships.',
        source: 'Bloomberg (2013); Ad Age'
      },
      ferragni: {
        brand: 'Chiara Ferragni / Balocco',
        year: 2023,
        title: 'The Pandoro Gate',
        story: 'Ferragni promoted a "charitable" Balocco pandoro: making people believe proceeds went to charity. Investigations revealed only €1 per 40,000 pandoro sold went to the cause. ANTITRUST fined Balocco. Ferragni lost 50% of followers.',
        lesson: 'Transparency is non-negotiable. "Purpose washing" (pretending to have a social purpose) is the capital sin of modern marketing. Trust takes years to build and minutes to destroy.',
        metrics: '-50% followers, ANTITRUST fine, loss of premium brand partnerships. Estimated reputational damage >€10M.',
        source: 'Il Sole 24 Ore (2023); AGCM (Autorità Garante)'
      },
      ryanair: {
        brand: 'Ryanair',
        year: 2020,
        title: 'The Genius TikTok',
        story: 'Ryanair created a TikTok account with the airplane as the protagonist, using trending audio and self-deprecating humor: "When the average user complains about baggage fees." Reached 2M followers in a few months.',
        lesson: 'A brand can be human, ironic, and authentic. You don\'t need to be "serious" to be credible. TikTok rewards creativity over budget.',
        metrics: '2M+ TikTok followers in 6 months, videos with 50M+ views. Estimated cost: $0 (in-house management).',
        source: 'Social Media Today (2021)'
      },
      dove: {
        brand: 'Dove (Unilever)',
        year: 2004,
        title: 'Real Beauty',
        story: 'The "Real Beauty" campaign challenged traditional beauty standards using "regular" models. In 20 years it became one of the most recognizable campaigns in the world. Generated a 700% increase in sales over 10 years.',
        lesson: 'Purpose-driven marketing works when it\'s authentic and consistent. Dove didn\'t run a campaign: it created a movement. Long-term consistency beats short-term trends.',
        metrics: '+700% sales in 10 years (2004-2014). #RealBeauty: 6M+ Instagram posts.',
        source: 'Harvard Business Review (2017); Unilever Annual Report'
      },
      coca_cola: {
        brand: 'Coca-Cola',
        year: 2011,
        title: 'Share a Coke',
        story: 'Coca-Cola replaced the logo with 250 common names on cans. "Find your name." People searched for their name, bought it, shared it. Turned a mass product into something personal.',
        lesson: 'Personalization scales. When the product becomes "yours" (with your name), the relationship changes. 1:1 marketing is possible even in mass production.',
        metrics: '+2% sales after 10 years of decline. +7% market share among under-25s in UK.',
        source: 'Coca-Cola Company Report (2012); Ad Age'
      },
      nike: {
        brand: 'Nike',
        year: 2018,
        title: 'Kaepernick - Believe in Something',
        story: 'Nike put Colin Kaepernick (the NFL player who took a "knee" against racism) in a campaign: "Believe in something. Even if it means sacrificing everything." Followed by: boycotts, burned shoes. Final result: +31% online sales.',
        lesson: 'Taking a stand (branded activism) is a calculated risk. Nike studied its audience: the core target (young, urban, African American) approved. Sales to boomers burning shoes didn\'t matter.',
        metrics: '+31% online sales in the 3 days following. +$6M in market value in one year.',
        source: 'Fortune (2018); Edison Trends'
      },
      nyx: {
        brand: 'NYX Professional Makeup',
        year: 2019,
        title: 'UGC as a Sales Engine',
        story: 'NYX created the "#InstaOfNYX" program: every post with the hashtag was recreated as official content. Followers became brand models. Free content + maximum engagement.',
        lesson: 'UGC is 6.9x more engaging than brand content (Stackla). The consumer is the best testimonial. You just need to give them a stage.',
        metrics: '+40% engagement rate on Instagram. -30% content production costs.',
        source: 'Stackla Consumer Content Report (2021)'
      },
      apple: {
        brand: 'Apple',
        year: 2018,
        title: 'Shot on iPhone',
        story: 'Apple asked customers for the best photos taken with iPhone. The best became billboards worldwide. Zero production costs, millions of conversions.',
        lesson: 'The customer is the best creative. UGC at scale turns customers into ambassadors. The simplicity of the concept ("Shot on iPhone") is its strength.',
        metrics: '29M+ posts with #ShotOniPhone. Global campaign with billboards in 80+ countries.',
        source: 'Apple Press Release (2015-2024)'
      },
      airbnb: {
        brand: 'Airbnb',
        year: 2015,
        title: 'Content Marketing as Product',
        story: 'Airbnb doesn\'t sell lodging: it sells stories. Their blog "Airbnb Magazine" and "Belong Anywhere" campaigns transform travel into an emotional experience. Every host becomes a character.',
        lesson: 'Content marketing works when the content IS the product. Airbnb doesn\'t need to "sell": hosts\' stories sell on their own.',
        metrics: '+43% bookings after "Belong Anywhere". Airbnb blog: 1M+ monthly visitors.',
        source: 'Fast Company (2018)'
      },
      barca: {
        brand: 'FC Barcelona',
        year: 2020,
        title: 'Barça as a Marketing Case',
        story: 'Barça is "Més que un club": a global brand. Spotify partnership, global merchandise, 400M+ followers. But the 2020-2022 crisis (€1.3B debt) showed that a brand without financial solidity is a bubble.',
        lesson: 'A strong brand isn\'t enough: you need a sustainable business. Marketing doesn\'t replace management. Barça had to sell "future assets" (TV rights) to survive.',
        metrics: '400M+ global followers, €800M+ revenue (2023), but €1.3B in debt in 2022.',
        source: 'Deloitte Football Money League (2024)'
      }
    }
  };

  // ======== MINIGAME OPTION/ANSWER TRANSLATIONS ========
  window.MINIGAMETranslations = {
    en: {
      // Exposure minigame
      expos_labels: ['High noise', 'Moderate noise', 'Clean'],
      expos_depth: ['Extreme bokeh', 'Medium', 'Everything in focus'],
      expos_freeze: ['Frozen', 'Still', 'Trail/motion blur'],

      // Light scenarios
      light_scenarios: [
        { scenario: '🌞 Midsummer midday, beach', correct: 'Hard, high side, 5500K', opts: ['Hard, high side, 5500K', 'Soft, frontal, 3200K', 'Backlight, 7000K', 'Rim light, 4500K'] },
        { scenario: '🌅 Sunset over the sea', correct: 'Warm, low side, 2800K', opts: ['Warm, low side, 2800K', 'Cool, frontal, 7500K', 'Neutral, backlight, 5500K', 'Hard, rim light, 9000K'] },
        { scenario: '☁️ Overcast day, park', correct: 'Soft, diffused, 6500K', opts: ['Soft, diffused, 6500K', 'Hard, side, 3000K', 'Backlight, 4000K', 'Rim light, 8000K'] },
        { scenario: '🕯️ Restaurant with candles', correct: 'Warm, low side, 1800K', opts: ['Warm, low side, 1800K', 'Neutral, frontal, 5500K', 'Cool, diffused, 7000K', 'Hard, backlight, 2500K'] },
        { scenario: '👰 Wedding in church', correct: 'Soft, side 45°, 4000K', opts: ['Soft, side 45°, 4000K', 'Hard, backlight, 6000K', 'Neutral, frontal, 5500K', 'Cool, rim light, 8000K'] }
      ],

      // Composizione targets
      comp_targets: [
        { x: 33, y: 33, name: 'Left-top third' },
        { x: 67, y: 33, name: 'Right-top third' },
        { x: 33, y: 67, name: 'Left-bottom third' },
        { x: 67, y: 67, name: 'Right-bottom third' }
      ],

      // Algorithm factors
      algo_factors: [
        { label: '📸 Visual content', weight: 3, opts: ['High-quality professional photo', 'Blurry selfie', 'Text screenshot', 'Generic meme'] },
        { label: '📝 Caption', weight: 3, opts: ['Question inviting comments', '"Liked and shared"', 'Hashtags only (#love #life)', 'No caption'] },
        { label: '⏰ Timing', weight: 2, opts: ['Peak hours (7-9 PM)', '3:00 AM', 'Monday 8:00 AM', 'Doesn\'t matter'] },
        { label: '💬 Engagement bait', weight: 2, opts: ['"Save for later!" (useful)', '"Type AMEN"', '"Tag 10 friends"', '"Like = luck"'] },
        { label: '🏷️ Hashtag', weight: 1, opts: ['5-8 relevant hashtags', '30 random hashtags', 'No hashtags', '#like4like #follow4follow'] }
      ],

      // Content hooks
      content_hooks: [
        { scenario: 'Post for a photography studio — B&W portraits', correct: 'Provocative question', opts: ['Provocative question', 'Generic number', 'Emojis only', 'Long technical headline'] },
        { scenario: 'Instagram Reel — Behind the scenes of a shoot', correct: 'Visual hook in first frame', opts: ['Visual hook in first frame', 'All written text', 'Company logo', 'Nothing special'] },
        { scenario: 'TikTok — Photography tutorial', correct: 'Promise in 3 seconds', opts: ['Promise in 3 seconds', 'Long technical explanation', 'Complex graphics', 'Long greeting'] },
        { scenario: 'LinkedIn Post — Marketing case study', correct: 'Shock statement', opts: ['Shock statement', 'Group photo', 'Generic text', 'External link'] }
      ],

      // Community crises
      community_crises: [
        { crisis: 'A customer posts a negative review: "Terrible service, blurry photos, never again"', correct: 'Respond immediately with empathy, offer private solution', opts: ['Respond immediately with empathy, offer private solution', 'Ignore the review', 'Respond defensively', 'Delete the review (if possible)'] },
        { crisis: 'A post is accused of being "tone-deaf" on a social issue', correct: 'Acknowledge the error, publicly apologize, learn', opts: ['Acknowledge the error, publicly apologize, learn', 'Defend the post with arguments', 'Delete everything and pretend nothing happened', 'Lock the comments'] },
        { crisis: 'A competitor copies your original content', correct: 'Document, confront privately, then legally if needed', opts: ['Document, confront privately, then legally if needed', 'Publish an accusatory post', 'Pretend nothing happened', 'Copy the competitor\'s content'] }
      ],

      // Analytics questions
      analytics_questions: [
        { q: 'Reach: 10,000 | Impressions: 50,000. What does it mean?', correct: 'Each person saw the post on average 5 times', opts: ['Each person saw the post on average 5 times', '10,000 people shared it', 'The post was seen 50,000 times total', 'The campaign had 50K clicks'] },
        { q: 'Campaign CTR: 0.5%. Is it good?', correct: 'No, it\'s low (2-5% is good for ads)', opts: ['No, it\'s low (2-5% is good for ads)', 'Yes, it\'s excellent', 'It only depends on the industry', 'Can\'t tell without ROAS'] },
        { q: 'Spend: $1,000 | Revenue: $4,000. What\'s the ROAS?', correct: '4:1', opts: ['4:1', '2:1', '0.25:1', '4000:1'] },
        { q: 'A post has 8% ER with 1,000 followers. Is it better than one with 2% ER and 100K followers?', correct: 'No: the second reaches more people in absolute terms', opts: ['No: the second reaches more people in absolute terms', 'Yes: the ER is higher', 'It depends on the goals', 'Yes, always'] }
      ],

      // Marketing Mix Ps
      marketing_ps: [
        { p: '📦 Product', correct: 'The transformation you offer the customer, not the physical product', opts: ['The transformation you offer the customer, not the physical product', 'Just the physical product', 'The brand name', 'The logo'] },
        { p: '💰 Price', correct: 'The value signal, not just a number', opts: ['The value signal, not just a number', 'The production cost', 'The lowest possible price', 'The discount'] },
        { p: '🏪 Place', correct: 'Omnichannel: where the customer meets you', opts: ['Omnichannel: where the customer meets you', 'Just the physical store', 'Only online', 'The warehouse'] },
        { p: '📢 Promotion', correct: 'How you communicate value to the customer', opts: ['How you communicate value to the customer', 'Only paid advertising', 'Only discounts', 'Word of mouth'] },
        { p: '👥 People', correct: 'The face of the brand: who represents the value', opts: ['The face of the brand: who represents the value', 'Only employees', 'The CEO', 'Suppliers'] },
        { p: '⚙️ Process', correct: 'The customer journey from purchase to delivery', opts: ['The customer journey from purchase to delivery', 'Only logistics', 'The production process', 'The org chart'] },
        { p: '📋 Physical Evidence', correct: 'Tangible proof of value (portfolio, reviews)', opts: ['Tangible proof of value (portfolio, reviews)', 'Just the store', 'Business cards', 'Invoices'] }
      ],

      // Brand positioning
      brand_positions: [
        { name: 'Budget Snap', correct: 'Low quality / Very low price', opts: ['Low quality / Very low price', 'High quality / High price', 'Medium quality / Medium price', 'High quality / Very low price'] },
        { name: 'Studio Leica', correct: 'Very high quality / Premium price', opts: ['Very high quality / Premium price', 'Low quality / Medium price', 'Medium quality / Very low price', 'High quality / Medium price'] },
        { name: 'AI Photo Edit', correct: 'Medium quality / Very low price', opts: ['Medium quality / Very low price', 'High quality / High price', 'Low quality / Very low price', 'Medium quality / Medium price'] },
        { name: 'Studio Olga', correct: 'High quality / Medium price', opts: ['High quality / Medium price', 'Low quality / High price', 'Medium quality / Very low price', 'High quality / Premium price'] }
      ],

      // Funnel contents
      funnel_contents: [
        ['Educational blog post', 'YouTube video', 'Social post'],
        ['Newsletter', 'Case study', 'Webinar'],
        ['Special offer', 'Testimonials', 'Call-to-action'],
        ['Follow-up email', 'Community', 'Loyalty program']
      ],

      // Persuasion copies
      persuasion_copies: [
        { q: 'Which copy uses Cialdini\'s RECIPROCITY?', correct: 'I\'ll gift you a mini-guide: 5 mistakes to avoid', opts: ['I\'ll gift you a mini-guide: 5 mistakes to avoid', 'Last 3 spots available!', '92% of clients are satisfied', 'Book now'] },
        { q: 'Which copy uses SOCIAL PROOF?', correct: '500+ clients chose Studio Olga', opts: ['500+ clients chose Studio Olga', 'Book before it\'s too late', 'Discover your potential', 'I\'ll guide you step by step'] },
        { q: 'Which copy uses SCARCITY?', correct: 'Only 5 slots left for June', opts: ['Only 5 slots left for June', 'Here\'s what they say about us', 'I\'ll give you free advice', 'Discover the method'] },
        { q: 'Which copy is suitable for someone AWARE OF THE PROBLEM?', correct: 'Know your photos lack impact? Here\'s why.', opts: ['Know your photos lack impact? Here\'s why.', 'Shoot like a pro with this advanced tutorial', 'Our premium package includes...', 'Buy now'] }
      ],

      // Exam questions
      exam_questions: [
        { q:'Aperture f/1.4 compared to f/22 produces:', o:['Lots of bokeh, shallow depth of field','Everything in focus, little light','No difference','More grain'], a:0 },
        { q:'The rule of thirds suggests positioning the subject:', o:['Always in the center','On the intersection points of the lines','Top left always','On the bottom edge'], a:1 },
        { q:'The color temperature of a sunset is approximately:', o:['9000K','5500K','2800K','1800K'], a:2 },
        { q:'Barthes\' "punctum" is:', o:['Photographic technique','The detail that emotionally pierces','The cultural context','The photo\'s price'], a:1 },
        { q:'Instagram\'s algorithm in 2025 rewards most:', o:['Likes','Saves and shares','Hashtags','Posting frequency'], a:1 },
        { q:'The "decisive moment" is a concept by:', o:['Susan Sontag','Roland Barthes','Henri Cartier-Bresson','David Ogilvy'], a:2 },
        { q:'Engagement rate is calculated as:', o:['Followers / posts','(Interactions / reach) × 100','Revenue / spend','Likes / followers'], a:1 },
        { q:'A virality coefficient K > 1 means:', o:['The content dies','Exponential growth','No effect','The post is shadowbanned'], a:1 },
        { q:'The 7Ps of the Marketing Mix include:', o:['People, Process, Physical Evidence','Profit, Production, Planning','Passion, Purpose, Platform','Portfolio, Pricing, Packaging'], a:0 },
        { q:'The AIDA model includes:', o:['Attention, Interest, Desire, Action','Awareness, Implementation, Data, Analysis','Acquisition, Integration, Development, Automation','Analysis, Insight, Design, Application'], a:0 },
        { q:'A campaign ROAS with $500 spend and $2000 revenue is:', o:['1:4','4:1','2:1','0.5:1'], a:1 },
        { q:'For Cialdini, "reciprocity" works because:', o:['People love gifts','The brain feels the need to give back','It\'s a legal obligation','People fear losing'], a:1 },
        { q:'Eugene Schwartz\'s 5 levels of awareness begin with:', o:['The product','The problem','The solution','The action'], a:1 },
        { q:'The golden hour is:', o:['Midday hours','The 30 min before sunset','The entire night','The 12-2 PM hours'], a:1 },
        { q:'UGC (User Generated Content) is more effective than brand content because:', o:['It\'s free','It\'s perceived as authentic and credible','It has higher resolution','It\'s always in HD'], a:1 },
        { q:'To manage a social media crisis, the first rule is:', o:['Delete the post','Respond immediately with empathy','Ignore the comments','Lock the profile'], a:1 },
        { q:'Positioning (Ries & Trout) is:', o:['The product\'s position on the shelf','The position in the customer\'s mind','Price compared to competitors','Geographic distribution'], a:1 },
        { q:'Byron Sharp shows brand growth depends on:', o:['Absolute customer loyalty','Mental and Physical Availability','Only paid advertising','Marketing budget'], a:1 }
      ]
    }
  };
})();
