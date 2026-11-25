# La Poesia del Debugging: Versi per chi parla con le macchine

> *"Ogni bug è una riddance nascosta. Ogni fix è una rima trovata. La differenza tra un programma che funziona e uno che non funziona è un solo carattere — e mille notti di silenzio."*

---

## Prologo — Il Poeta e la Macchina

C'è chi programma in silenzio, contando le righe come chi conta le stelle. C'è chi programma gridando, inseguendo errori tra le stanze vuote di un IDE spento. Ma c'è chi — raro, paziente, quasi monastico — ascolta il codice come ascolta il vento tra le foglie. Ascolta il ronzio del compilatore, il sospiro del runtime, il pianto del sistema operativo quando un processo si ferma senza spiegare perché.

Questo libro è per chi ha imparato ad ascoltare.

Non è un manuale di debugging. È una raccolta di versi nati dalla collisione tra logica e umanità, tra codice e carne. Ogni poesia è dedicata a un errore che hai forse già commesso — o che forse commetterai, perché gli errori sono compagni fedeli, tornano sempre, anche quando li credi sepolti.

Leggi con calma. Leggi ad alta voce. E quando un verso ti suonerà familiare, fermati: quello è il tuo bug che ti sta parlando.

---

## Capitolo 1 — L'Off‑By‑One: Il Serpente che Morde la Coda

### Haiku
> Indice fuori di uno / il ciclo corre troppo tardi / il limite non dorme

### La Storia
L'errore più antico del programmatore. L'ultimo più perdonato. Quello che ti fa guardare il codice cento volte prima di accorgerti che manca un segno uguale, un segno più, un meno — un intero universo in un singolo carattere.

L'off‑by‑one non è cattiveria. È la prova che la macchina non pensa come noi. Noi contiamo da uno; la macchina conta da zero. Noi diciamo "fino a dieci"; la macchina dice "fino a nove". Noi diciamo "inclusivo"; la macchina dice "esclusivo e orgogliosa".

### Il Poema Completo

```
Ho scritto "i <= length"
e il ciclo non voleva fermarsi.
Ho cambiato in "<"
e il risultato era vuoto.
Tra i due simboli
vive un mondo intero:
il confine, il confine,
il confine — mai il centro.
```

### Spiegazione Tecnica

L'errore off‑by‑one si verifica quando un'indice, un limite di iterazione o un confronto di range è scorretto di un'unità. In Python, ad esempio, la lista `lista[0:5]` restituisce cinque elementi (indici 0, 1, 2, 3, 4) — l'indice finale è escluso. Molti programmatori, abituati alla convenzione umana (dove "fino a 5" include 5), dimenticano questo dettaglio e includono un elemento in più o ne escludono uno per errore.

In C, C++, Java e JavaScript, lo stesso concetto si manifesta negli array: l'indice dell'ultimo elemento è sempre `lunghezza - 1`. Se dimentichi questo, il programma accederà a memoria fuori dai limiti, causando un *buffer overflow*.

### Esempio di Codice

**Il bug:**
```python
# Stampa i primi 10 numeri (da 0 a 9)
numeri = list(range(20))

# Bug: include anche l'indice 10, quindi stampa 11 numeri
for i in range(1, 11):  # Dovrebbe essere range(10) per 0-9
    print(numeri[i])
```

**La correzione:**
```python
# Corretto: ora stampa esattamente 10 numeri (indici 0-9)
for i in range(10):
    print(numeri[i])
```

### Il Limerick del Programmatore
> C'era un giovane sviluppatore  
> Che contava gli elementi con fervore  
> Usò "i <= N"  
> E il ciclo non si ferma più  
> Finché non crollò il server intero  

### Il Consigli dello Chef
Prima di ogni ciclo, chiediti: *"Stiamo contando da zero o da uno? Il limite è inclusivo o esclusivo?"* Scrivilo su un post‑it attaccato al monitor. Il post‑it costa nulla; il debugging costa ore.

---

## Capitolo 2 — La Race Condition: La Danza dei Fantasmi

### Sonetto Shakespeareano
> Due thread corrono in gara simultanea  
> E il risultato è mai lo stesso mai  
> Oggi funziona, domani si ferma  
> Il caos vive nell'oscurità  

