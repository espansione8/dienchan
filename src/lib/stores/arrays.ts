import { readable, writable } from 'svelte/store';

export const sidebarData = writable();

export const nazioni = readable([
    { value: "S", title: "Select" },
    { value: "AF", title: "Afghanistan" },
    { value: "AX", title: "Aland Islands" },
    { value: "AL", title: "Albania" },
    { value: "DZ", title: "Algeria" },
    { value: "AS", title: "American Samoa" },
    { value: "AD", title: "Andorra" },
    { value: "AO", title: "Angola" },
    { value: "AI", title: "Anguilla" },
    { value: "AQ", title: "Antarctica" },
    { value: "AG", title: "Antigua and Barbuda" },
    { value: "AR", title: "Argentina" },
    { value: "AM", title: "Armenia" },
    { value: "AW", title: "Aruba" },
    { value: "AU", title: "Australia" },
    { value: "AT", title: "Austria" },
    { value: "AZ", title: "Azerbaijan" },
    { value: "BS", title: "Bahamas" },
    { value: "BH", title: "Bahrain" },
    { value: "BD", title: "Bangladesh" },
    { value: "BB", title: "Barbados" },
    { value: "BY", title: "Belarus" },
    { value: "BE", title: "Belgium" },
    { value: "BZ", title: "Belize" },
    { value: "BJ", title: "Benin" },
    { value: "BM", title: "Bermuda" },
    { value: "BT", title: "Bhutan" },
    { value: "BO", title: "Bolivia" },
    { value: "BQ", title: "Bonaire, Sint Eustatius and Saba" },
    { value: "BA", title: "Bosnia and Herzegovina" },
    { value: "BW", title: "Botswana" },
    { value: "BV", title: "Bouvet Island" },
    { value: "BR", title: "Brazil" },
    { value: "IO", title: "British Indian Ocean Territory" },
    { value: "BN", title: "Brunei Darussalam" },
    { value: "BG", title: "Bulgaria" },
    { value: "BF", title: "Burkina Faso" },
    { value: "BI", title: "Burundi" },
    { value: "KH", title: "Cambodia" },
    { value: "CM", title: "Cameroon" },
    { value: "CA", title: "Canada" },
    { value: "CV", title: "Cape Verde" },
    { value: "KY", title: "Cayman Islands" },
    { value: "CF", title: "Central African Republic" },
    { value: "TD", title: "Chad" },
    { value: "CL", title: "Chile" },
    { value: "CN", title: "China" },
    { value: "CX", title: "Christmas Island" },
    { value: "CC", title: "Cocos (Keeling) Islands" },
    { value: "CO", title: "Colombia" },
    { value: "KM", title: "Comoros" },
    { value: "CG", title: "Congo" },
    { value: "CD", title: "Congo, Democratic Republic of the Congo" },
    { value: "CK", title: "Cook Islands" },
    { value: "CR", title: "Costa Rica" },
    { value: "CI", title: "Cote DIvoire" },
    { value: "HR", title: "Croatia" },
    { value: "CU", title: "Cuba" },
    { value: "CW", title: "Curacao" },
    { value: "CY", title: "Cyprus" },
    { value: "CZ", title: "Czech Republic" },
    { value: "DK", title: "Denmark" },
    { value: "DJ", title: "Djibouti" },
    { value: "DM", title: "Dominica" },
    { value: "DO", title: "Dominican Republic" },
    { value: "EC", title: "Ecuador" },
    { value: "EG", title: "Egypt" },
    { value: "SV", title: "El Salvador" },
    { value: "GQ", title: "Equatorial Guinea" },
    { value: "ER", title: "Eritrea" },
    { value: "EE", title: "Estonia" },
    { value: "ET", title: "Ethiopia" },
    { value: "FK", title: "Falkland Islands (Malvinas)" },
    { value: "FO", title: "Faroe Islands" },
    { value: "FJ", title: "Fiji" },
    { value: "FI", title: "Finland" },
    { value: "FR", title: "France" },
    { value: "GF", title: "French Guiana" },
    { value: "PF", title: "French Polynesia" },
    { value: "TF", title: "French Southern Territories" },
    { value: "GA", title: "Gabon" },
    { value: "GM", title: "Gambia" },
    { value: "GE", title: "Georgia" },
    { value: "DE", title: "Germany" },
    { value: "GH", title: "Ghana" },
    { value: "GI", title: "Gibraltar" },
    { value: "GR", title: "Greece" },
    { value: "GL", title: "Greenland" },
    { value: "GD", title: "Grenada" },
    { value: "GP", title: "Guadeloupe" },
    { value: "GU", title: "Guam" },
    { value: "GT", title: "Guatemala" },
    { value: "GG", title: "Guernsey" },
    { value: "GN", title: "Guinea" },
    { value: "GW", title: "Guinea-Bissau" },
    { value: "GY", title: "Guyana" },
    { value: "HT", title: "Haiti" },
    { value: "HM", title: "Heard Island and Mcdonald Islands" },
    { value: "VA", title: "Holy See (Vatican City State)" },
    { value: "HN", title: "Honduras" },
    { value: "HK", title: "Hong Kong" },
    { value: "HU", title: "Hungary" },
    { value: "IS", title: "Iceland" },
    { value: "IN", title: "India" },
    { value: "ID", title: "Indonesia" },
    { value: "IR", title: "Iran, Islamic Republic of" },
    { value: "IQ", title: "Iraq" },
    { value: "IE", title: "Ireland" },
    { value: "IM", title: "Isle of Man" },
    { value: "IL", title: "Israel" },
    { value: "IT", title: "Italy" },
    { value: "JM", title: "Jamaica" },
    { value: "JP", title: "Japan" },
    { value: "JE", title: "Jersey" },
    { value: "JO", title: "Jordan" },
    { value: "KZ", title: "Kazakhstan" },
    { value: "KE", title: "Kenya" },
    { value: "KI", title: "Kiribati" },
    { value: "KP", title: "Korea, Democratic People s Republic of" },
    { value: "KR", title: "Korea, Republic of" },
    { value: "XK", title: "Kosovo" },
    { value: "KW", title: "Kuwait" },
    { value: "KG", title: "Kyrgyzstan" },
])

