import pickle
from shapely.geometry import Point
from shapely.strtree import STRtree
CELLS = pickle.load(open('cells.pkl', 'rb'))
arbre = STRtree([c['geom'] for c in CELLS])
# (ville, lon, lat, attendu 1812, attendu 1815) ; 'CDR*' = n'importe quel membre de la Confédération du Rhin
T = [
 ('Paris',2.35,48.86,'EMP','FRA'),('Lyon',4.84,45.76,'EMP','FRA'),('Marseille',5.37,43.3,'EMP','FRA'),('Strasbourg',7.75,48.58,'EMP','FRA'),
 ('Nice',7.27,43.7,'EMP','SAR'),('Grasse',6.92,43.66,'EMP','FRA'),('Antibes',7.12,43.58,'EMP','FRA'),('Chambéry',5.92,45.57,'EMP','SAR'),('Annecy',6.13,45.9,'EMP','SAR'),
 ('Genève',6.14,46.2,'EMP','SUI'),('Sion',7.36,46.23,'EMP','SUI'),('Porrentruy',7.08,47.42,'EMP','SUI'),('Neuchâtel',6.93,46.99,'NEU','SUI'),('Berne',7.45,46.95,'SUI','SUI'),('Zurich',8.54,47.37,'SUI','SUI'),
 ('Ajaccio',8.74,41.92,'EMP','FRA'),('Bruxelles',4.35,50.85,'EMP','NLD'),('Liège',5.57,50.63,'EMP','NLD'),('Eupen',6.03,50.63,'EMP','PRU'),('Malmedy',6.03,50.43,'EMP','PRU'),
 ('Arlon',5.81,49.68,'EMP','NLD'),('Luxembourg',6.13,49.61,'EMP','NLD'),('Amsterdam',4.9,52.37,'EMP','NLD'),('Groningue',6.57,53.22,'EMP','NLD'),('Maastricht',5.69,50.85,'EMP','NLD'),
 ('Aix-la-Chapelle',6.08,50.78,'EMP','PRU'),('Cologne',6.95,50.94,'EMP','PRU'),('Düsseldorf',6.79,51.23,'CDR*','PRU'),('Krefeld',6.56,51.33,'EMP','PRU'),('Clèves',6.14,51.79,'EMP','PRU'),
 ('Münster',7.63,51.96,'EMP','PRU'),('Osnabrück',8.05,52.28,'EMP','HAN'),('Bielefeld',8.53,52.02,'CDR*','PRU'),('Paderborn',8.75,51.72,'CDR*','PRU'),('Dortmund',7.47,51.51,'CDR*','PRU'),
 ('Essen',7.01,51.46,'CDR*','PRU'),('Detmold',8.88,51.94,'CDR*','GER'),('Oldenbourg',8.21,53.14,'EMP','GER'),('Emden',7.21,53.37,'EMP','HAN'),('Brême',8.8,53.08,'EMP','GER'),
 ('Hambourg',9.99,53.55,'EMP','GER'),('Lübeck',10.69,53.87,'EMP','GER'),('Lunebourg',10.41,53.25,'EMP','HAN'),('Hanovre',9.73,52.37,'CDR*','HAN'),('Celle',10.08,52.62,'CDR*','HAN'),
 ('Stade',9.48,53.6,'EMP','HAN'),('Göttingen',9.93,51.53,'CDR*','HAN'),('Hildesheim',9.95,52.15,'CDR*','HAN'),('Brunswick',10.52,52.27,'CDR*','GER'),('Wolfenbüttel',10.54,52.16,'CDR*','GER'),
 ('Holzminden',9.5,51.83,'CDR*','GER'),('Goslar',10.43,51.91,'CDR*','HAN'),('Bückeburg',9.05,52.26,'CDR*','GER'),('Meppen',7.29,52.69,'EMP','HAN'),
 ('Magdebourg',11.63,52.13,'CDR*','PRU'),('Halle',11.97,51.48,'CDR*','PRU'),('Wittenberg',12.65,51.87,'CDR_SAX','PRU'),('Mersebourg',11.99,51.36,'CDR_SAX','PRU'),('Naumbourg',11.81,51.15,'CDR_SAX','PRU'),
 ('Torgau',13.0,51.56,'CDR_SAX','PRU'),('Delitzsch',12.34,51.53,'CDR_SAX','PRU'),('Eisleben',11.55,51.53,'CDR_SAX','PRU'),('Leipzig',12.37,51.34,'CDR_SAX','SAX'),('Dresde',13.74,51.05,'CDR_SAX','SAX'),
 ('Bautzen',14.42,51.18,'CDR_SAX','SAX'),('Zittau',14.8,50.9,'CDR_SAX','SAX'),('Görlitz',14.98,51.155,'CDR_SAX','PRU'),('Lauban',15.29,51.12,'CDR_SAX','PRU'),('Bunzlau',15.57,51.26,'PRU','PRU'),('Hoyerswerda',14.25,51.44,'CDR_SAX','PRU'),('Cottbus',14.33,51.76,'CDR_SAX','PRU'),
 ('Luckau',13.72,51.85,'CDR_SAX','PRU'),('Jüterbog',13.08,51.99,'CDR_SAX','PRU'),('Belzig',12.59,52.14,'CDR_SAX','PRU'),('Luckenwalde',13.17,52.1,'PRU','PRU'),
 ('Berlin',13.4,52.52,'PRU','PRU'),('Potsdam',13.06,52.39,'PRU','PRU'),('Francfort-sur-l\'Oder',14.55,52.34,'PRU','PRU'),('Stettin',14.55,53.43,'PRU','PRU'),
 ('Stralsund',13.09,54.31,'SWE','PRU'),('Greifswald',13.38,54.09,'SWE','PRU'),('Anklam',13.69,53.84,'PRU','PRU'),('Demmin',13.043,53.905,'PRU','PRU'),('Altentreptow',13.25,53.69,'PRU','PRU'),
 ('Schwerin',11.41,53.63,'CDR*','GER'),('Rostock',12.1,54.09,'CDR*','GER'),('Neubrandenbourg',13.26,53.56,'CDR*','GER'),('Kiel',10.13,54.32,'DNK','DEN'),('Flensbourg',9.43,54.78,'DNK','DEN'),
 ('Ratzebourg',10.76,53.7,'EMP','DEN'),('Copenhague',12.57,55.68,'DNK','DEN'),('Christiania',10.75,59.91,'DNK','SWN'),('Stockholm',18.07,59.33,'SWE','SWN'),('Helsinki',24.94,60.17,'RUS','RUS'),
 ('Königsberg',20.51,54.71,'PRU','PRU'),('Memel',21.13,55.71,'PRU','PRU'),('Tilsit',21.87,55.08,'PRU','PRU'),('Tauragė',22.29,55.25,'RUS','RUS'),('Palanga',21.07,55.92,'RUS','RUS'),
 ('Dantzig',18.65,54.35,'DAN','PRU'),('Elbing',19.4,54.16,'PRU','PRU'),('Graudenz',18.75,53.48,'PRU','PRU'),('Marienwerder',18.93,53.73,'PRU','PRU'),('Świecie',18.447,53.409,'PRU','PRU'),('Chełmno',18.425,53.349,'VAR','PRU'),
 ('Thorn',18.6,53.01,'VAR','PRU'),('Culm',18.42,53.35,'VAR','PRU'),('Bromberg',18.0,53.12,'VAR','PRU'),('Inowrocław',18.26,52.8,'VAR','PRU'),('Posen',16.93,52.41,'VAR','PRU'),
 ('Gniezno',17.6,52.54,'VAR','PRU'),('Leszno',16.57,51.84,'VAR','PRU'),('Ostrów',17.81,51.65,'VAR','PRU'),('Kalisz',18.09,51.76,'VAR','POL'),('Konin',18.25,52.22,'VAR','POL'),
 ('Słupca',17.87,52.29,'VAR','POL'),('Włocławek',19.07,52.65,'VAR','POL'),('Rypin',19.41,53.07,'VAR','POL'),('Brodnica',19.4,53.26,'VAR','PRU'),('Płock',19.7,52.55,'VAR','POL'),
 ('Varsovie',21.01,52.23,'VAR','POL'),('Łódź',19.46,51.76,'VAR','POL'),('Wieluń',18.57,51.22,'VAR','POL'),('Częstochowa',19.12,50.81,'VAR','POL'),('Sosnowiec',19.13,50.29,'VAR','POL'),
 ('Katowice',19.02,50.26,'PRU','PRU'),('Lubliniec',18.68,50.67,'PRU','PRU'),('Gliwice',18.67,50.29,'PRU','PRU'),('Pszczyna',18.95,49.98,'PRU','PRU'),('Opole',17.93,50.67,'PRU','PRU'),('Breslau',17.04,51.11,'PRU','PRU'),
 ('Cracovie',19.94,50.06,'VAR','KRA'),('Chrzanów',19.4,50.14,'VAR','KRA'),('Jaworzno',19.27,50.2,'VAR','KRA'),('Oświęcim',19.22,50.035,'AUT','AUT'),('Miechów',20.01,50.36,'VAR','POL'),
 ('Tarnów',20.99,50.01,'AUT','AUT'),('Rzeszów',22.0,50.04,'AUT','AUT'),('Przemyśl',22.77,49.78,'AUT','AUT'),('Lemberg',24.03,49.84,'AUT','AUT'),('Tarnopol',25.6,49.55,'RUS','AUT'),
 ('Zamość',23.25,50.72,'VAR','POL'),('Lublin',22.57,51.25,'VAR','POL'),('Kielce',20.63,50.87,'VAR','POL'),('Radom',21.15,51.4,'VAR','POL'),('Sandomierz',21.74,50.69,'VAR','POL'),
 ('Białystok',23.16,53.13,'RUS','RUS'),('Łomża',22.07,53.18,'VAR','POL'),('Suwałki',22.93,54.1,'VAR','POL'),('Augustów',22.98,53.84,'VAR','POL'),('Marijampolė',23.35,54.56,'VAR','POL'),
 ('Kaunas',23.93,54.9,'RUS','RUS'),('Vilnius',25.28,54.69,'RUS','RUS'),('Grodno',23.83,53.68,'RUS','RUS'),('Brest-Litovsk',23.69,52.1,'RUS','RUS'),('Minsk',27.56,53.9,'RUS','RUS'),
 ('Riga',24.1,56.95,'RUS','RUS'),('Kiev',30.52,50.45,'RUS','RUS'),('Czernowitz',25.94,48.29,'AUT','AUT'),('Khotyn',26.49,48.51,'RUS','RUS'),('Chișinău',28.86,47.01,'RUS','RUS'),
 ('Iași',27.59,47.16,'OTT','OTT'),('Bucarest',26.1,44.43,'OTT','OTT'),('Cluj',23.6,46.77,'AUT','AUT'),('Timișoara',21.23,45.75,'AUT','AUT'),('Belgrade',20.47,44.8,'OTT','OTT'),
 ('Zemun',20.41,44.845,'AUT','AUT'),('Novi Sad',19.84,45.25,'AUT','AUT'),('Sarajevo',18.41,43.86,'OTT','OTT'),('Zagreb',15.98,45.81,'AUT','AUT'),('Karlovac',15.55,45.49,'EMP','AUT'),
 ('Petrinja',16.28,45.44,'EMP','AUT'),('Fiume',14.44,45.33,'EMP','AUT'),('Split',16.44,43.51,'EMP','AUT'),('Raguse',18.09,42.65,'EMP','AUT'),('Kotor',18.68,42.47,'EMP','AUT'),
 ('Cetinje',18.92,42.39,'OTT','OTT'),('Trieste',13.77,45.65,'EMP','AUT'),('Laibach',14.51,46.05,'EMP','AUT'),('Maribor',15.65,46.55,'AUT','AUT'),('Villach',13.85,46.61,'EMP','AUT'),
 ('Klagenfurt',14.31,46.62,'AUT','AUT'),('Graz',15.44,47.07,'AUT','AUT'),('Vienne',16.37,48.21,'AUT','AUT'),('Linz',14.29,48.31,'AUT','AUT'),('Braunau',13.03,48.26,'CDR_BAV','AUT'),
 ('Ried',13.49,48.21,'CDR_BAV','AUT'),('Salzbourg',13.04,47.8,'CDR_BAV','AUT'),('Innsbruck',11.4,47.26,'CDR_BAV','AUT'),('Bregenz',9.75,47.5,'CDR_BAV','AUT'),
 ('Bolzano',11.35,46.5,'ITA','AUT'),('Trente',11.12,46.07,'ITA','AUT'),('Prague',14.42,50.09,'AUT','AUT'),('Brünn',16.61,49.2,'AUT','AUT'),('Troppau',17.9,49.94,'AUT','AUT'),
 ('Teschen',18.63,49.75,'AUT','AUT'),('Bielitz',19.04,49.82,'AUT','AUT'),('Presbourg',17.11,48.15,'AUT','AUT'),('Buda',19.04,47.5,'AUT','AUT'),
 ('Munich',11.58,48.14,'CDR_BAV','BAV'),('Nuremberg',11.08,49.45,'CDR_BAV','BAV'),('Bayreuth',11.58,49.95,'CDR_BAV','BAV'),('Bamberg',10.89,49.89,'CDR_BAV','BAV'),
 ('Wurtzbourg',9.93,49.79,'CDR*','BAV'),('Aschaffenbourg',9.15,49.97,'CDR*','BAV'),('Cobourg',10.97,50.26,'CDR*','GER'),('Spire',8.43,49.32,'EMP','BAV'),('Kaiserslautern',7.77,49.44,'EMP','BAV'),
 ('Deux-Ponts',7.36,49.25,'EMP','BAV'),('Landau',8.12,49.2,'EMP','BAV'),('Hombourg',7.33,49.32,'EMP','BAV'),('Saint-Ingbert',7.117,49.278,'EMP','BAV'),('Sarrebruck',6.99,49.23,'EMP','PRU'),
 ('Sarrelouis',6.75,49.31,'EMP','PRU'),('Neunkirchen',7.18,49.35,'EMP','PRU'),('Trèves',6.64,49.75,'EMP','PRU'),('Coblence',7.59,50.36,'EMP','PRU'),('Bonn',7.08,50.73,'EMP','PRU'),
 ('Kreuznach',7.867,49.845,'EMP','PRU'),('Mayence',8.271,49.993,'EMP','GER'),('Worms',8.36,49.63,'EMP','GER'),('Alzey',8.11,49.75,'EMP','GER'),('Bingen',7.91,49.96,'EMP','GER'),
 ('Wiesbaden',8.24,50.08,'CDR*','GER'),('Francfort',8.68,50.11,'CDR*','GER'),('Darmstadt',8.65,49.87,'CDR*','GER'),('Cassel',9.48,51.31,'CDR*','GER'),('Neuwied',7.46,50.43,'CDR*','PRU'),
 ('Altenkirchen',7.67,50.69,'CDR*','PRU'),('Siegen',8.02,50.87,'CDR*','PRU'),('Montabaur',7.83,50.44,'CDR*','GER'),('Hachenburg',7.82,50.66,'CDR*','GER'),
 ('Karlsruhe',8.4,49.01,'CDR_BAD','BAD'),('Mannheim',8.47,49.49,'CDR_BAD','BAD'),('Heidelberg',8.69,49.4,'CDR_BAD','BAD'),('Fribourg-en-Brisgau',7.85,47.99,'CDR_BAD','BAD'),
 ('Constance',9.17,47.675,'CDR_BAD','BAD'),('Pforzheim',8.7,48.89,'CDR_BAD','BAD'),('Villingen',8.46,48.06,'CDR_BAD','BAD'),('Donaueschingen',8.49,47.95,'CDR_BAD','BAD'),
 ('Mosbach',9.14,49.35,'CDR_BAD','BAD'),('Wertheim',9.52,49.76,'CDR_BAD','BAD'),('Stuttgart',9.18,48.78,'CDR_WUR','WUR'),('Ulm',9.99,48.4,'CDR_WUR','WUR'),('Tübingen',9.06,48.52,'CDR_WUR','WUR'),
 ('Heilbronn',9.22,49.14,'CDR_WUR','WUR'),('Friedrichshafen',9.48,47.65,'CDR_WUR','WUR'),('Freudenstadt',8.41,48.46,'CDR_WUR','WUR'),('Tuttlingen',8.82,47.98,'CDR_WUR','WUR'),
 ('Ravensburg',9.61,47.78,'CDR_WUR','WUR'),('Sigmaringen',9.22,48.09,'CDR*','GER'),('Hechingen',8.96,48.35,'CDR*','GER'),
 ('Erfurt',11.03,50.98,'CDR*','PRU'),('Heiligenstadt',10.14,51.38,'CDR*','PRU'),('Nordhausen',10.79,51.5,'CDR*','PRU'),('Mühlhausen',10.45,51.21,'CDR*','PRU'),
 ('Weimar',11.33,50.98,'CDR*','GER'),('Gotha',10.7,50.95,'CDR*','GER'),('Iéna',11.59,50.93,'CDR*','GER'),('Eisenach',10.32,50.97,'CDR*','GER'),
 ('Dessau',12.24,51.83,'CDR*','GER'),('Zerbst',12.08,51.97,'CDR*','GER'),('Bernburg',11.74,51.79,'CDR*','GER'),('Köthen',11.97,51.75,'CDR*','GER'),
 ('Quedlinbourg',11.15,51.79,'CDR*','PRU'),('Halberstadt',11.05,51.9,'CDR*','PRU'),('Stendal',11.86,52.6,'CDR*','PRU'),('Burg',11.85,52.27,'PRU','PRU'),('Genthin',12.16,52.41,'PRU','PRU'),
 ('Turin',7.69,45.07,'EMP','SAR'),('Coni',7.55,44.39,'EMP','SAR'),('Aoste',7.32,45.74,'EMP','SAR'),('Alexandrie',8.61,44.91,'EMP','SAR'),('Gênes',8.93,44.41,'EMP','SAR'),
 ('La Spezia',9.82,44.1,'EMP','SAR'),('Novare',8.62,45.45,'ITA','SAR'),('Vigevano',8.86,45.32,'ITA','SAR'),('Voghera',9.01,44.99,'EMP','SAR'),('Pavie',9.16,45.19,'ITA','AUT'),
 ('Milan',9.19,45.46,'ITA','AUT'),('Brescia',10.21,45.54,'ITA','AUT'),('Mantoue',10.79,45.16,'ITA','AUT'),('Sondrio',9.87,46.17,'ITA','AUT'),('Vérone',10.99,45.44,'ITA','AUT'),
 ('Venise',12.34,45.44,'ITA','AUT'),('Padoue',11.88,45.41,'ITA','AUT'),('Udine',13.23,46.06,'ITA','AUT'),('Gorizia',13.62,45.94,'EMP','AUT'),('Parme',10.33,44.8,'EMP','PAR'),
 ('Plaisance',9.69,45.05,'EMP','PAR'),('Modène',10.93,44.65,'ITA','MOD'),('Reggio',10.63,44.7,'ITA','MOD'),('Massa',10.14,44.03,'LUCP','MOD'),('Lucques',10.5,43.84,'LUCP','LUC'),
 ('Florence',11.25,43.77,'EMP','TOS'),('Livourne',10.31,43.55,'EMP','TOS'),('Sienne',11.33,43.32,'EMP','TOS'),('Bologne',11.34,44.49,'ITA','PAP'),('Ferrare',11.62,44.84,'ITA','PAP'),
 ('Ravenne',12.2,44.42,'ITA','PAP'),('Rimini',12.57,44.06,'ITA','PAP'),('Ancône',13.52,43.62,'ITA','PAP'),('Pérouse',12.39,43.11,'EMP','PAP'),('Rome',12.5,41.9,'EMP','PAP'),
 ('Viterbe',12.1,42.42,'EMP','PAP'),('Terracine',13.25,41.29,'EMP','PAP'),('Frosinone',13.35,41.64,'EMP','PAP'),('Rieti',12.86,42.4,'EMP','PAP'),('Fondi',13.43,41.36,'NAP','SIC'),
 ('Gaète',13.57,41.21,'NAP','SIC'),('Sora',13.61,41.72,'NAP','SIC'),('Cassino',13.83,41.49,'NAP','SIC'),('Naples',14.27,40.85,'NAP','SIC'),('Bari',16.87,41.12,'NAP','SIC'),
 ('L\'Aquila',13.4,42.35,'NAP','SIC'),('Palerme',13.36,38.12,'SICi','SIC'),('Cagliari',9.11,39.22,'SARi','SAR'),('Sassari',8.56,40.73,'SARi','SAR'),
 ('Madrid',-3.7,40.42,'ESPj','ESP'),('Barcelone',2.17,41.39,'EMP','ESP'),('Lérida',0.62,41.62,'EMP','ESP'),('Saragosse',-0.88,41.65,'ESPj','ESP'),('Cadix',-6.29,36.53,'ESPj','ESP'),
 ('Lisbonne',-9.14,38.72,'POR','POR'),('Londres',-0.13,51.51,'GBR','GBR'),('Dublin',-6.26,53.35,'GBR','GBR'),('La Valette',14.51,35.9,'GBR','GBR'),
 ('Athènes',23.73,37.98,'OTT','OTT'),('Corfou',19.92,39.62,'EMP','GBR'),('Zante',20.9,37.78,'GBR','GBR'),('Chios',26.13,38.37,'OTT','OTT'),('Navarin',21.7,36.91,'OTT','OTT'),
 ('Constantinople',28.98,41.01,'OTT','OTT'),('Sofia',23.32,42.7,'OTT','OTT'),('Saint-Pétersbourg',30.32,59.94,'RUS','RUS'),('Smolensk',32.05,54.78,'RUS','RUS'),
]
ok = ko = 0
for nom, lon, lat, a12, a15 in T:
    p = Point(lon, lat)
    idx = [i for i in arbre.query(p) if CELLS[i]['geom'].contains(p)]
    if not idx:
        # point en mer (côte simplifiée) : on prend la cellule la plus proche
        i = min(range(len(CELLS)), key=lambda k: CELLS[k]['geom'].distance(p))
        d = CELLS[i]['geom'].distance(p)
        if d > 0.08:
            print(f'  ?? {nom} hors terre (dist {d:.2f})'); continue
    else:
        i = idx[0]
    c = CELLS[i]
    r12 = c['o1812']; r15 = c['o1815']
    ok12 = (r12 == a12) or (a12 == 'CDR*' and r12.startswith('CDR'))
    ok15 = r15 == a15
    if ok12 and ok15:
        ok += 1
    else:
        ko += 1
        print(f'  ÉCART {nom:22s} cellule {c["id"]:18s} 1812 {r12:8s} (attendu {a12:8s}) 1815 {r15:5s} (attendu {a15})')
print('témoins justes :', ok, ' écarts :', ko)

