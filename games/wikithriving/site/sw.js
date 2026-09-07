const CACHE_NAME='wikithriving-v4';
const CORE_ASSETS=['./','./index.html','./manifest.webmanifest','./privacy.html'];
const JS_ASSETS=[
'./js/data/realms.js','./js/data/countries.js','./js/data/quotes.js',
'./js/data/lessons/index.js',
'./js/data/lessons/character.js','./js/data/lessons/learning.js','./js/data/lessons/math.js',
'./js/data/lessons/money.js','./js/data/lessons/health.js','./js/data/lessons/comm.js',
'./js/data/lessons/work.js','./js/data/lessons/world.js','./js/data/lessons/practical.js',
'./js/data/lessons/purpose.js','./js/data/lessons/art.js','./js/data/lessons/science.js',
'./js/data/lessons/psychology.js','./js/data/lessons/music.js','./js/data/lessons/film.js',
'./js/data/lessons/design.js','./js/data/lessons/literature.js','./js/data/lessons/travel.js',
'./js/data/quests.js','./js/data/books.js',
'./js/data/poems/index.js','./js/data/poems/classics.js','./js/data/poems/modern.js',
'./js/data/quizq.js','./js/data/bigquestions.js',
'./js/data/games/index.js',
'./js/data/games/budget.js','./js/data/games/dojo.js','./js/data/games/bias.js',
'./js/data/games/news.js','./js/data/games/emotion.js','./js/data/games/integrity.js',
'./js/data/games/memory.js','./js/data/games/speedmath.js','./js/data/games/workplace.js',
'./js/data/games/kitchen.js','./js/data/games/valuesort.js','./js/data/games/artmatch.js',
'./js/data/games/experiment.js','./js/data/games/genre.js','./js/data/games/scenedecoder.js',
'./js/data/games/colorlab.js','./js/data/games/poetrymatch.js','./js/data/games/culturequest.js',
'./js/engine/profile.js','./js/engine/unlock.js','./js/engine/progress.js',
'./js/engine/daily.js','./js/engine/quiz.js','./js/engine/economy.js',
'./js/engine/review.js','./js/engine/league.js','./js/engine/cards.js',
'./js/engine/sfx.js','./js/engine/analytics.js','./js/engine/i18n.js',
'./js/tools/calculators.js','./js/tools/mathtrainers.js',
'./js/ui/toast.js','./js/ui/confetti.js','./js/ui/sharecard.js',
'./js/ui/onboarding.js','./js/ui/home.js','./js/ui/realm.js',
'./js/ui/lesson.js','./js/ui/wisdom.js','./js/ui/math.js',
'./js/ui/journey.js','./js/ui/profile.js','./js/ui/reading.js',
'./js/ui/poem.js','./js/ui/shop.js','./js/ui/garden.js',
'./js/ui/league.js','./js/ui/journal.js','./js/ui/capsule.js',
'./js/ui/album.js','./js/ui/games.js','./js/ui/habits.js',
'./js/ui/search.js','./js/ui/streakcalendar.js','./js/ui/dailychallenge.js',
'./js/main.js'
];
const ALL_ASSETS=CORE_ASSETS.concat(JS_ASSETS);
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ALL_ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>{if(r)return r;return fetch(e.request).then(resp=>{if(!resp||resp.status!==200||resp.type!=='basic')return resp;const clone=resp.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));return resp;}).catch(()=>caches.match('./index.html'));}));});