export const country_list = readable([
    'Afghanistan',
    'Aland Islands',
    'Albania',
    'Algeria',
    'American Samoa',
    'Andorra',
    'Angola',
    'Anguilla',
    'Antarctica',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Aruba',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bermuda',
    'Bhutan',
    'Bolivia',
    'Bonaire, Sint Eustatius and Saba',
    'Bosnia and Herzegovina',
    'Botswana',
    'Bouvet Island',
    'Brazil',
    'British Indian Ocean Territory',
    'Brunei Darussalam',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Cape Verde',
    'Cayman Islands',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Christmas Island',
    'Cocos (Keeling) Islands',
    'Colombia',
    'Comoros',
    'Congo',
    'Congo, Democratic Republic of the Congo',
    'Cook Islands',
    'Costa Rica',
    'Cote DIvoire',
    'Croatia',
    'Cuba',
    'Curacao',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Ethiopia',
    'Falkland Islands (Malvinas)',
    'Faroe Islands',
    'Fiji',
    'Finland',
    'France',
    'French Guiana',
    'French Polynesia',
    'French Southern Territories',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Gibraltar',
    'Greece',
    'Greenland',
    'Grenada',
    'Guadeloupe',
    'Guam',
    'Guatemala',
    'Guernsey',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Heard Island and Mcdonald Islands',
    'Holy See (Vatican City State)',
    'Honduras',
    'Hong Kong',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran, Islamic Republic of',
    'Iraq',
    'Ireland',
    'Isle of Man',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Jersey',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Korea, Democratic People s Republic of',
    'Korea, Republic of',
    'Kosovo',
    'Kuwait',
    'Kyrgyzstan'
])

