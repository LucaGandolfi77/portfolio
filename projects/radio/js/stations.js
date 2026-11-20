/* Radio — catalogo locale curato (50 stazioni, URL verificate via Radio Browser) */
(function () { 'use strict';
const STATIONS = [
  { name: "Rai Radio 1", url: "http://icestreaming.rai.it/1.mp3", favicon: "https://www.rai.it/cropgd/560x292/dl/img/2019/01/07/1280x720_1546854278675_conferenza%20radio1.jpg", tags: "news,public radio,rai", country: "Italy", countrycode: "IT", language: "italian", votes: 43111, bitrate: 256, codec: "MP3" },
  { name: "Virgin Radio Classic Rock", url: "http://icy.unitedradio.it/VirginRockClassics.mp3", favicon: "", tags: "classic rock,mediaset", country: "Italy", countrycode: "IT", language: "italian", votes: 38488, bitrate: 128, codec: "MP3" },
  { name: "Radio 24 il sole 24 ore", url: "http://shoutcast2.radio24.it:8000/;", favicon: "https://www.radio24.ilsole24ore.com/whitelabel/group-2420101401040528/img/apple-touch-icon.png", tags: "news talk", country: "Italy", countrycode: "IT", language: "italian", votes: 36590, bitrate: 64, codec: "MP3" },
  { name: "Radio 105 Network", url: "http://icecast.unitedradio.it/Radio105.mp3", favicon: "https://upload.wikimedia.org/wikipedia/it/0/01/105.png", tags: "hits,mediaset,pop,top 40", country: "Italy", countrycode: "IT", language: "italian", votes: 34848, bitrate: 128, codec: "MP3" },
  { name: "Rai Radio 3", url: "http://icestreaming.rai.it/3.mp3", favicon: "https://www.raicom.rai.it/wp-content/uploads/2021/12/RADIO3-1024x1024.jpg", tags: "classical,culture,public radio,rai", country: "Italy", countrycode: "IT", language: "italian", votes: 23926, bitrate: 320, codec: "MP3" },
  { name: "Radio Armisa", url: "https://onair.armisa.it/listen/armisa/radio.mp3", favicon: "https://armisa.it/assets/favicon/android-chrome-512x512.png", tags: "anni 80,anni 90,balera,dance,folk,italiana,liscio,oldies,pop,popolare,tradizione", country: "Italy", countrycode: "IT", language: "english,italian", votes: 15634, bitrate: 0, codec: "MP3" },
  { name: "Radio 80", url: "http://str01.fluidstream.net:7020/;stream.mp3", favicon: "https://upload.wikimedia.org/wikipedia/it/1/1b/Radio80.jpg", tags: "80s,noventa padovana", country: "Italy", countrycode: "IT", language: "italian", votes: 13864, bitrate: 128, codec: "MP3" },
  { name: "Virgin Radio Rock '70", url: "http://icy.unitedradio.it/VirginRock70.mp3", favicon: "", tags: "70s,classic rock,mediaset", country: "Italy", countrycode: "IT", language: "italian", votes: 13737, bitrate: 128, codec: "MP3" },
  { name: "Virgin Radio Rock '80", url: "http://icy.unitedradio.it/VirginRock80.mp3", favicon: "", tags: "80s,classic rock,mediaset", country: "Italy", countrycode: "IT", language: "italian", votes: 12450, bitrate: 128, codec: "MP3" },
  { name: "Radio Studio Più - HQ", url: "http://77.241.4.100:8020/;", favicon: "https://studiopiu.net/offline/img/icona.png", tags: "dance", country: "Italy", countrycode: "IT", language: "italian", votes: 12108, bitrate: 0, codec: "MP3" },
  { name: "Radio Paradise Main Mix (EU) 320k AAC", url: "http://stream-uk1.radioparadise.com/aac-320", favicon: "https://radioparadise.com/apple-touch-icon.png", tags: "california,eclectic,free,internet,non-commercial,paradise,radio", country: "The United States Of America", countrycode: "US", language: "english", votes: 323679, bitrate: 320, codec: "AAC" },
  { name: "Classic Vinyl HD", url: "https://icecast.walmradio.com:8443/classic", favicon: "https://icecast.walmradio.com:8443/classic.jpg", tags: "1930,1940,1950,1960,beautiful music,big band,classic hits,crooners,easy,easy listening,hd,jazz,light orchestral,lounge,oldies,orchestral,otr,relaxation,strings,swing,unwind,walm", country: "The United States Of America", countrycode: "US", language: "english", votes: 312364, bitrate: 320, codec: "MP3" },
  { name: "WALM 2 HD", url: "https://icecast.walmradio.com:8443/walm2", favicon: "https://icecast.walmradio.com:8443/walm.jpg", tags: "choral,christian,christian music,classical music,hymns,orchestral,talk,talk radio,traditional christian", country: "The United States Of America", countrycode: "US", language: "english", votes: 106297, bitrate: 320, codec: "MP3" },
  { name: "101 SMOOTH JAZZ", url: "http://jking.cdnstream1.com/b22139_128mp3", favicon: "http://101smoothjazz.com/favicon.ico", tags: "easy listening,jazz,smooth jazz", country: "The United States Of America", countrycode: "US", language: "english", votes: 91890, bitrate: 192, codec: "MP3" },
  { name: "Your Classical - Relax", url: "http://relax.stream.publicradio.org/relax.mp3", favicon: "http://www.yourclassical.org/apple-touch-icon.png", tags: "classical,relax", country: "The United States Of America", countrycode: "US", language: "english", votes: 56658, bitrate: 128, codec: "MP3" },
  { name: ".977 Country", url: "http://15113.live.streamtheworld.com:3690/977_COUNTRY_SC", favicon: "", tags: "country", country: "The United States Of America", countrycode: "US", language: "english", votes: 56455, bitrate: 128, codec: "MP3" },
  { name: "LBC Radio", url: "http://media-sov.musicradio.com/LBC973MP3Low", favicon: "http://www.lbc.co.uk/assets_v4r/lbc/img/favicon-196x196.png", tags: "political talk", country: "The United Kingdom Of Great Britain And Northern Ireland", countrycode: "GB", language: "english", votes: 53417, bitrate: 48, codec: "MP3" },
  { name: "Radio Caroline", url: "http://78.129.202.200:8040/;", favicon: "http://www.radiocaroline.co.uk/favicon.ico", tags: "country,pop,rock", country: "The United Kingdom Of Great Britain And Northern Ireland", countrycode: "GB", language: "english", votes: 48536, bitrate: 128, codec: "MP3" },
  { name: "Capital FM London", url: "http://media-ice.musicradio.com/CapitalMP3", favicon: "http://assets6.capitalfm.com/2016/11/capital-3d-network-logo-large-canvas-1458228638-herowidev4-0.jpg", tags: "pop", country: "The United Kingdom Of Great Britain And Northern Ireland", countrycode: "GB", language: "english", votes: 40644, bitrate: 128, codec: "MP3" },
  { name: "Heart 80s", url: "https://media-ssl.musicradio.com/Heart80sMP3", favicon: "https://www.heart.co.uk/assets_v4r/heart/img/favicon-196x196.png", tags: "80s,national,pop,public radio,variety", country: "The United Kingdom Of Great Britain And Northern Ireland", countrycode: "GB", language: "english", votes: 36861, bitrate: 128, codec: "MP3" },
  { name: "TMM 1", url: "https://listen-msmn.sharp-stream.com/nme1.mp3", favicon: "https://cdn-profiles.tunein.com/s159857/images/logod.png", tags: "alternative,alternative rock,garage,indie,indie pop,indie rock,left-field dance", country: "The United Kingdom Of Great Britain And Northern Ireland", countrycode: "GB", language: "english", votes: 22104, bitrate: 128, codec: "MP3" },
  { name: "MANGORADIO", url: "https://mangoradio.stream.laut.fm/mangoradio", favicon: "https://mangoradio.de/wp-content/uploads/cropped-Logo-192x192.webp", tags: "music,variety", country: "Germany", countrycode: "DE", language: "english,german", votes: 831512, bitrate: 128, codec: "MP3" },
  { name: "90s90s Hits", url: "http://streams.90s90s.de/pop/mp3-192/streams.90s90s.de/", favicon: "", tags: "90s,hits,pop", country: "Germany", countrycode: "DE", language: "german", votes: 28621, bitrate: 0, codec: "MP3" },
  { name: "90s90s HipHop & Rap", url: "http://streams.90s90s.de/hiphop/mp3-192/streams.90s90s.de/", favicon: "http://aggregatorservice.loverad.io/wp-content/uploads/2018/10/90s90s_hiphoprap_600x600.png", tags: "hiphop,rap", country: "Germany", countrycode: "DE", language: "english", votes: 27273, bitrate: 0, codec: "MP3" },
  { name: "RFI Afrique", url: "http://live02.rfi.fr/rfiafrique-64.mp3", favicon: "http://www.rfi.fr/apple-touch-icon.png", tags: "africa,news", country: "France", countrycode: "FR", language: "french", votes: 91129, bitrate: 64, codec: "MP3" },
  { name: "France Info", url: "http://icecast.radiofrance.fr/franceinfo-hifi.aac", favicon: "https://www.francetvinfo.fr/assets/common/images/pwa/ios/120-0cfbd6d4.png", tags: "aac,information,public radio,radio france", country: "France", countrycode: "FR", language: "french", votes: 62333, bitrate: 192, codec: "AAC" },
  { name: "RFI-Afrique", url: "http://live02.rfi.fr/rfiafrique-96k.mp3", favicon: "", tags: "france médias monde,information,public radio,world news", country: "France", countrycode: "FR", language: "french", votes: 56230, bitrate: 96, codec: "MP3" },
  { name: "Cadena 100", url: "http://cadena100-streamers-mp3.flumotion.com/cope/cadena100.mp3", favicon: "https://www.cadena100.es/estaticos/apple-touch-icon-192x192.png", tags: "music", country: "Spain", countrycode: "ES", language: "spanish", votes: 44636, bitrate: 128, codec: "MP3" },
  { name: "Ibiza Global Radio", url: "http://ibizaglobalradio.streaming-pro.com:8024/", favicon: "", tags: "dance,electronic,house", country: "Spain", countrycode: "ES", language: "spanish", votes: 38047, bitrate: 0, codec: "MP3" },
  { name: "Classic Vinyl HD Opus", url: "https://icecast.walmradio.com:8443/classic_opus", favicon: "https://icecast.walmradio.com:8443/classic.jpg", tags: "1930,1940,1950,1960,beautiful music,big band,classic hits,crooners,easy,easy listening,hd,jazz,light orchestral,lounge,oldies,opus,orchestral,otr,relaxation,strings,swing,unwind,walm", country: "The United States Of America", countrycode: "US", language: "english", votes: 54486, bitrate: 192, codec: "OGG" },
  { name: "Anon.FM", url: "https://icecast.anon.fm/radio", favicon: "https://icecast.anon.fm/favicon.png", tags: "anime,dnb,downtempo,experimental,jazz,psychedelic,rock,trance", country: "The Russian Federation", countrycode: "RU", language: "english,russian,ukrainian", votes: 36455, bitrate: 192, codec: "MP3" },
  { name: "SomaFM Secret Agent (128k MP3)", url: "https://ice6.somafm.com/secretagent-128-mp3", favicon: "https://somafm.com/img3/secretagent-400.jpg", tags: "ambient,downtempo,jazz,lounge,samba,sixties", country: "The United States Of America", countrycode: "US", language: "english", votes: 36103, bitrate: 128, codec: "MP3" },
  { name: "Antena 1 São Paulo, SP (ZYD823 94,7 MHz FM) [aac]", url: "http://antena1.newradio.it/stream?ext=.mp3", favicon: "", tags: "adult contemporary,jazz,pop,smooth jazz", country: "Brazil", countrycode: "BR", language: "portuguese", votes: 33555, bitrate: 96, codec: "AAC+" },
  { name: "Русский Рок - Russian Rock", url: "http://rock.volna.top/RusRock", favicon: "", tags: "amg,rock,russian", country: "The Russian Federation", countrycode: "RU", language: "russian", votes: 45640, bitrate: 128, codec: "MP3" },
  { name: "Big R Radio - 80s Metal FM", url: "http://bigrradio.cdnstream1.com/5186_128", favicon: "http://www.bigrradio.com/image/favicon/apple-touch-icon.png", tags: "80s,aor,glam metal,hair metal,hard rock,heavy metal,metal", country: "The United States Of America", countrycode: "US", language: "english", votes: 42361, bitrate: 128, codec: "MP3" },
  { name: "Hard Rock Heaven", url: "http://hydra.cdnstream.com/1521_128", favicon: "", tags: "80s,glam metal,hair metal,hard rock,heavy metal,overland park", country: "The United States Of America", countrycode: "US", language: "english", votes: 35186, bitrate: 128, codec: "MP3" },
  { name: "SomaFM Indie Pop Rocks! (128k AAC)", url: "https://ice5.somafm.com/indiepop-128-aac", favicon: "https://somafm.com/img3/indiepop-400.jpg", tags: "indie,indie pop,indie rock", country: "The United States Of America", countrycode: "US", language: "english", votes: 21301, bitrate: 128, codec: "AAC" },
  { name: "Chillofi radio", url: "http://streams.dez.ovh:8000/radio.mp3", favicon: "https://chillofi-radio.dez.ovh/img/clofi-logo.jpg", tags: "chill,chillhop,chillout,lo-fi", country: "France", countrycode: "FR", language: "english", votes: 1132, bitrate: 192, codec: "MP3" },
  { name: "Chillofi Radio: relax & study beats", url: "http://rdstream-0625.dez.ovh:8000/radio.mp3", favicon: "https://chillofi-radio.dez.ovh/img/clofi-logo.jpg", tags: "chill,chillhop,chillout,lo-fi,music for study,relax,relaxing", country: "France", countrycode: "FR", language: "", votes: 696, bitrate: 192, codec: "MP3" },
  { name: "Radio Record Lo-Fi", url: "https://radiorecord.hostingradio.ru/lofi96.aacp", favicon: "https://cdn-profiles.tunein.com/s255374/images/logog.png?t=152330", tags: "chill,chill beats,chillhop,jazzhop,lo-fi", country: "The Russian Federation", countrycode: "RU", language: "russian", votes: 259, bitrate: 0, codec: "AAC" },
  { name: "Epic Lounge - JAZZHOP", url: "https://stream.epic-lounge.com/jazzhop-lounge?ref=radiobrowser", favicon: "https://i.ibb.co/9Hc5TxR/Jazz-Hop-Lounge.jpg", tags: "hiphop,instrumental,jazz,lo-fi,lounge,lounge music", country: "Germany", countrycode: "DE", language: "english,german", votes: 238, bitrate: 192, codec: "MP3" },
  { name: "parsa", url: "http://parsa.icdndhcp.com:18000/stream", favicon: "https://lh5.googleusercontent.com/proxy/25PMsUBa3Z6So8cdvAyZT7_93NyV26cJNuTTDY4xk6aJU1lcKPByf2C7o2HbrGrv-QxPvbI3dio2D39zYlgi1v6nLg", tags: "classical", country: "Islamic Republic Of Iran", countrycode: "IR", language: "", votes: 74177, bitrate: 64, codec: "MP3" },
  { name: "caltexmusic", url: "http://n13.radiojar.com/cp13r2cpn3quv?rj-ttl=5&rj-tok=AAABeB5OHJQA07FIiDdZAZNHWw", favicon: "", tags: "classical", country: "Islamic Republic Of Iran", countrycode: "IR", language: "", votes: 34505, bitrate: 0, codec: "MP3" },
  { name: "اذاعة القرآن الكريم", url: "http://stream.radiojar.com/0tpy1h0kxtzuv", favicon: "", tags: "classical", country: "Algeria", countrycode: "DZ", language: "", votes: 25299, bitrate: 0, codec: "MP3" },
  { name: "France Musique", url: "http://direct.francemusique.fr/live/francemusique-midfi.mp3", favicon: "", tags: "classical,jazz,music,public radio,radio france", country: "France", countrycode: "FR", language: "french", votes: 22620, bitrate: 128, codec: "MP3" },
  { name: "Dance Wave! | MP3", url: "https://dancewave.online/dance.mp3", favicon: "https://dancewave.online/dw_logo.png", tags: "club dance electronic house trance", country: "", countrycode: "", language: "english", votes: 576531, bitrate: 128, codec: "MP3" },
  { name: "RFE/RL Radio Farda", url: "http://rfe21.akacast.akamaistream.net/7/751/437779/v1/ibb.akacast.akamaistream.net/rfe21", favicon: "http://www.radiofarda.com//Content/responsive/RFE/img/webApp/favicon.ico", tags: "music,news,persian,rfe-rl,talk", country: "Czechia", countrycode: "CZ", language: "persian", votes: 102822, bitrate: 0, codec: "MP3" },
  { name: "Mosaique FM", url: "http://radio.mosaiquefm.net:8000/mosalive", favicon: "", tags: "", country: "Tunisia", countrycode: "TN", language: "arabic", votes: 87532, bitrate: 90, codec: "MP3" },
  { name: "РАДИО ВАНЯ", url: "https://icecast-radiovanya.cdnvideo.ru/radiovanya", favicon: "", tags: "pop", country: "The Russian Federation", countrycode: "RU", language: "russian", votes: 59013, bitrate: 64, codec: "AAC+" },
  { name: "Faz", url: "http://www.radiofaaz.com:8000/radiofaaz", favicon: "", tags: "", country: "Islamic Republic Of Iran", countrycode: "IR", language: "", votes: 57680, bitrate: 128, codec: "MP3" },
];

const COUNTRIES = [
  ['🇮🇹','Italia','IT'], ['🇺🇸','USA','US'], ['🇬🇧','UK','GB'], ['🇩🇪','Germania','DE'], ['🇫🇷','Francia','FR'],
  ['🇪🇸','Spagna','ES'], ['🇵🇹','Portogallo','PT'], ['🇬🇷','Grecia','GR'], ['🇳🇱','Paesi Bassi','NL'], ['🇧🇪','Belgio','BE'],
  ['🇨🇭','Svizzera','CH'], ['🇦🇹','Austria','AT'], ['🇸🇪','Svezia','SE'], ['🇳🇴','Norvegia','NO'], ['🇩🇰','Danimarca','DK'],
  ['🇫🇮','Finlandia','FI'], ['🇮🇪','Irlanda','IE'], ['🇵🇱','Polonia','PL'], ['🇨🇿','Rep. Ceca','CZ'], ['🇸🇰','Slovacchia','SK'],
  ['🇭🇺','Ungheria','HU'], ['🇷🇴','Romania','RO'], ['🇧🇬','Bulgaria','BG'], ['🇭🇷','Croazia','HR'], ['🇷🇸','Serbia','RS'],
  ['🇹🇷','Turchia','TR'], ['🇺🇦','Ucraina','UA'], ['🇷🇺','Russia','RU'], ['🇯🇵','Giappone','JP'], ['🇰🇷','Corea del Sud','KR'],
  ['🇨🇳','Cina','CN'], ['🇮🇳','India','IN'], ['🇹🇭','Thailandia','TH'], ['🇮🇩','Indonesia','ID'], ['🇵🇭','Filippine','PH'],
  ['🇻🇳','Vietnam','VN'], ['🇦🇺','Australia','AU'], ['🇳🇿','Nuova Zelanda','NZ'], ['🇨🇦','Canada','CA'], ['🇲🇽','Messico','MX'],
  ['🇧🇷','Brasile','BR'], ['🇦🇷','Argentina','AR'], ['🇨🇱','Cile','CL'], ['🇨🇴','Colombia','CO'], ['🇵🇪','Perù','PE'],
  ['🇨🇺','Cuba','CU'], ['🇯🇲','Giamaica','JM'], ['🇲🇦','Marocco','MA'], ['🇩🇿','Algeria','DZ'], ['🇪🇬','Egitto','EG'],
  ['🇳🇬','Nigeria','NG'], ['🇿🇦','Sudafrica','ZA'], ['🇰🇪','Kenya','KE'], ['🇦🇪','Emirati','AE'], ['🇸🇦','Arabia Saudita','SA'],
  ['🇮🇱','Israele','IL'], ['🇵🇰','Pakistan','PK'], ['🇱🇧','Libano','LB'], ['🇬🇭','Ghana','GH']
];

const GENRES = [
  ['🎷','jazz'], ['🌙','lo-fi'], ['🎸','rock'], ['🎛️','electronic'], ['🏠','house'],
  ['🎻','classical'], ['🍝','italian'], ['🌫️','ambient'], ['🧊','chill'], ['🎙️','hip-hop']
];

const TAG_EMOJI = { jazz:'🎷', rock:'🎸', pop:'🎤', house:'🏠', electronic:'🎛️', 'lo-fi':'🌙', lofi:'🌙', classical:'🎻',
  italian:'🍝', italia:'🍝', ambient:'🌫️', chill:'🧊', hip:'🎙️', news:'🗞️', talk:'💬', dance:'🪩', metal:'🤘',
  soul:'🎶', blues:'🎵', country:'🤠', reggae:'🌴', techno:'🤖', folk:'🪕', latin:'💃', disco:'🪩' };

function emojiFor(st){
  const hay = ((st.tags||'') + ' ' + (st.name||'')).toLowerCase();
  for (const k in TAG_EMOJI) if (hay.includes(k)) return TAG_EMOJI[k];
  return '🎙️';
}
function faviconFor(st){
  if (st.favicon) return st.favicon;
  try { const host = new URL(st.url_resolved || st.url).hostname; return 'https://icons.duckduckgo.com/ip3/' + host + '.ico'; }
  catch(e){ return ''; }
}
function localFilter(mode, arg){
  const q = String(arg||'').toLowerCase();
  if (mode === 'top') return STATIONS.slice().sort((a,b)=>(b.votes||0)-(a.votes||0)).slice(0,50);
  if (mode === 'fav') return [];
  if (mode === 'cc') return STATIONS.filter(s => (s.countrycode||'').toLowerCase() === q);
  if (mode === 'tag') return STATIONS.filter(s => (s.tags||'').toLowerCase().includes(q));
  return STATIONS.filter(s => ((s.name||'')+' '+(s.tags||'')+' '+(s.country||'')).toLowerCase().includes(q));
}

window.RadioStations = { STATIONS, COUNTRIES, GENRES, TAG_EMOJI, emojiFor, faviconFor, localFilter };

})();