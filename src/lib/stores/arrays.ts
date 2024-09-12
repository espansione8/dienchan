import { readable } from 'svelte/store';

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
        id: "Corso base",
        title: "Corso base Dien Chan®",
        descr: "E’ il primo passo per apprendere uno stupefacente metodo alternativo di gestione della propria salute. In questo corso vi saranno spiegate le mappe Dien Chan®, come usare i primi strumenti della riflessologia facciale, come applicare i cerottini riscaldanti Salonpas, i vari massaggi facciali, e molto altro ancora! Prendersi cura di Se Stessi con la Riflessologia facciale vietnamita -DIEN CHAN® BUI QUOC CHAU- in maniera semplice, con il solo utilizzo delle proprie mani. Un video/corso accurato per commentare tutti i passaggi da fare nel momento di bisogno o di aiuto immediato, usando gli schemi del Dien Chan® senza conoscere per forza le basi dell’utilizzo degli strumenti.",
        urlPic: "/images/corso_dienchan_base.jpg",
        bgColor: 'bg-green-500',
        totalPrice: 50
    },
    {
        id: "Corso avanzato",
        title: "Corso avanzato Dien Chan®",
        descr: "E’ il passo successivo dopo il corso base per approfondire altri 7 strumenti e tecniche del Dien Chan®. Molte altre risposte che aumenteranno la tua fiducia nell’usare il Dien Chan® per aiutare Te Stesso e gli Altri.",
        urlPic: "/images/corso_dienchan_avanzato.jpg",
        bgColor: 'bg-orange-500',
        totalPrice: 150
    },
    {
        id: "Workshop - Bellezza viso",
        title: "Workshop - Bellezza viso Dien Chan®",
        descr: "Un laboratorio, alla portata di tutti, per imparare ad utilizzare alcuni strumenti dedicati alla bellezza del viso, per poter fare una pulizia profonda, una stimolazione del microcircolo, per riattivare la produzione del collagene, per un riequilibrio idrico…tutto per poter avere, in 20-30 minuti di lavoro, un effetto incredibile di tonificazione con diminuzione delle rughe e una pelle più rosea e fine. Il trattamento proposto sarà adatto per tutti i tipi di pelle inoltre, stimolando il viso si andrà a stimolare per riflesso anche tutti gli organi interni e tutte le parti del corpo e, per l’effetto di “acqua che va verso la depressione”, cioè dell’energia che va dove serve, si avranno piacevoli “effetti collaterali” di un miglioramento generale dello stato di salute.",
        urlPic: "/images/corso_dienchan_bellezza_viso.jpg",
        bgColor: 'bg-purple-500',
        totalPrice: 80
    },
    {
        id: "Workshop - Difese immunitarie",
        title: "Workshop - Difese immunitarie Dien Chan®",
        descr: "In questo incontro di vi insegneremo alcuni massaggi generali di Dien Chan® che aiutano a rafforzare l’organismo e ad uscire dai disagi velocemente. Sono delle perle di questo metodo perchè molto semplici e, allo stesso tempo, sono il frutto di tanti ragionamenti e conoscenze. Inoltre, vi mostreremo alcuni massaggi per intervenire ai primi sintomi di mal di gola, raffreddore, tosse, mal di testa e malessere generalizzato. Infine, vi trasmetteremo alcune conoscenze popolari vietnamite, che hanno sempre dato ottimi risultati per gli stati influenzali, aiutando il corpo a disintossicare ed ad aumentare le difese immunitarie (vi faremo vedere anche come si cucinano le zuppe di riso che si fanno assumere agli ammalati affinchè guariscano velocemente: disintossicanti, nutrienti e leggere allo stesso tempo.",
        urlPic: "/images/corso_dienchan_difese.jpg",
        bgColor: 'bg-blue-500',
        totalPrice: 120
    },
    {
        id: "Workshop - Pronto soccorso",
        title: "Workshop - Pronto soccorso Dien Chan®",
        descr: "Prendersi cura di Se Stessi con la Riflessologia facciale vietnamita -DIEN CHAN® BUI QUOC CHAU- in maniera semplice, con il solo utilizzo delle proprie mani. Un video/corso accurato per commentare tutti i passaggi da fare nel momento di bisogno o di aiuto immediato, usando gli schemi del Dien Chan® senza conoscere per forza le basi dell’utilizzo degli strumenti. Il corso spiega come intervenire prontamente su 60 disagi comuni compiendo manovre con le mani.",
        urlPic: "/images/corso_dienchan_pronto_soccorso.jpg",
        bgColor: 'bg-blue-500',
        totalPrice: 75
    },
    {
        id: "Workshop - Occhi & Vista",
        title: "Workshop - Occhi & Vista Dien Chan®",
        descr: "Un laboratorio di 4 ore divise in vari incontri per imparare e praticare insieme come prendersi cura dei propri occhi , dei massaggi basati sulle teorie e tecniche di Dien Chan®. I massaggi proposti sono la semplificazione dei protocolli di trattamento per i problemi di vista praticati a lungo da diversi riflessologi vietnamiti. Non si baseranno su schemi complicati per rendere la pratica fattibile a tutti, anche ai più piccini o a coloro che non conoscono il Dien Chan® e i punti BQC. I partecipanti potranno vedere migliorare la vista di giorno in giorno, facendo la pratica quotidiana guidata. Potranno essere utilizzati gli strumenti specifici di Dien Chan® o anche solo le mani. Ovviamente con gli strumenti la pratica risulterà un pò più efficace e piacevole. Gli strumenti suggeriti sono: il doppio rastrello, il cercapunti, il martelletto, i monorulli yin yang lisci, i monorulli yin yang, i cerotti salonpas.",
        urlPic: "/images/corso_dienchan_occhi.jpg",
        bgColor: 'bg-blue-500',
        totalPrice: 200
    },
    {
        id: "Accademia",
        title: "Accademia Dien Chan®",
        descr: "Dopo aver completato il Corso base ed il corso Avanzato di approfondimento, è il momento di valutare se si vuole completare il percorso Accademia Italia ed eventualmente il Master livello 10 in Vietnam direttamente con il Prof. Bui Quoc Chau. Il completamento dell’accademia svolta in Italia tenuto da Truong Van Tri qualifica il frequentante ad essere Riflessologo in Italia. Una volta completato anche Il Master Dien Chan in Vietnam il Riflessologo è riconosciuto nel circuito internazionale del Centro Viet Y Dao in Vietnam del Prof. Bui Quoc Chau e qualificato anche formatore fino al 3° livello.",
        urlPic: "/images/corso_dienchan_accademia.jpg",
        bgColor: 'bg-red-500',
        totalPrice: 180
    }
])