> Nessun ordine logico li governa  
> Solo la fortuna dell'esecuzione  
> Un'istruzione qui, un'altra là, si nasconde  
> La verità nel timing perfetto  

> Se solo potessi controllare il tempo  
> E fermare il flusso con un fermo immagine  
> Ma il clock scorre e non conosce pietà  
> E il bug nasce dalla mia libertà  

> Così scrivo, aspetto, e prego invano  
> Che il dato sia coerente nel mio sogno  

### La Storia
La race condition è la danza più imprevedibile del mondo del software. Si verifica quando due o più thread (o processi) accedono a dati condivisi senza sincronizzazione adeguata, e il risultato dipende dall'ordine esatto in cui le operazioni vengono eseguite — un ordine che non puoi controllare, né prevedere, né riprodurre con certezza.

È come due cuochi che cucinano lo stesso piatto nello stesso pentolone: uno aggiunge il sale, l'altro la cipolla, ma non sanno chi per primo. Il piatto sarà buono o brutto, dipende dalla sequenza — e la sequenza è decisa dal kernel, non da te.

### Il Poema Completo

```
Due mani sullo stesso dato  
una scrive e l'altra legge  
l'risultato è un incanto  
ma il significato si perde  

se il primo scrive "vero"  
e il secondo sovrascrive "falso"  
chi ha ragione? chi è corretto?  
nessuno lo sa  

il lock è il solo custode  
dell'ordine che desideriamo  
ma se dimentichi di aprirlo  
il thread si ferma — e il programma si rammemora  
```

### Spiegazione Tecnica

Una race condition si manifesta quando:
1. Due o più thread accedono alla stessa variabile condivisa.
2. Almeno uno dei thread effettua una scrittura.
3. Non esiste un meccanismo di sincronizzazione (lock, mutex, semaphore) che garantisca l'accesso esclusivo.

Il risultato è **non deterministico**: eseguendo lo stesso programma cento volte, potresti ottenere cento risultati diversi. Questo rende il bug estremamente difficile da riprodurre e ancora più difficile da diagnosticare.

In Python, il Global Interpreter Lock (GIL) maschera molti problemi di concorrenza, ma non tutti: con `threading`, `multiprocessing`, o `asyncio`, le race condition sono reali e pericolose.

### Esempio di Codice

**Il bug:**
```python
import threading

saldo = 1000

def preleva(importo):
    global saldo
    if saldo >= importo:
        # Simulazione di un'operazione lenta
        import time
        time.sleep(0.001)
        saldo -= importo
        print(f"Prelievo di {importo}. Saldo: {saldo}")
    else:
        print("Fondi insufficienti")

# Due prelievi simultanei
t1 = threading.Thread(target=preleva, args=(800,))
t2 = threading.Thread(target=preleva, args=(500,))
t1.start()
t2.start()
t1.join()
t2.join()

print(f"Saldo finale: {saldo}")  # Può essere 200, 700, o anche 1000!
```

**La correzione:**
```python
import threading

saldo = 1000
lock = threading.Lock()

def preleva(importo):
    global saldo
    with lock:  # Ora l'accesso è sincronizzato
        if saldo >= importo:
            import time
            time.sleep(0.001)
            saldo -= importo
            print(f"Prelievo di {importo}. Saldo: {saldo}")
        else:
            print("Fondi insufficienti")

t1 = threading.Thread(target=preleva, args=(800,))
t2 = threading.Thread(target=preleva, args=(500,))
t1.start()
t2.start()
t1.join()
t2.join()

print(f"Saldo finale: {saldo}")  # Ora il risultato è sempre 700 o "Fondi insufficienti"
```

### La Ballata del Thread Perduto
> Nella stanza dei thread  
> due corrono e si incontrano  
> uno scrive, l'altro legge  
> e il dato si frantuma in mille pezzi  
>
> "mettimi il lock!"  
> grida il programmatore stanco  
> "senza di esso  
> il mondo è un caos indeciso"  