export const coursesInfo = readable([
    {
        id: "Conferenza di presentazione",
        title: "Conferenza di presentazione gratuita Dien Chan®",
        descr: "Conferenza introduttiva della Riflessologia Facciale Vietnamita DIEN CHAN®. Vieni a scoprire i vantaggi di questo meraviglioso e semplice metodo naturale per gestire la propria salute. Il viso è la parte più espressiva del nostro corpo ed è proprio nel viso che possiamo trovare la chiave per risolvere i nostri disagi. Nel corso della conferenza conoscerai la storia della nascita di questo metodo straordinario, come è stato reso semplice e praticabile da chiunque affinchè tutti potessero beneficiarne, come si pratica, come si impara e che aiuto può dare nella risoluzione di piccoli e grandi disagi.",
        urlPic: "/images/Conferenza_gratuita.jpg",
        bgColor: 'bg-blue-500',
        totalPrice: 0
    },
    {
        id: "Corso base",
        title: "Corso base Dien Chan®",
        descr: "E’ il primo passo per apprendere uno stupefacente metodo alternativo di gestione della propria salute. In questo corso vi saranno spiegate le mappe Dien Chan®, come usare i primi strumenti della riflessologia facciale, come applicare i cerottini riscaldanti Salonpas, i vari massaggi facciali, e molto altro ancora! Prendersi cura di Se Stessi con la Riflessologia facciale vietnamita -DIEN CHAN® BUI QUOC CHAU- in maniera semplice, con il solo utilizzo delle proprie mani. Un video/corso accurato per commentare tutti i passaggi da fare nel momento di bisogno o di aiuto immediato, usando gli schemi del Dien Chan® senza conoscere per forza le basi dell’utilizzo degli strumenti.",
        urlPic: "/images/corso_dienchan_base.jpg",
        bgColor: 'bg-green-500',
        totalPrice: 190
    },
    {
        id: "Corso avanzato",
        title: "Corso avanzato Dien Chan®",
        descr: "E’ il passo successivo dopo il corso base per approfondire altri 7 strumenti e tecniche del Dien Chan®. Molte altre risposte che aumenteranno la tua fiducia nell’usare il Dien Chan® per aiutare Te Stesso e gli Altri.",
        urlPic: "/images/corso_dienchan_avanzato.jpg",
        bgColor: 'bg-orange-500',
        totalPrice: 515
    },
    {
        id: "Workshop - Bellezza viso",
        title: "Workshop - Bellezza viso Dien Chan®",
        descr: "Un laboratorio, alla portata di tutti, per imparare ad utilizzare alcuni strumenti dedicati alla bellezza del viso, per poter fare una pulizia profonda, una stimolazione del microcircolo, per riattivare la produzione del collagene, per un riequilibrio idrico…tutto per poter avere, in 20-30 minuti di lavoro, un effetto incredibile di tonificazione con diminuzione delle rughe e una pelle più rosea e fine. Il trattamento proposto sarà adatto per tutti i tipi di pelle inoltre, stimolando il viso si andrà a stimolare per riflesso anche tutti gli organi interni e tutte le parti del corpo e, per l’effetto di “acqua che va verso la depressione”, cioè dell’energia che va dove serve, si avranno piacevoli “effetti collaterali” di un miglioramento generale dello stato di salute.",
        urlPic: "/images/corso_dienchan_bellezza_viso.jpg",
        bgColor: 'bg-purple-500',
        totalPrice: 55
    },
    {
        id: "Workshop - Difese immunitarie",
        title: "Workshop - Difese immunitarie Dien Chan®",
        descr: "In questo incontro di vi insegneremo alcuni massaggi generali di Dien Chan® che aiutano a rafforzare l’organismo e ad uscire dai disagi velocemente. Sono delle perle di questo metodo perchè molto semplici e, allo stesso tempo, sono il frutto di tanti ragionamenti e conoscenze. Inoltre, vi mostreremo alcuni massaggi per intervenire ai primi sintomi di mal di gola, raffreddore, tosse, mal di testa e malessere generalizzato. Infine, vi trasmetteremo alcune conoscenze popolari vietnamite, che hanno sempre dato ottimi risultati per gli stati influenzali, aiutando il corpo a disintossicare ed ad aumentare le difese immunitarie (vi faremo vedere anche come si cucinano le zuppe di riso che si fanno assumere agli ammalati affinchè guariscano velocemente: disintossicanti, nutrienti e leggere allo stesso tempo.",
        urlPic: "/images/corso_dienchan_difese.jpg",
        bgColor: 'bg-blue-500',
        totalPrice: 55
    },
    {
        id: "Workshop - Pronto soccorso",
        title: "Workshop - Pronto soccorso Dien Chan®",
        descr: "Prendersi cura di Se Stessi con la Riflessologia facciale vietnamita -DIEN CHAN® BUI QUOC CHAU- in maniera semplice, con il solo utilizzo delle proprie mani. Un video/corso accurato per commentare tutti i passaggi da fare nel momento di bisogno o di aiuto immediato, usando gli schemi del Dien Chan® senza conoscere per forza le basi dell’utilizzo degli strumenti. Il corso spiega come intervenire prontamente su 60 disagi comuni compiendo manovre con le mani.",
        urlPic: "/images/corso_dienchan_pronto_soccorso.jpg",
        bgColor: 'bg-blue-500',
        totalPrice: 55
    },
    {
        id: "Workshop - Occhi & Vista",
        title: "Workshop - Occhi & Vista Dien Chan®",
        descr: "Un laboratorio di 4 ore divise in vari incontri per imparare e praticare insieme come prendersi cura dei propri occhi , dei massaggi basati sulle teorie e tecniche di Dien Chan®. I massaggi proposti sono la semplificazione dei protocolli di trattamento per i problemi di vista praticati a lungo da diversi riflessologi vietnamiti. Non si baseranno su schemi complicati per rendere la pratica fattibile a tutti, anche ai più piccini o a coloro che non conoscono il Dien Chan® e i punti BQC. I partecipanti potranno vedere migliorare la vista di giorno in giorno, facendo la pratica quotidiana guidata. Potranno essere utilizzati gli strumenti specifici di Dien Chan® o anche solo le mani. Ovviamente con gli strumenti la pratica risulterà un pò più efficace e piacevole. Gli strumenti suggeriti sono: il doppio rastrello, il cercapunti, il martelletto, i monorulli yin yang lisci, i monorulli yin yang, i cerotti salonpas.",
        urlPic: "/images/corso_dienchan_occhi.jpg",
        bgColor: 'bg-blue-500',
        totalPrice: 60
    },
    {
        id: "Accademia",
        title: "Accademia Dien Chan®",
        descr: "Dopo aver completato il Corso base ed il corso Avanzato di approfondimento, è il momento di valutare se si vuole completare il percorso Accademia Italia ed eventualmente il Master livello 10 in Vietnam direttamente con il Prof. Bui Quoc Chau. Il completamento dell’accademia svolta in Italia tenuto da Truong Van Tri qualifica il frequentante ad essere Riflessologo in Italia. Una volta completato anche Il Master Dien Chan in Vietnam il Riflessologo è riconosciuto nel circuito internazionale del Centro Viet Y Dao in Vietnam del Prof. Bui Quoc Chau e qualificato anche formatore fino al 3° livello.",
        urlPic: "/images/corso_dienchan_accademia.jpg",
        bgColor: 'bg-red-500',
        totalPrice: 2525
    }
])