export const province = readable(
    [
        {
            "nome": "Online",
            "sigla": "ON",
            "regione": "Online"
        },
        {
            "nome": "Agrigento",
            "sigla": "AG",
            "regione": "Sicilia"
        },
        {
            "nome": "Alessandria",
            "sigla": "AL",
            "regione": "Piemonte"
        },
        {
            "nome": "Ancona",
            "sigla": "AN",
            "regione": "Marche"
        },
        {
            "nome": "Arezzo",
            "sigla": "AR",
            "regione": "Toscana"
        },
        {
            "nome": "Ascoli Piceno",
            "sigla": "AP",
            "regione": "Marche"
        },
        {
            "nome": "Asti",
            "sigla": "AT",
            "regione": "Piemonte"
        },
        {
            "nome": "Avellino",
            "sigla": "AV",
            "regione": "Campania"
        },
        {
            "nome": "Bari",
            "sigla": "BA",
            "regione": "Puglia"
        },
        {
            "nome": "Barletta-Andria-Trani",
            "sigla": "BT",
            "regione": "Puglia"
        },
        {
            "nome": "Belluno",
            "sigla": "BL",
            "regione": "Veneto"
        },
        {
            "nome": "Benevento",
            "sigla": "BN",
            "regione": "Campania"
        },
        {
            "nome": "Bergamo",
            "sigla": "BG",
            "regione": "Lombardia"
        },
        {
            "nome": "Biella",
            "sigla": "BI",
            "regione": "Piemonte"
        },
        {
            "nome": "Bologna",
            "sigla": "BO",
            "regione": "Emilia-Romagna"
        },
        {
            "nome": "Bolzano/Bozen",
            "sigla": "BZ",
            "regione": "Trentino-Alto Adige/Südtirol"
        },
        {
            "nome": "Brescia",
            "sigla": "BS",
            "regione": "Lombardia"
        },
        {
            "nome": "Brindisi",
            "sigla": "BR",
            "regione": "Puglia"
        },
        {
            "nome": "Cagliari",
            "sigla": "CA",
            "regione": "Sardegna"
        },
        {
            "nome": "Caltanissetta",
            "sigla": "CL",
            "regione": "Sicilia"
        },
        {
            "nome": "Campobasso",
            "sigla": "CB",
            "regione": "Molise"
        },
        {
            "nome": "Carbonia-Iglesias",
            "sigla": "CI",
            "regione": "Sardegna"
        },
        {
            "nome": "Caserta",
            "sigla": "CE",
            "regione": "Campania"
        },
        {
            "nome": "Catania",
            "sigla": "CT",
            "regione": "Sicilia"
        },
        {
            "nome": "Catanzaro",
            "sigla": "CZ",
            "regione": "Calabria"
        },
        {
            "nome": "Chieti",
            "sigla": "CH",
            "regione": "Abruzzo"
        },
        {
            "nome": "Como",
            "sigla": "CO",
            "regione": "Lombardia"
        },
        {
            "nome": "Cosenza",
            "sigla": "CS",
            "regione": "Calabria"
        },
        {
            "nome": "Cremona",
            "sigla": "CR",
            "regione": "Lombardia"
        },
        {
            "nome": "Crotone",
            "sigla": "KR",
            "regione": "Calabria"
        },
        {
            "nome": "Cuneo",
            "sigla": "CN",
            "regione": "Piemonte"
        },
        {
            "nome": "Enna",
            "sigla": "EN",
            "regione": "Sicilia"
        },
        {
            "nome": "Fermo",
            "sigla": "FM",
            "regione": "Marche"
        },
        {
            "nome": "Ferrara",
            "sigla": "FE",
            "regione": "Emilia-Romagna"
        },
        {
            "nome": "Firenze",
            "sigla": "FI",
            "regione": "Toscana"
        },
        {
            "nome": "Foggia",
            "sigla": "FG",
            "regione": "Puglia"
        },
        {
            "nome": "Forlì-Cesena",
            "sigla": "FC",
            "regione": "Emilia-Romagna"
        },
        {
            "nome": "Frosinone",
            "sigla": "FR",
            "regione": "Lazio"
        },
        {
            "nome": "Genova",
            "sigla": "GE",
            "regione": "Liguria"
        },
        {
            "nome": "Gorizia",
            "sigla": "GO",
            "regione": "Friuli-Venezia Giulia"
        },
        {
            "nome": "Grosseto",
            "sigla": "GR",
            "regione": "Toscana"
        },
        {
            "nome": "Imperia",
            "sigla": "IM",
            "regione": "Liguria"
        },
        {
            "nome": "Isernia",
            "sigla": "IS",
            "regione": "Molise"
        },
        {
            "nome": "L'Aquila",
            "sigla": "AQ",
            "regione": "Abruzzo"
        },
        {
            "nome": "La Spezia",
            "sigla": "SP",
            "regione": "Liguria"
        },
        {
            "nome": "Latina",
            "sigla": "LT",
            "regione": "Lazio"
        },
        {
            "nome": "Lecce",
            "sigla": "LE",
            "regione": "Puglia"
        },
        {
            "nome": "Lecco",
            "sigla": "LC",
            "regione": "Lombardia"
        },
        {
            "nome": "Livorno",
            "sigla": "LI",
            "regione": "Toscana"
        },
        {
            "nome": "Lodi",
            "sigla": "LO",
            "regione": "Lombardia"
        },
        {
            "nome": "Lucca",
            "sigla": "LU",
            "regione": "Toscana"
        },
        {
            "nome": "Macerata",
            "sigla": "MC",
            "regione": "Marche"
        },
        {
            "nome": "Mantova",
            "sigla": "MN",
            "regione": "Lombardia"
        },
        {
            "nome": "Massa-Carrara",
            "sigla": "MS",
            "regione": "Toscana"
        },
        {
            "nome": "Matera",
            "sigla": "MT",
            "regione": "Basilicata"
        },
        {
            "nome": "Medio Campidano",
            "sigla": "VS",
            "regione": "Sardegna"
        },
        {
            "nome": "Messina",
            "sigla": "ME",
            "regione": "Sicilia"
        },
        {
            "nome": "Milano",
            "sigla": "MI",
            "regione": "Lombardia"
        },
        {
            "nome": "Modena",
            "sigla": "MO",
            "regione": "Emilia-Romagna"
        },
        {
            "nome": "Monza e della Brianza",
            "sigla": "MB",
            "regione": "Lombardia"
        },
        {
            "nome": "Napoli",
            "sigla": "NA",
            "regione": "Campania"
        },
        {
            "nome": "Novara",
            "sigla": "NO",
            "regione": "Piemonte"
        },
        {
            "nome": "Nuoro",
            "sigla": "NU",
            "regione": "Sardegna"
        },
        {
            "nome": "Ogliastra",
            "sigla": "OG",
            "regione": "Sardegna"
        },
        {
            "nome": "Olbia-Tempio",
            "sigla": "OT",
            "regione": "Sardegna"
        },
        {
            "nome": "Oristano",
            "sigla": "OR",
            "regione": "Sardegna"
        },
        {
            "nome": "Padova",
            "sigla": "PD",
            "regione": "Veneto"
        },
        {
            "nome": "Palermo",
            "sigla": "PA",
            "regione": "Sicilia"
        },
        {
            "nome": "Parma",
            "sigla": "PR",
            "regione": "Emilia-Romagna"
        },
        {
            "nome": "Pavia",
            "sigla": "PV",
            "regione": "Lombardia"
        },
        {
            "nome": "Perugia",
            "sigla": "PG",
            "regione": "Umbria"
        },
        {
            "nome": "Pesaro e Urbino",
            "sigla": "PU",
            "regione": "Marche"
        },
        {
            "nome": "Pescara",
            "sigla": "PE",
            "regione": "Abruzzo"
        },
        {
            "nome": "Piacenza",
            "sigla": "PC",
            "regione": "Emilia-Romagna"
        },
        {
            "nome": "Pisa",
            "sigla": "PI",
            "regione": "Toscana"
        },
        {
            "nome": "Pistoia",
            "sigla": "PT",
            "regione": "Toscana"
        },
        {
            "nome": "Pordenone",
            "sigla": "PN",
            "regione": "Friuli-Venezia Giulia"
        },
        {
            "nome": "Potenza",
            "sigla": "PZ",
            "regione": "Basilicata"
        },
        {
            "nome": "Prato",
            "sigla": "PO",
            "regione": "Toscana"
        },
        {
            "nome": "Ragusa",
            "sigla": "RG",
            "regione": "Sicilia"
        },
        {
            "nome": "Ravenna",
            "sigla": "RA",
            "regione": "Emilia-Romagna"
        },
        {
            "nome": "Reggio di Calabria",
            "sigla": "RC",
            "regione": "Calabria"
        },
        {
            "nome": "Reggio nell'Emilia",
            "sigla": "RE",
            "regione": "Emilia-Romagna"
        },
        {
            "nome": "Rieti",
            "sigla": "RI",
            "regione": "Lazio"
        },
        {
            "nome": "Rimini",
            "sigla": "RN",
            "regione": "Emilia-Romagna"
        },
        {
            "nome": "Roma",
            "sigla": "RM",
            "regione": "Lazio"
        },
        {
            "nome": "Rovigo",
            "sigla": "RO",
            "regione": "Veneto"
        },
        {
            "nome": "Salerno",
            "sigla": "SA",
            "regione": "Campania"
        },
        {
            "nome": "Sassari",
            "sigla": "SS",
            "regione": "Sardegna"
        },
        {
            "nome": "Savona",
            "sigla": "SV",
            "regione": "Liguria"
        },
        {
            "nome": "Siena",
            "sigla": "SI",
            "regione": "Toscana"
        },
        {
            "nome": "Siracusa",
            "sigla": "SR",
            "regione": "Sicilia"
        },
        {
            "nome": "Sondrio",
            "sigla": "SO",
            "regione": "Lombardia"
        },
        {
            "nome": "Taranto",
            "sigla": "TA",
            "regione": "Puglia"
        },
        {
            "nome": "Teramo",
            "sigla": "TE",
            "regione": "Abruzzo"
        },
        {
            "nome": "Terni",
            "sigla": "TR",
            "regione": "Umbria"
        },
        {
            "nome": "Torino",
            "sigla": "TO",
            "regione": "Piemonte"
        },
        {
            "nome": "Trapani",
            "sigla": "TP",
            "regione": "Sicilia"
        },
        {
            "nome": "Trento",
            "sigla": "TN",
            "regione": "Trentino-Alto Adige/Südtirol"
        },
        {
            "nome": "Treviso",
            "sigla": "TV",
            "regione": "Veneto"
        },
        {
            "nome": "Trieste",
            "sigla": "TS",
            "regione": "Friuli-Venezia Giulia"
        },
        {
            "nome": "Udine",
            "sigla": "UD",
            "regione": "Friuli-Venezia Giulia"
        },
        {
            "nome": "Valle d'Aosta/Vallée d'Aoste",
            "sigla": "AO",
            "regione": "Valle d'Aosta/Vallée d'Aoste"
        },
        {
            "nome": "Varese",
            "sigla": "VA",
            "regione": "Lombardia"
        },
        {
            "nome": "Venezia",
            "sigla": "VE",
            "regione": "Veneto"
        },
        {
            "nome": "Verbano-Cusio-Ossola",
            "sigla": "VB",
            "regione": "Piemonte"
        },
        {
            "nome": "Vercelli",
            "sigla": "VC",
            "regione": "Piemonte"
        },
        {
            "nome": "Verona",
            "sigla": "VR",
            "regione": "Veneto"
        },
        {
            "nome": "Vibo Valentia",
            "sigla": "VV",
            "regione": "Calabria"
        },
        {
            "nome": "Vicenza",
            "sigla": "VI",
            "regione": "Veneto"
        },
        {
            "nome": "Viterbo",
            "sigla": "VT",
            "regione": "Lazio"
        }
    ]

)