### Il Consigli dello Chef
Usa sempre un mutex o un lock quando condividi dati tra thread. Se non puoi usarli, ripensa la tua architettura: forse i dati non dovrebbero essere condivisi. A volte, la soluzione migliore è non correre in parare.

---

## Capitolo 3 — Il Memory Leak: Il Fantasma che Non Muore

### Villanella
> Il consumo cresce, non si libera  
> la memoria è un giardino senza fine  
> ogni oggetto creato resta  
> come un fantasma che non si stanca  

> "Chi mi ha creato?"  
> chiede il garbage collector  
> ma nessuno risponde  
> e il processo diventa lento  

> Chiudi il file,  
> dealloca la lista,  
> rimuovi il callback  
> e il fantasma finalmente riposa  

### La Storia
Un memory leak è come un fantasma che non trova la pace. Un oggetto viene allocato in memoria, usato, e poi abbandonato — ma nessuno lo dealloca mai. Il garbage collector (in linguaggi gestiti come Python, Java, C#) non può liberare quell'oggetto perché ci sono ancora riferimenti ad esso, anche minimi, anche invisibili.

Nel tempo, i memory leak accumulano memoria fino a saturare la RAM. Il programma diventa lento, il sistema inizia a usare la swap, e infine — con un sospiro — il processo viene terminato dal sistema operativo, o peggio, il programma continua a vivere in uno stato di degrado perpetuo.

### Il Poema Completo

```
Ho aperto un file e non l'ho chiuso  
ho creato una lista e l'ho dimenticata  
ho registrato un callback senza rimuoverlo  
e la memoria ha iniziato a piangere  

Il garbage collector passa  
e guarda quell'oggetto lì  
"sei ancora referenziato," dice  
"quindi non ti libererò"  

Ma chi ti ha referenziato?  
era solo un puntatore in una funzione  
che non esiste più  
eppure tu resti  
un fantasma inutilizzato  

Chiudi il file,  
dealloca la lista,  
rimuovi il callback  
e il fantasma finalmente riposa  
```

### Spiegazione Tecnica

Un memory leak si verifica quando un programma alloca memoria (oggetti, buffer, connessioni, file handle) ma non la libera mai dopo l'uso. In linguaggi con garbage collection automatica, il leak avviene quando ci sono riferimenti involontari a oggetti che non sono più necessari — il garbage collector li considera ancora "vivo" e non li raccoglie.

Cause comuni:
- **Riferimenti circolari**: due oggetti si referenziano reciprocamente, impedendo la raccolta.
- **Callback e listener non rimossi**: un oggetto resta registrato in una lista globale.
- **Cache illimitate**: oggetti accumulati in una cache che cresce senza limite.
- **File e connessioni non chiuse**: un handle rimane aperto, e la memoria associata non viene rilasciata.

In Python, il modulo `gc` può essere usato per forzare la raccolta e identificare oggetti orfani. In Java, strumenti come VisualVM o MAT (Memory Analyzer Tool) aiutano a trovare i leak.

### Esempio di Codice

**Il bug:**
```python
def elabora_dati():
    dati = []
    for i in range(1000000):
        dati.append({"id": i, "valore": i * 2})
    # 'dati' non viene mai restituito o deallocato
    # La lista occupa memoria per sempre (fino alla fine della funzione)
    # Ma se la funzione viene chiamata in un ciclo, il problema si amplifica

for _ in range(100):
    elabora_dati()  # Ogni chiamata crea una lista da ~100MB
    # Memory leak in azione
```

**La correzione:**
```python
def elabora_dati():
    # Processa i dati e restituisci solo il risultato necessario
    risultato = []
    for i in range(1000000):
        # Elabora e rilascia i dati un alla volta
        if i % 2 == 0:
            risultato.append(i * 2)
    return risultato

# Usa un generatore per evitare di accumulare tutto in memoria
def elabora_dati_generatore():
    for i in range(1000000):
        yield {"id": i, "valore": i * 2}

# Il generatore produce un risultato alla volta
# La memoria rimane costante indipendentemente dal numero di iterazioni
```

### Il Limerick del Memory Leak
> Un programmatore scrisse  
> "non chiuderò mai il file"  
> la RAM crebbe, il processo pianse  
> e il server si spense  

### Il Consigli dello Chef
Ogni risorsa aperta deve essere chiusa. Ogni oggetto creato deve essere distrutto (o almeno, abbandonato senza riferimenti). Usa il contest manager `with` in Python per gestire automaticamente le risorse. E se sospetti un leak, esegui un profilo della memoria prima che il server diventi un mattone.

---

## Capitolo 4 — Il Null Pointer: La Freccia nel Vuoto

### Limerick
> C'era un puntatore null  
> che non sapeva dove andare  
> provo a dereferenziare  
> e il crash è arrivato  
> "errore fatale" disse il programmatore  

### La Storia
Il temuto "Null Pointer Exception" (o "Segmentation Fault" nei sistemi a basso livello) è l'errore che fa sudare freddo a qualsiasi programmatore. Si verifica quando il codice tenta di accedere alla memoria attraverso un puntatore che non punta a nulla — cioè è `null`. In Python, questo si manifesta come un `AttributeError` o `TypeError` quando si tenta di accedere a un attributo di `None`. In C o C++, provoca una segfault e la terminazione immediata del programma.

L'errore nasce spesso da dimenticanza: non si controlla se un valore è `None` prima di usarlo, o si assume che una funzione restituisca sempre un oggetto valido. La macchina, essere logico com'è, non può indovinare il tuo intento e ti costringe a confrontarti con la realtà di un puntatore vuoto.

### Il Poema Completo

```
Il puntatore non ha terra
sotto di sé nulla, solo vuoto
e il programma crolla
come una torre di carte
nel vento di un errore silente
```

### Spiegazione Tecnica

Un **Null Pointer** (o puntatore nullo) è un valore speciale che indica che il puntatore non punta a nessun oggetto o memoria valida. In molti linguaggi, è rappresentato dal valore `None` (Python), `null` (JavaScript, Java), `NULL` (C, C++).

L'errore avviene quando si tenta di **dereferenziare** un puntatore nullo, ovvero di leggere o scrivere nella memoria a cui il puntatore dovrebbe puntare, ma non punta da nessuna parte. Il comportamento è imprevedibile:

- In linguaggi gestiti (Python, Java, JavaScript), si solleva un'eccezione (`NullPointerException`, `AttributeError`, `TypeError`).
- In linguaggi non gestiti (C, C++), si ottiene un **segmentation fault** (accesso a memoria non assegnata), che causa la terminazione del programma.

Le cause comuni includono:
1. Non verificare il ritorno di una funzione che può restituire `None`.
2. Assumere che una variabile sia stata inizializzata.
3. Passare un puntatore non inizializzato a una funzione.
4. Bug di controllo errori che omettono il caso `null`.

La migliore pratica per prevenire i puntatori nulli è sempre controllare se un valore è `None` prima di utilizzarlo, utilizzare operatori di sicurezza null (come `?.` in JavaScript o l'operatore `or` in Python), e progettare le funzioni per restituire valori significativi o sollevare eccezioni appropriate invece di restituire `None` in modo silenzioso.

### Esempio di Codice

**Il bug:**
```python
def get_user_name(user):
    # Correzione: si controlla se user è None
    if user is None:
        return "Utente sconosciuto"
    return user.nome

# Oppure usando l'operatore or
def get_user_name_safe(user):
    return (user.nome if user else "Utente sconosciuto")

# Chiamata sicura
utente = None
nome = get_user_name_safe(utente)  # Restituisce "Utente sconosciuto" senza errore
```

### Il Consigli dello Chef
Prima di accedere a un attributo di un oggetto, chiediti sempre: *"Questa variabile potrebbe essere `None`?"* Usa controlli `is None` o l'operatore `or` per fornire valori di default. Ricorda che un crash dovuto a un puntatore nullo è un'occasione per migliorare il tuo codice, non un fallimento personale. Anche i programmatori più esperti inciampano in `None` di tanto in tanto — la differenza è che loro hanno un paracadute.

---

## Capitolo 5 — La Ricorsione Infinita: Lo Specchio Rotto

### Limerick
> C'era una funzione che chiamava se stessa  
> senza mai fermarsi, senza mai dire basta  
> lo stack si riempiva  
> di sogni non realizzati  
> e il programma moriva con un sospiro  

### La Storia
La ricorsione infinita è il sogno che diventa incubo. Quando una funzione chiama se stessa senza un caso base, il programma non si ferma — si perde in un abisso di chiamate, una dentro l'altra, fino a quando lo stack non può più contenere la memoria. È come guardarsi in uno specchio che riflette un altro specchio, e un altro, e un altro, fino a perdere il confine tra te e l'immagine.

Non è cattiveria. È l'oblio del caso base, la dimenticanza che ogni ricorsione deve un giorno tornare alla terra. Il programm recursivo sa che il caso base è la verità; chi lo dimentica, perde la strada.

### Il Poema Completo

```
La funzione chiama se stessa
come un eco che non si ferma
ogni chiamata è una porta
che si apre verso un'altra porta
fino a che il muro crolla
sotto il peso dei sogni
```

### Spiegazione Tecnica

La ricorsione infinita si verifica quando una funzione ricorsiva non raggiunge mai il caso base. In Python, questo causa un `RecursionError` quando lo stack supera il limite massimo (di default 1000 chiamate). In altri linguaggi potrebbe causare un overflow dello stack, corrompendo la memoria e causando un crash imprevedibile.

Per prevenire questo errore, assicurarsi sempre che:
1. Esista un caso base chiaro e raggiungibile.
2. Ogni chiamata ricorsiva avvicini i parametri al caso base (es. decrementare un valore).
3. Non si usi ricursione per problemi che possono essere risolti iterativamente.

### Esempio di Codice

**Il bug:**
```python
def conta_all_infinito(n):
    # Nessun caso base — ricorsione infinita
    return conta_all_infinito(n + 1)

# Chiamata che causa RecursionError
conta_all_infinito(0)
```

**La correzione:**
```python
def conta_fino_max(n, max_n=10):
    # Caso base chiaro
    if n >= max_n:
        return n
    return conta_fino_max(n + 1, max_n)

# Ora la ricorsione si ferma
print(conta_fino_max(0))  # Output: 10
```

### Il Consigli dello Chef
Se stai usando la ricorsione, chiediti sempre: *"Quando mi fermo?"* Se non hai una risposta chiara, non usare la ricorsione. La ricorsione è un potere, non una scusa per evitare il ciclo `for`.

---

## Capitolo 6 — Il Silenzio del Crash: Quando il Codice Non Parla

### Villanella
> *Il programma morì  
> senza dire una parola  
> nessun errore, nessun grido  
> solo il silenzio del server  
> e il cuore che si ferma  

### La Storia
Il crash silenzioso è il più pericoloso di tutti. Non c'è un messaggio di errore, non c'è un trace, non c'è un grido. Il programma semplicemente si ferma, come se avesse deciso di dormire per sempre. Potrebbe essere un deadlock, una race condition non rilevata, o semplicemente un processo che si blocca in attesa di qualcosa che non arriverà mai.

Questo silenzio è più spaventoso del caos: almeno nel caos sai che qualcosa sta succedendo. Nel silenzio, non sai nulla. E ciò che non sai può ucciderti.

### Il Poema Completo

```
Il codice si ferma
come un respiro che si trattiene
nessun errore grida
nessuna traccia resta
solo il vuoto
e il silenzio che diventa un'ombra
```

### Spiegazione Tecnica

Un crash silenzioso si verifica quando un programma si blocca senza generare un'eccezione visibile. Cause comuni:
- **Deadlock**: due thread si bloccano a vicenda, aspettando ciascuno una risorsa detenuta dall'altro.
- **L'attesa infinita**: un thread aspetta un evento che non si verifica mai (es. un timeout mancante, una connessione persa).
- **Segfault senza log**: un accesso a memoria non valida che non viene catturato.
- **Processo bloccato**: il sistema operativo termina il processo per ragioni esterne (memory limit, CPU limit).

Per diagnosticare questi problemi, usare strumenti di profiling e logging estensivo, e sempre implementare timeout e meccanismi di watchdog.

### Esempio di Codice

**Il bug:**
```python
def attendi_forever():
    # Nessun timeout, nessun meccanismo di uscita
    while True:
        data = receive()  # Blocca per sempre se non arriva nulla
        process(data)

# Chiamata che blocca il programma indefinitamente
attendi_forever()
```

**La correzione:**
```python
import signal

def attendi_sicuro(timeout=5):
    # Aggiungiamo un timeout per evitare il blocco infinito
    def handler(signum, frame):
        raise TimeoutError("Timeout raggiunto")

    signal.signal(signal.SIGALRM, handler)
    signal.alarm(timeout)

    try:
        data = receive()
        process(data)
    except TimeoutError:
        print("Timeout: il server non risponde")
    finally:
        signal.alarm(0)  # Disabilita il timeout

# Ora il programma non si blocca per sempre
attendi_sicuro(timeout=3)
```

### Il Consigli dello Chef
Se il tuo programma si è fermato senza dire nulla, non aspettare che parli. Aggiungi log, aggiungi timeout, aggiungi watchdog. Il silenzio non è pace — è un segnale di pericolo.

---

## Capitolo 7 — L'Errore di Tipo: Confusione tra Anime

### Limerick
> C'era un numero che voleva essere una stringa  
> ma la macchina non accettava l'inganno  
> "non posso sommare" disse il codice  
> e il programma morì con un grido  

### La Storia
L'errore di tipo è quando credi di avere un numero ma hai una stringa, o viceversa. È come parlare con qualcuno in una lingua che non conosci: le parole suonano simili, ma il significato è diverso. Il programmatore assume, la macchina rifiuta. L'assunzione è il padre di tutti gli errori di tipo.

### Il Poema Completo

```
Il numero diventa parola
e la parola diventa numero
ma mai nel momento giusto
il tipo si nasconde
come un camaleonte nel codice
```

### Spiegazione Tecnica

L'errore di tipo (`TypeError`) si verifica quando si tenta di eseguire un'operazione su un tipo di dato inappropriato. Esempi comuni: sommare un intero e una stringa, chiamare un metodo su `None`, passare un dizionario dove ci si aspetta una lista.

In Python, il controllo dei tipi è dinamico ma rigido: se un'operazione non ha senso per quel tipo, il programma solleva un'eccezione. La soluzione è sempre: verificare i tipi con `isinstance()`, usare annotazioni, e non assumere mai.

### Esempio di Codice

**Il bug:**
```python
def somma(a, b):
    return a + b

# Chiamata con tipi sbagliati
risultato = somma(5, "10")  # TypeError: unsupported operand type(s)
```

**La correzione:**
```python
def somma_sicura(a, b):
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Entrambi devono essere numeri")
    return a + b

risultato = somma_sicura(5, 10)  # Funziona
```

### Il Consigli dello Chef
Non assumere mai il tipo di un dato che arriva da un utente, un file o una rete. Verifica con `isinstance`, usa `typing` per documentare, e ricorda: un numero in veste di stringa è un bug in agguato.

---

## Capitolo 8 — Il Timeout: La Morte Lenta

### Limerick
> C'era una chiamata che attendeva  
> ma il server dormiva profondamente  
> il timeout era solo un sogno  
> e il programma morì lentamente  

### La Storia
Il timeout è la morte lenta. Non arriva come un grido, ma come un silenzio che si allunga. Un servizio esterno non risponde, una connessione si perde, un database diventa un fantasma. Il programma aspetta, aspetta, e poi — se sei fortunato — si ferma. Se non sei fortunato, aspetta per sempre.

### Il Poema Completo

```
Il tempo scorre ma non passa
la chiamata aspetta nel vuoto
il clock non aiuta
solo il timeout può liberare
il programma dalla prigione
```

### Spiegazione Tecnica

Un timeout si verifica quando un'operazione (rete, database, file) non completa entro un tempo definito. Senza timeout, il programma resta in attesa indefinita. In Python, usare `timeout` nei metodi `requests.get()`, `socket.settimeout()`, o `signal.alarm()`. Per operazioni asincrone, usare `asyncio.wait_for()`.

### Esempio di Codice

**Il bug:**
```python
import requests

# Nessun timeout — blocca per sempre se il server è giù
risposta = requests.get("https://esempio.com")
```

**La correzione:**
```python
try:
    risposta = requests.get("https://esempio.com", timeout=3)
    risposta.raise_for_status()
except requests.Timeout:
    print("Timeout: il server non risponde in tempo")
except requests.RequestException:
    print("Errore di rete")
```

### Il Consigli dello Chef
Se fai una chiamata esterna, guarda sempre il clock. Un timeout non è una debolezza — è un atto di responsabilità verso chi usa il tuo programma.

---

## Capitolo 9 — Lo Stato Globale: Il Sogno Condiviso

### Villanella
> *Una variabile globale era felice  
> ma poi un altro thread la cambiò  
> il mondo cadde nel caos  
> e il codice non sapeva chi era il padrone  

### La Storia
Lo stato globale è il sogno condiviso che diventa incubo. Quando più parti del programma accedono alla stessa variabile globale, il risultato dipende dall'ordine — e l'ordine è imprevedibile. È come una casa con una sola porta e molti entramenti: qualcuno entrerà quando non dovrebbe.

### Il Poema Completo

```
La variabile è di tutti
ma di nessuno nello stesso momento
il cambiamento arriva dal nulla
e il programma perde la memoria
del suo stesso nome
```

### Spiegazione Tecnica

Lo stato globale (`global` in Python, variabili statiche, singleton) rende il codice non deterministico e difficile da testare. Se più thread o processi modificano la stessa variabile, possono verificarsi race condition, dati corrotti, o comportamenti imprevedibili.

Soluzione: incapsulare lo stato in classi, usare pattern come Dependency Injection, e evitare `global` ovunque sia possibile.

### Esempio di Codice

**Il bug:**
```python
global_counter = 0

def incrementa():
    global global_counter
    global_counter += 1

# Due thread chiamano incrementa senza sincronizzazione
# Risultato imprevedibile
```

**La correzione:**
```python
class Counter:
    def __init__(self):
        self.value = 0
        self.lock = threading.Lock()

    def incrementa(self):
        with self.lock:
            self.value += 1

counter = Counter()
```

### Il Consigli dello Chef
Se vedi una variabile `global`, chiediti: *"Perché deve vivere al livello superiore?"* Spesso la risposta è che qualcuno ha avuto fretta. Rallenta, incapsula, proteggi.

---

## Capitolo 10 — Lo Swallow: Quando l'Eccezione Scompare

### Limerick
> C'era un except che non faceva nulla  
> e il bug si nascondeva nel silenzio  
> "tutto ok" diceva il programma  
> ma il cuore era rotto  

### La Storia
Lo swallow dell'eccezione è il silenzio che uccide. Quando un `except` cattura un errore e non fa nulla, il programma continua come se tutto fosse a posto — ma il mondo sotto è rotto. È come nascondere un incendio dietro una tenda: non c'è fumo, ma la casa brucia.

### Il Poema Completo

```
L'eccezione era lì
ma il codice la ignorò
il silenzio diventò
un grido mai emesso
il programma sorrise
mentre moriva dentro
```

### Spiegazione Tecnica

Lo swallowing di eccezioni si verifica quando un blocco `try/except` cattura un'eccezione ma non la gestisce, non la logga, non la rilancia. Questo nasconde errori gravi, impedisce il debugging, e può causare comportamenti imprevedibili in seguito.

Best practice: loggare sempre l'eccezione, rilanciarla se non è gestibile, e mai usare `except: pass` senza motivo.

### Esempio di Codice

**Il bug:**
```python
def leggi_file(percorso):
    try:
        with open(percorso) as f:
            return f.read()
    except:
        pass  # Nasconde l'errore!

# Se il file non esiste, restituisce None silenziosamente
```

**La correzione:**
```python
def leggi_file(percorso):
    try:
        with open(percorso) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File non trovato: {percorso}")
        raise
    except Exception as e:
        print(f"Errore inatteso: {e}")
        raise

# Ora gli errori sono visibili e gestibili
```

### Il Consigli dello Chef
Se usi `try/except`, chiediti: *"Cosa faccio se fallisce?"* Se la risposta è "niente", non usare il try. La trasparenza è la migliore cura.