export const province = readable(
    [
        {
            "title": "Online",
            "code": "ON",
            "region": "Online"
        },
        {
            "title": "Agrigento",
            "code": "AG",
            "region": "Sicilia"
        },
        {
            "title": "Alessandria",
            "code": "AL",
            "region": "Piemonte"
        },
        {
            "title": "Ancona",
            "code": "AN",
            "region": "Marche"
        },
        {
            "title": "Arezzo",
            "code": "AR",
            "region": "Toscana"
        },
        {
            "title": "Ascoli Piceno",
            "code": "AP",
            "region": "Marche"
        },
        {
            "title": "Asti",
            "code": "AT",
            "region": "Piemonte"
        },
        {
            "title": "Avellino",
            "code": "AV",
            "region": "Campania"
        },
        {
            "title": "Bari",
            "code": "BA",
            "region": "Puglia"
        },
        {
            "title": "Barletta-Andria-Trani",
            "code": "BT",
            "region": "Puglia"
        },
        {
            "title": "Belluno",
            "code": "BL",
            "region": "Veneto"
        },
        {
            "title": "Benevento",
            "code": "BN",
            "region": "Campania"
        },
        {
            "title": "Bergamo",
            "code": "BG",
            "region": "Lombardia"
        },
        {
            "title": "Biella",
            "code": "BI",
            "region": "Piemonte"
        },
        {
            "title": "Bologna",
            "code": "BO",
            "region": "Emilia-Romagna"
        },
        {
            "title": "Bolzano/Bozen",
            "code": "BZ",
            "region": "Trentino-Alto Adige/Südtirol"
        },
        {
            "title": "Brescia",
            "code": "BS",
            "region": "Lombardia"
        },
        {
            "title": "Brindisi",
            "code": "BR",
            "region": "Puglia"
        },
        {
            "title": "Cagliari",
            "code": "CA",
            "region": "Sardegna"
        },
        {
            "title": "Caltanissetta",
            "code": "CL",
            "region": "Sicilia"
        },
        {
            "title": "Campobasso",
            "code": "CB",
            "region": "Molise"
        },
        {
            "title": "Carbonia-Iglesias",
            "code": "CI",
            "region": "Sardegna"
        },
        {
            "title": "Caserta",
            "code": "CE",
            "region": "Campania"
        },
        {
            "title": "Catania",
            "code": "CT",
            "region": "Sicilia"
        },
        {
            "title": "Catanzaro",
            "code": "CZ",
            "region": "Calabria"
        },
        {
            "title": "Chieti",
            "code": "CH",
            "region": "Abruzzo"
        },
        {
            "title": "Como",
            "code": "CO",
            "region": "Lombardia"
        },
        {
            "title": "Cosenza",
            "code": "CS",
            "region": "Calabria"
        },
        {
            "title": "Cremona",
            "code": "CR",
            "region": "Lombardia"
        },
        {
            "title": "Crotone",
            "code": "KR",
            "region": "Calabria"
        },
        {
            "title": "Cuneo",
            "code": "CN",
            "region": "Piemonte"
        },
        {
            "title": "Enna",
            "code": "EN",
            "region": "Sicilia"
        },
        {
            "title": "Fermo",
            "code": "FM",
            "region": "Marche"
        },
        {
            "title": "Ferrara",
            "code": "FE",
            "region": "Emilia-Romagna"
        },
        {
            "title": "Firenze",
            "code": "FI",
            "region": "Toscana"
        },
        {
            "title": "Foggia",
            "code": "FG",
            "region": "Puglia"
        },
        {
            "title": "Forlì-Cesena",
            "code": "FC",
            "region": "Emilia-Romagna"
        },
        {
            "title": "Frosinone",
            "code": "FR",
            "region": "Lazio"
        },
        {
            "title": "Genova",
            "code": "GE",
            "region": "Liguria"
        },
        {
            "title": "Gorizia",
            "code": "GO",
            "region": "Friuli-Venezia Giulia"
        },
        {
            "title": "Grosseto",
            "code": "GR",
            "region": "Toscana"
        },
        {
            "title": "Imperia",
            "code": "IM",
            "region": "Liguria"
        },
        {
            "title": "Isernia",
            "code": "IS",
            "region": "Molise"
        },
        {
            "title": "L'Aquila",
            "code": "AQ",
            "region": "Abruzzo"
        },
        {
            "title": "La Spezia",
            "code": "SP",
            "region": "Liguria"
        },
        {
            "title": "Latina",
            "code": "LT",
            "region": "Lazio"
        },
        {
            "title": "Lecce",
            "code": "LE",
            "region": "Puglia"
        },
        {
            "title": "Lecco",
            "code": "LC",
            "region": "Lombardia"
        },
        {
            "title": "Livorno",
            "code": "LI",
            "region": "Toscana"
        },
        {
            "title": "Lodi",
            "code": "LO",
            "region": "Lombardia"
        },
        {
            "title": "Lucca",
            "code": "LU",
            "region": "Toscana"
        },
        {
            "title": "Macerata",
            "code": "MC",
            "region": "Marche"
        },
        {
            "title": "Mantova",
            "code": "MN",
            "region": "Lombardia"
        },
        {
            "title": "Massa-Carrara",
            "code": "MS",
            "region": "Toscana"
        },
        {
            "title": "Matera",
            "code": "MT",
            "region": "Basilicata"
        },
        {
            "title": "Medio Campidano",
            "code": "VS",
            "region": "Sardegna"
        },
        {
            "title": "Messina",
            "code": "ME",
            "region": "Sicilia"
        },
        {
            "title": "Milano",
            "code": "MI",
            "region": "Lombardia"
        },
        {
            "title": "Modena",
            "code": "MO",
            "region": "Emilia-Romagna"
        },
        {
            "title": "Monza e della Brianza",
            "code": "MB",
            "region": "Lombardia"
        },
        {
            "title": "Napoli",
            "code": "NA",
            "region": "Campania"
        },
        {
            "title": "Novara",
            "code": "NO",
            "region": "Piemonte"
        },
        {
            "title": "Nuoro",
            "code": "NU",
            "region": "Sardegna"
        },
        {
            "title": "Ogliastra",
            "code": "OG",
            "region": "Sardegna"
        },
        {
            "title": "Olbia-Tempio",
            "code": "OT",
            "region": "Sardegna"
        },
        {
            "title": "Oristano",
            "code": "OR",
            "region": "Sardegna"
        },
        {
            "title": "Padova",
            "code": "PD",
            "region": "Veneto"
        },
        {
            "title": "Palermo",
            "code": "PA",
            "region": "Sicilia"
        },
        {
            "title": "Parma",
            "code": "PR",
            "region": "Emilia-Romagna"
        },
        {
            "title": "Pavia",
            "code": "PV",
            "region": "Lombardia"
        },
        {
            "title": "Perugia",
            "code": "PG",
            "region": "Umbria"
        },
        {
            "title": "Pesaro e Urbino",
            "code": "PU",
            "region": "Marche"
        },
        {
            "title": "Pescara",
            "code": "PE",
            "region": "Abruzzo"
        },
        {
            "title": "Piacenza",
            "code": "PC",
            "region": "Emilia-Romagna"
        },
        {
            "title": "Pisa",
            "code": "PI",
            "region": "Toscana"
        },
        {
            "title": "Pistoia",
            "code": "PT",
            "region": "Toscana"
        },
        {
            "title": "Pordenone",
            "code": "PN",
            "region": "Friuli-Venezia Giulia"
        },
        {
            "title": "Potenza",
            "code": "PZ",
            "region": "Basilicata"
        },
        {
            "title": "Prato",
            "code": "PO",
            "region": "Toscana"
        },
        {
            "title": "Ragusa",
            "code": "RG",
            "region": "Sicilia"
        },
        {
            "title": "Ravenna",
            "code": "RA",
            "region": "Emilia-Romagna"
        },
        {
            "title": "Reggio di Calabria",
            "code": "RC",
            "region": "Calabria"
        },
        {
            "title": "Reggio nell'Emilia",
            "code": "RE",
            "region": "Emilia-Romagna"
        },
        {
            "title": "Rieti",
            "code": "RI",
            "region": "Lazio"
        },
        {
            "title": "Rimini",
            "code": "RN",
            "region": "Emilia-Romagna"
        },
        {
            "title": "Roma",
            "code": "RM",
            "region": "Lazio"
        },
        {
            "title": "Rovigo",
            "code": "RO",
            "region": "Veneto"
        },
        {
            "title": "Salerno",
            "code": "SA",
            "region": "Campania"
        },
        {
            "title": "Sassari",
            "code": "SS",
            "region": "Sardegna"
        },
        {
            "title": "Savona",
            "code": "SV",
            "region": "Liguria"
        },
        {
            "title": "Siena",
            "code": "SI",
            "region": "Toscana"
        },
        {
            "title": "Siracusa",
            "code": "SR",
            "region": "Sicilia"
        },
        {
            "title": "Sondrio",
            "code": "SO",
            "region": "Lombardia"
        },
        {
            "title": "Taranto",
            "code": "TA",
            "region": "Puglia"
        },
        {
            "title": "Teramo",
            "code": "TE",
            "region": "Abruzzo"
        },
        {
            "title": "Terni",
            "code": "TR",
            "region": "Umbria"
        },
        {
            "title": "Torino",
            "code": "TO",
            "region": "Piemonte"
        },
        {
            "title": "Trapani",
            "code": "TP",
            "region": "Sicilia"
        },
        {
            "title": "Trento",
            "code": "TN",
            "region": "Trentino-Alto Adige/Südtirol"
        },
        {
            "title": "Treviso",
            "code": "TV",
            "region": "Veneto"
        },
        {
            "title": "Trieste",
            "code": "TS",
            "region": "Friuli-Venezia Giulia"
        },
        {
            "title": "Udine",
            "code": "UD",
            "region": "Friuli-Venezia Giulia"
        },
        {
            "title": "Valle d'Aosta/Vallée d'Aoste",
            "code": "AO",
            "region": "Valle d'Aosta/Vallée d'Aoste"
        },
        {
            "title": "Varese",
            "code": "VA",
            "region": "Lombardia"
        },
        {
            "title": "Venezia",
            "code": "VE",
            "region": "Veneto"
        },
        {
            "title": "Verbano-Cusio-Ossola",
            "code": "VB",
            "region": "Piemonte"
        },
        {
            "title": "Vercelli",
            "code": "VC",
            "region": "Piemonte"
        },
        {
            "title": "Verona",
            "code": "VR",
            "region": "Veneto"
        },
        {
            "title": "Vibo Valentia",
            "code": "VV",
            "region": "Calabria"
        },
        {
            "title": "Vicenza",
            "code": "VI",
            "region": "Veneto"
        },
        {
            "title": "Viterbo",
            "code": "VT",
            "region": "Lazio"
        }
    ]

)

export const hours = readable([
    "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"
])

export const minutes = readable([
    "00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"
])

export const days = readable([
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"
])

export const months = readable([
    { title: 'Gennaio', value: "01" },
    { title: 'Febbraio', value: "02" },
    { title: 'Marzo', value: "03" },
    { title: 'Aprile', value: "04" },
    { title: 'Maggio', value: "05" },
    { title: 'Giugno', value: "06" },
    { title: 'Luglio', value: "07" },
    { title: 'Agosto', value: "08" },
    { title: 'Settembre', value: "09" },
    { title: 'Ottobre', value: "10" },
    { title: 'Novembre', value: "11" },
    { title: 'Dicembre', value: "12" }
])

export const monthsShort = readable([
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre'
])
