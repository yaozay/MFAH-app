-- MySQL dump 10.13  Distrib 8.0.43, for macos15.4 (arm64)
--
-- Host: mfah-db.ctyi4mie6bn0.us-east-2.rds.amazonaws.com    Database: mfah
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Artists`
--

DROP TABLE IF EXISTS `Artists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Artists` (
  `artist_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(80) NOT NULL,
  `birth_year` int DEFAULT NULL,
  `death_year` int DEFAULT NULL,
  `nationality` varchar(80) DEFAULT NULL,
  `bio` text,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`artist_id`),
  CONSTRAINT `chk_artist_years` CHECK (((`birth_year` is null) or (`death_year` is null) or (`birth_year` <= `death_year`)))
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Artists`
--

LOCK TABLES `Artists` WRITE;
/*!40000 ALTER TABLE `Artists` DISABLE KEYS */;
INSERT INTO `Artists` VALUES (1,'Claude Monet',1840,1926,'French','Founder of Impressionist painting',NULL),(3,'Pablo Picasso',1881,1973,'Spanish','Pablo Diego José Francisco de Paula Juan Nepomuceno María de los Remedios Cipriano de la Santísima Trinidad Ruiz y Picasso was a Spanish painter, sculptor, and printmaker who revolutionized 20th century art. ',NULL),(10,'Dorothea Prühl',1937,2025,'German','Internationally recognized for her bold, expressive forms crafted in wood and metal, Prühl (born 1937) trained in the traditions of the Bauhaus.',NULL),(11,'Leonardo Da Vinci',1452,1519,'Italian','Leonardo da Vinci was an Italian polymath and founding figure of the High Renaissance. ',NULL),(12,'Bobby',2000,2025,'American','',NULL),(13,'Vincent van Gogh',1853,1890,'Dutch','Post-Impressionist painter celebrated for expressive color and emotional honesty in works like “Starry Night.”',NULL),(14,'Pablo Picasso',1881,1973,'Spanish','Revolutionary artist who co-founded Cubism; known for “Guernica” and “Les Demoiselles d’Avignon.”',NULL),(15,'Frida Kahlo',1907,1954,'Mexican','Painter famous for symbolic self-portraits reflecting pain, identity, and Mexican culture.',NULL),(16,'Salvador Dalí',1904,1989,'Spanish','Surrealist painter best known for his dreamlike and bizarre imagery, such as in The Persistence of Memory.',NULL),(17,'Henri Matisse',1869,1954,'French','Modernist painter recognized for his use of bold colors and fluid lines, leading the Fauvism movement.',NULL),(18,'Edvard Munch',1863,1944,'Norwegian','Symbolist painter and printmaker whose most famous work, The Scream, expressed deep emotional themes.',NULL),(19,'Georgia O’Keeffe',1887,1986,'American','Modernist artist celebrated for her close-up paintings of flowers and desert landscapes.',NULL),(20,'Gustav Klimt',1862,1918,'Austrian','Symbolist painter known for his decorative, gold-leaf works like The Kiss.',NULL),(21,'Pierre-Auguste Renoir',1841,1919,'French','Impressionist painter famous for his vibrant light and scenes of social leisure.',NULL),(22,'Joan Miró',1893,1983,'Spanish','Surrealist painter who used abstract, playful forms inspired by Catalan culture.',NULL),(23,'Rembrandt van Rijn',1606,1669,'Dutch','Baroque painter and printmaker celebrated for his masterful use of light and shadow.',NULL),(24,'Diego Velázquez',1599,1660,'Spanish','Court painter to King Philip IV, best known for the masterpiece Las Meninas.',NULL),(25,'Paul Cézanne',1839,1906,'French','Post-Impressionist whose structured brushwork influenced Cubism and modern art.',NULL),(26,'Caravaggio',1571,1610,'Italian','Baroque master of dramatic realism and chiaroscuro, influencing generations of artists.',NULL),(27,'Grant Wood',1891,1942,'American','Regionalist painter known for American Gothic and depictions of rural life.',NULL),(28,'Mary Cassatt',1844,1926,'American','Impressionist painter who portrayed intimate moments of women and children.',NULL),(29,'Jean-Michel Basquiat',1960,1988,'American','Neo-expressionist artist whose graffiti-inspired works explored identity and power.',NULL),(30,'Yayoi Kusama',1929,NULL,'Japanese','Avant-garde artist famous for her polka-dot patterns and immersive mirror installations.',NULL),(31,'Diego Rivera',1886,1957,'Mexican','Muralist who depicted social and political themes rooted in Mexican history and culture.',NULL),(32,'René Magritte',1898,1967,'Belgian','Surrealist painter exploring the mystery of reality through witty and thought-provoking images.',NULL),(33,'Edgar Degas',1834,1917,'French','Impressionist artist known for his paintings and sculptures of dancers and everyday scenes.',NULL),(34,'Artemisia Gentileschi',1593,1656,'Italian','Baroque painter recognized for her powerful depictions of women from myth and scripture.',NULL),(35,'Wassily Kandinsky',1866,1944,'Russian','Abstract art pioneer who believed color and form could express emotion like music.',NULL),(36,'Titian',1488,1576,'Italian','Renaissance master of Venetian painting, known for his rich color and dynamic compositions.',NULL),(37,'Raphael',1483,1520,'Italian','High Renaissance painter celebrated for his serene Madonnas and The School of Athens.',NULL),(38,'Michelangelo Buonarroti',1475,1564,'Italian','Renaissance sculptor, painter, and architect, famed for the Sistine Chapel ceiling and David.',NULL),(39,'Johannes Vermeer',1632,1675,'Dutch','Baroque painter admired for his use of light in domestic interior scenes like Girl with a Pearl Earring.',NULL),(40,'Francisco Goya',1746,1828,'Spanish','Romantic artist whose works range from royal portraits to haunting depictions of war.',NULL),(41,'Eugène Delacroix',1798,1863,'French','Romantic painter celebrated for his dramatic color and movement in works like Liberty Leading the People.',NULL),(42,'Édouard Manet',1832,1883,'French','Modernist who bridged Realism and Impressionism with works like Olympia and Luncheon on the Grass.',NULL),(43,'Paul Gauguin',1848,1903,'French','Post-Impressionist painter known for his bold colors and Tahitian-inspired art.',NULL),(44,'Camille Pissarro',1830,1903,'French','Impressionist and Neo-Impressionist known for his landscapes and urban scenes.',NULL),(45,'Henri Rousseau',1844,1910,'French','Self-taught painter famous for his imaginative jungle scenes and naive style.',NULL),(46,'Amedeo Modigliani',1884,1920,'Italian','Modernist known for elongated portraits and nudes.',NULL),(47,'Marc Chagall',1887,1985,'Belarusian-French','Painter and stained glass artist blending fantasy, religion, and folklore.',NULL),(48,'Egon Schiele',1890,1918,'Austrian','Expressionist painter noted for his raw, emotional figure drawings.',NULL),(49,'Kazimir Malevich',1879,1935,'Russian','Pioneer of abstract art and creator of Suprematism.',NULL),(50,'Paul Klee',1879,1940,'Swiss-German','Modernist whose colorful, whimsical art bridges abstraction and expressionism.',NULL),(51,'Piet Mondrian',1872,1944,'Dutch','Abstract pioneer known for geometric compositions and primary color palette.',NULL),(52,'Mark Rothko',1903,1970,'American','Abstract expressionist recognized for his luminous color field paintings.',NULL),(53,'Lucian Freud',1922,2011,'British','Figurative painter known for his psychologically intense portraits.',NULL),(54,'Francis Bacon',1909,1992,'British-Irish','Painter whose raw, emotional figures convey existential horror.',NULL),(55,'Roy Lichtenstein',1923,1997,'American','Pop artist famous for comic strip-inspired works and Benday dot technique.',NULL),(56,'Keith Haring',1958,1990,'American','Street artist whose bold lines and figures addressed social and political themes.',NULL),(57,'Banksy',1974,NULL,'British','Anonymous street artist known for politically charged graffiti and satire.',NULL),(58,'Anselm Kiefer',1945,NULL,'German','Postwar painter and sculptor exploring themes of history and memory.',NULL),(59,'Gerhard Richter',1932,NULL,'German','Contemporary artist known for both abstract and photorealistic works.',NULL),(60,'Jean Dubuffet',1901,1985,'French','Founder of Art Brut, celebrating raw, outsider creativity.',NULL),(61,'Edward Hopper',1882,1967,'American','Realist painter depicting isolation in modern urban life.',NULL),(62,'Norman Rockwell',1894,1978,'American','Illustrator capturing everyday American life with warmth and detail.',NULL),(63,'John Singer Sargent',1856,1925,'American','Portrait artist acclaimed for his elegant and expressive brushwork.',NULL),(64,'Winslow Homer',1836,1910,'American','Realist painter best known for marine subjects and depictions of American life.',NULL),(65,'Thomas Cole',1801,1848,'American','Founder of the Hudson River School, known for majestic landscapes.',NULL),(66,'Albrecht Dürer',1471,1528,'German','Renaissance painter and printmaker who revolutionized engraving and woodcut techniques.',NULL),(67,'Peter Paul Rubens',1577,1640,'Flemish','Baroque master known for dynamic compositions and lush color.',NULL),(68,'Jan van Eyck',1390,1441,'Flemish','Early Netherlandish painter, pioneer in oil painting technique.',NULL),(69,'Carlo Crivelli',1435,1495,'Italian','Renaissance painter known for his ornate altarpieces and use of perspective.',NULL),(70,'El Greco',1541,1614,'Greek-Spanish','Mannerist painter noted for elongated figures and spiritual intensity.',NULL),(71,'Arshile Gorky',1904,1948,'Armenian-American','Abstract expressionist whose work bridged surrealism and abstraction.',NULL),(72,'Clyfford Still',1904,1980,'American','Abstract expressionist known for monumental color field paintings.',NULL),(73,'Joan Mitchell',1925,1992,'American','Abstract expressionist whose vibrant brushwork expressed emotion through color.',NULL),(74,'Helen Frankenthaler',1928,2011,'American','Color field painter known for her stain technique on unprimed canvas.',NULL),(75,'Robert Rauschenberg',1925,2008,'American','Pop and Neo-Dada artist merging painting and sculpture into “Combines.”',NULL),(76,'Marcel Duchamp',1887,1968,'French','Dada artist who redefined art through conceptual works like Fountain.',NULL),(77,'Barbara Hepworth',1903,1975,'British','Modern sculptor known for abstract forms inspired by nature.',NULL),(78,'Constantin Brâncuși',1876,1957,'Romanian','Modernist sculptor whose simplified forms influenced 20th-century art.',NULL),(79,'Louise Bourgeois',1911,2010,'French-American','Sculptor exploring themes of memory, family, and the body.',NULL),(80,'Kara Walker',1969,NULL,'American','Contemporary artist exploring race, gender, and power through silhouettes.',NULL),(81,'Ai Weiwei',1957,NULL,'Chinese','Activist and artist using sculpture and installation to critique authority.',NULL),(82,'Takashi Murakami',1962,NULL,'Japanese','Contemporary artist blending traditional and pop culture in his Superflat style.',NULL),(83,'Damien Hirst',1965,NULL,'British','Contemporary artist known for provocative works about life and death.',NULL),(84,'Jeff Koons',1955,NULL,'American','Postmodern artist recognized for kitsch-inspired sculptures like Balloon Dog.',NULL),(85,'Tracey Emin',1963,NULL,'British','Contemporary artist exploring intimacy and vulnerability through installation and text.',NULL),(86,'Olafur Eliasson',1967,NULL,'Danish-Icelandic','Conceptual artist known for immersive installations using light and natural elements.',NULL),(87,'Zanele Muholi',1972,NULL,'South African','Visual activist and photographer documenting Black LGBTQ+ identity.',NULL),(88,'Cindy Sherman',1954,NULL,'American','Photographer and conceptual artist exploring identity and representation.',NULL);
/*!40000 ALTER TABLE `Artists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Artworks`
--

DROP TABLE IF EXISTS `Artworks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Artworks` (
  `artwork_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `artist_id` int DEFAULT NULL,
  `year_created` int DEFAULT NULL,
  `art_type` varchar(100) DEFAULT NULL,
  `acquisition_date` date DEFAULT NULL,
  `estimated_price` decimal(12,2) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`artwork_id`),
  UNIQUE KEY `unique_artwork_name` (`title`),
  KEY `artist_id` (`artist_id`),
  CONSTRAINT `Artworks_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `Artists` (`artist_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Artworks`
--

LOCK TABLES `Artworks` WRITE;
/*!40000 ALTER TABLE `Artworks` DISABLE KEYS */;
INSERT INTO `Artworks` VALUES (2,'Water Lilies',1,1916,'Oil on canvas','2023-01-01',15000000.00,'https://www.artic.edu/iiif/2/3c27b499-af56-f0d5-93b5-a7f2f1ad5813/full/1686,/0/default.jpg',NULL),(4,'The Old Guitarist',3,1904,'oil',NULL,10000.00,'https://upload.wikimedia.org/wikipedia/en/b/bc/Old_guitarist_chicago.jpg',NULL),(7,'Lady with an Ermine ',11,1489,'Oil','1992-06-27',10000000.00,'https://upload.wikimedia.org/wikipedia/commons/b/bf/Lady_with_an_Ermine_-_Leonardo_da_Vinci_%28adjusted_levels%29.jpg',NULL),(8,'Water Lilies in Bloom',1,1914,'Oil','2018-05-08',84000000.00,'https://upload.wikimedia.org/wikipedia/commons/2/2c/Claude_Monet_-_Nympheas_en_fleur.jpg',NULL),(14,'Flowers from Augustenberg',10,1989,'Wood',NULL,10000.00,'https://static.mfah.com/images/dorothea-pruhl-flowers-from-augustenberg-blumen-aus-augustenberg.8155675842918007577.jpg?width=996&height=1246&bgcolor=F5F5F5',NULL),(15,'Butterflies',10,2008,'Cherrywood',NULL,8000.00,'https://static.mfah.com/images/dorothea-pruhl-butterflies-schmetterlinge.15823894730296385122.jpg?width=948&height=1246&bgcolor=F5F5F5',NULL),(16,'Mona Lisa',11,1900,'Oil',NULL,9999999.99,'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/960px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',NULL),(17,'Example',1,NULL,NULL,NULL,NULL,NULL,'2025-11-11 01:03:05'),(20,'The Arnolfini Portrait',68,1434,'Oil',NULL,1000000.00,'https://smarthistory.org/wp-content/uploads/2025/02/1-Full-size-1160x1536.jpg',NULL),(21,'Fire',72,1957,'Oil',NULL,50000.00,'https://upload.wikimedia.org/wikipedia/en/f/f6/Still_1957_D1.jpg',NULL),(22,'Butterfly',30,2018,'Print',NULL,10000.00,'https://uploads6.wikiart.org/images/yayoi-kusama/butterfly-1988.jpg!Blog.jpg',NULL),(23,'Pumpkin',30,1990,'Print',NULL,10000.00,'https://uploads4.wikiart.org/images/yayoi-kusama/pumpkin-1990.jpg',NULL),(24,'Annunciation',69,1486,'Oil',NULL,1000000.00,'https://upload.wikimedia.org/wikipedia/commons/7/71/The_Annunciation%2C_with_Saint_Emidius_-_Carlo_Crivelli_-_National_Gallery.jpg',NULL),(25,'Girl with the Pearl Earring',39,1665,'oil',NULL,6000000.00,'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/960px-1665_Girl_with_a_Pearl_Earring.jpg',NULL),(26,'Snap the Whip',64,1872,'Oil',NULL,5000.00,'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Winslow_Homer_-_Snap_the_Whip_%28Butler_Institute_of_American_Art%29.jpg/1000px-Winslow_Homer_-_Snap_the_Whip_%28Butler_Institute_of_American_Art%29.jpg',NULL),(27,'The Ballet Class',33,1876,'Oil','2025-11-17',650000.00,'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Edgar_Degas_-_La_Classe_de_danse.jpg/500px-Edgar_Degas_-_La_Classe_de_danse.jpg',NULL),(28,'Head VI',40,1949,'Oil',NULL,40000.00,'https://upload.wikimedia.org/wikipedia/en/6/6f/Head_VI_%281949%29.JPG',NULL),(29,'Boulevard de Montmartre, Matinée de Printemps',44,1897,'Oil',NULL,43000.00,'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Camille_Pissarro_-_Boulevard_Montmartre%2C_Spring_-_Google_Art_Project.jpg/960px-Camille_Pissarro_-_Boulevard_Montmartre%2C_Spring_-_Google_Art_Project.jpg',NULL),(30,'Self-Portrait with Thorn Necklace and Hummingbird ',15,1940,'Oil',NULL,30000.00,'https://upload.wikimedia.org/wikipedia/en/1/1e/Frida_Kahlo_%28self_portrait%29.jpg',NULL),(31,'American Gothic',27,1930,'Oil','2025-11-08',52000.00,'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/960px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg',NULL),(32,'Flower Myth',50,1918,'Watercolor',NULL,6700.00,'https://upload.wikimedia.org/wikipedia/commons/c/c5/Paul_Klee_Flower_Myth_1918.jpg',NULL),(33,'Dots Obsession',30,2000,'oil',NULL,9999.99,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ3Lqz1FmhuKAajHuZlTInoTPCV-riHQlLA8E0QDKW3H8zvTnbhubCJfFGwCYSWft0vN3eSG63hcoSFg_7fCTeT_jJ9foQ2YV4WiwTNyY&s=10','2025-11-23 18:46:41'),(34,'My Bed',85,1998,'Photograph','2025-11-01',20000.00,'https://upload.wikimedia.org/wikipedia/en/9/9d/Emin-My-Bed.jpg',NULL),(35,'Las Meninas',24,1656,'Oil','2025-06-24',1000000.00,'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg/960px-Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg',NULL),(36,'The Oxbow',65,1836,'oil','2025-02-27',10000.00,'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Cole_Thomas_The_Oxbow_%28The_Connecticut_River_near_Northampton_1836%29.jpg/960px-Cole_Thomas_The_Oxbow_%28The_Connecticut_River_near_Northampton_1836%29.jpg',NULL),(37,'Cosmos Ball',82,2000,'modeled plastic','2025-05-05',10000.00,'https://upload.wikimedia.org/wikipedia/en/0/0b/%27Cosmos_Ball%27_by_Takashi_Murakami%2C_molded_plastic%2C_2000.jpg',NULL),(38,'Flower Ball',82,1994,'Sculpture','2025-11-08',10000.00,'https://samblog.seattleartmuseum.org/wp-content/uploads/Nikon-D850_Seattle-Asian-Art-Museum_reopening-promo_20191202-160-1200x800.jpg',NULL),(39,'Flowers',82,2002,'Sculpture','2025-08-15',100000.00,'https://uploads8.wikiart.org/images/takashi-murakami/flowers-2002.jpg',NULL),(40,'Tan Tan Bo',82,2003,'Sculpture','2025-02-12',5000.00,'https://d7hftxdivxxvm.cloudfront.net/?height=524&quality=50&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FV-TGgq9rIvsX_eS6gOzAEA%2Fnormalized.jpg&width=800',NULL);
/*!40000 ALTER TABLE `Artworks` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`appuser`@`%`*/ /*!50003 TRIGGER `prevent_duplicate_artwork_title` BEFORE INSERT ON `Artworks` FOR EACH ROW BEGIN
  IF EXISTS (
    SELECT 1 FROM Artworks
    WHERE artist_id = NEW.artist_id
      AND title = NEW.title
  ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Duplicate artwork title for the same artist is not allowed.';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Collection_Artworks`
--

DROP TABLE IF EXISTS `Collection_Artworks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Collection_Artworks` (
  `collection_id` int NOT NULL,
  `artwork_id` int NOT NULL,
  PRIMARY KEY (`collection_id`,`artwork_id`),
  UNIQUE KEY `unique_artwork` (`artwork_id`),
  CONSTRAINT `Collection_Artworks_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `Collections` (`collection_id`) ON DELETE CASCADE,
  CONSTRAINT `Collection_Artworks_ibfk_2` FOREIGN KEY (`artwork_id`) REFERENCES `Artworks` (`artwork_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Collection_Artworks`
--

LOCK TABLES `Collection_Artworks` WRITE;
/*!40000 ALTER TABLE `Collection_Artworks` DISABLE KEYS */;
INSERT INTO `Collection_Artworks` VALUES (1,2),(1,4),(1,7),(1,8),(4,14),(4,15),(1,16),(1,20),(2,21),(4,22),(4,23),(1,24),(1,25),(2,26),(1,27),(1,28),(1,29),(2,30),(2,31),(2,32),(3,33),(3,34),(1,35),(1,36),(4,37),(4,38),(4,39),(4,40);
/*!40000 ALTER TABLE `Collection_Artworks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Collections`
--

DROP TABLE IF EXISTS `Collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Collections` (
  `collection_id` int NOT NULL AUTO_INCREMENT,
  `collection_name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`collection_id`),
  UNIQUE KEY `collection_name` (`collection_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Collections`
--

LOCK TABLES `Collections` WRITE;
/*!40000 ALTER TABLE `Collections` DISABLE KEYS */;
INSERT INTO `Collections` VALUES (1,'European Masterpieces','A curated selection of important European artworks from the Renaissance to the 19th century.'),(2,'Modern & Contemporary Art','Works created from the 20th century to present day, highlighting modern movements and contemporary artists.'),(3,'Photography & Digital Media','A collection featuring historical and contemporary photography, as well as digital and multimedia artworks.'),(4,'Sculpture & Decorative Arts','Three-dimensional artworks and crafted objects including bronzes, ceramics, and mixed-material sculptures.');
/*!40000 ALTER TABLE `Collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Departments`
--

DROP TABLE IF EXISTS `Departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Departments` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Departments`
--

LOCK TABLES `Departments` WRITE;
/*!40000 ALTER TABLE `Departments` DISABLE KEYS */;
INSERT INTO `Departments` VALUES (1,'Administration / IT','Admin Building'),(2,'Curatorial','Main Building'),(3,'Exhibitions & Events','Exhibitions Office'),(4,'Visitor Services / Ticketing','Lobbies & Admissions'),(5,'Retail / Museum Shop','Main Lobby Shop'),(6,'Development / Fundraising','Administration Offices');
/*!40000 ALTER TABLE `Departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Employees`
--

DROP TABLE IF EXISTS `Employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Employees` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `department_id` int DEFAULT NULL,
  `employee_role` enum('curator','manager','security','guide') DEFAULT NULL,
  `SSN` varchar(9) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `salary` decimal(12,2) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address` text,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `SSN` (`SSN`),
  KEY `department_id` (`department_id`),
  KEY `fk_employees_user` (`user_id`),
  CONSTRAINT `Employees_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `Departments` (`department_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_emp_dept` FOREIGN KEY (`department_id`) REFERENCES `Departments` (`department_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_emp_email_format` CHECK (((`email` is null) or regexp_like(`email`,_utf8mb4'^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'))),
  CONSTRAINT `chk_emp_phone_format` CHECK (((`phone` is null) or regexp_like(`phone`,_utf8mb4'^[0-9]{10}$'))),
  CONSTRAINT `chk_emp_salary_min` CHECK ((`salary` >= 10.00)),
  CONSTRAINT `chk_emp_ssn` CHECK (regexp_like(`SSN`,_utf8mb4'^[0-9]{9}$'))
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Employees`
--

LOCK TABLES `Employees` WRITE;
/*!40000 ALTER TABLE `Employees` DISABLE KEYS */;
INSERT INTO `Employees` VALUES (3,'Daniel','Nguyen',3,'security','456789123','2019-03-22','dnguyen@mfah.org','3465558899',54000.00,'1985-09-30','501 McKinney St, Houston, TX 77002',41),(4,'Emily','Johnson',5,'guide','789123456','2022-05-01','ejohnson@mfah.org','7134447766',48000.00,'1995-02-08','5501 Main St, Houston, TX 77004',42),(5,'Olivia','Perez',2,'curator','112233445','2022-06-10','operez@mfah.org','7138824433',68000.00,'1992-03-18','1405 Main St, Houston, TX',43),(6,'Noah','Robinson',1,'manager','223344556','2018-02-05','nrobinson@mfah.org','8329001122',91000.00,'1984-07-09','1208 Fannin St, Houston, TX',44),(7,'Ava','Kim',3,'security','334455667','2020-08-12','akim@mfah.org','3468029988',52000.00,'1991-05-22','505 Texas Ave, Houston, TX',45),(8,'Ethan','Garcia',5,'guide','445566778','2021-04-19','egarcia@mfah.org','7137005566',47000.00,'1996-01-13','2307 Caroline St, Houston, TX',46),(9,'Isabella','Davis',6,'curator','556677889','2019-11-07','idavis@mfah.org','8329013377',70500.00,'1989-08-15','2401 Milam St, Houston, TX',47),(10,'Liam','Ramirez',4,'security','667788990','2023-03-10','lramirez@mfah.org','8327654400',56000.00,'1993-02-24','6001 Almeda Rd, Houston, TX',48),(11,'Mia','Lopez',2,'guide','778899001','2020-10-28','mlopez@mfah.org','7134412299',49500.00,'1997-06-09','4209 Main St, Houston, TX',49),(12,'Jacob','Nguyen',1,'manager','889900112','2017-12-12','jnguyen@mfah.org','7132234455',98000.00,'1982-10-01','1701 Hermann Dr, Houston, TX',50),(13,'Sophia','Clark',5,'guide','990011223','2021-09-21','sclark@mfah.org','8326547788',49000.00,'1995-03-05','2002 Montrose Blvd, Houston, TX',51),(14,'Benjamin','Wright',3,'security','101112131','2019-01-17','bwright@mfah.org','7139026600',55000.00,'1988-11-19','1610 Travis St, Houston, TX',52),(15,'Amelia','Hill',4,'curator','121314151','2020-05-03','ahill@mfah.org','8324459933',73000.00,'1990-07-11','8100 Greenbriar Dr, Houston, TX',53),(16,'Elijah','Adams',6,'manager','131415161','2016-08-22','eadams@mfah.org','7136077722',96000.00,'1983-01-23','4019 Fannin St, Houston, TX',54),(17,'Charlotte','Gonzalez',2,'guide','141516171','2023-01-15','cgonzalez@mfah.org','7139913456',50000.00,'1998-09-14','1202 Museum Park Blvd, Houston, TX',55),(18,'Henry','Flores',3,'security','151617181','2019-03-26','hflores@mfah.org','8329932233',57000.00,'1992-12-29','6021 Kirby Dr, Houston, TX',56),(19,'Avery','Patel',1,'curator','161718191','2022-07-05','apatel@mfah.org','7138007788',71000.00,'1991-04-02','2309 Caroline St, Houston, TX',57),(43,'admin32','admin23',1,'manager','123456789','2025-11-12','admin3@mfah.com','1234567890',12345678.00,'2025-11-12','818 Beanin river bend, Houston, Tx, 3',39),(54,'b','b',1,'manager','111222333','2025-11-13','b@gmail.com','1234567890',1234561.97,'2002-02-13','1231 googoo street, houston, tx, 77400',83);
/*!40000 ALTER TABLE `Employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `event_date` date NOT NULL,
  `event_time` time DEFAULT NULL,
  `venue_id` int DEFAULT NULL,
  `description` text,
  `approved` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `venue_id` (`venue_id`),
  CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`venue_id`) REFERENCES `Venues` (`venue_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES (1,'Modern Sculpture Exhibit','2025-11-16','14:00:00',4,'A showcase of modern sculptures exploring form and abstraction.',1,NULL),(3,'Halloween','2025-10-31','09:00:00',3,'Halloween',0,'2025-11-10 03:56:10'),(11,'Divine Egypt','2025-11-13','09:00:00',4,'',-1,NULL),(12,'Fun Day','2025-11-12','10:00:00',3,'Fun',1,NULL),(13,'Painting Class','2025-11-11','13:00:00',6,'Come paint with us. Open to all levels.',1,NULL),(14,'Example','2025-11-13','14:00:00',3,'example',1,'2025-11-13 05:53:02'),(15,'Test','2025-11-17','12:00:00',3,NULL,1,'2025-11-13 06:28:58'),(16,'Art','2025-11-17','12:00:00',3,'',1,NULL),(17,'Event','2025-11-26','11:12:00',1,NULL,1,'2025-11-13 14:30:14'),(18,'New Event','2025-11-21',NULL,5,NULL,1,'2025-11-13 14:30:11'),(20,'Light Show','2025-11-26','14:00:00',2,'Come join us.',1,NULL),(21,'events test','2025-11-19','15:02:00',3,'',1,NULL),(22,'test event 2','2025-11-20','13:01:00',3,'test desc',0,NULL),(23,'Database presentation','2025-11-29','13:01:00',3,'descroption',1,NULL),(24,'Placeholder','2025-11-20','02:53:00',2,NULL,1,NULL);
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`appuser`@`%`*/ /*!50003 TRIGGER `event_require_approval` AFTER INSERT ON `Events` FOR EACH ROW BEGIN
  IF NEW.approved = 0 THEN
    INSERT INTO Notifications (type, title, body, status)
    VALUES (
      'event',
      'Event approval needed',
      CONCAT('New event "', NEW.title, '" requires admin approval.'),
      'pending'
    );
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`appuser`@`%`*/ /*!50003 TRIGGER `reset_event_approval_on_update` BEFORE UPDATE ON `Events` FOR EACH ROW BEGIN
  IF OLD.approved = 1 THEN
    SET NEW.approved = 0;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Exhibition_Artworks`
--

DROP TABLE IF EXISTS `Exhibition_Artworks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Exhibition_Artworks` (
  `exhibition_id` int NOT NULL,
  `artwork_id` int NOT NULL,
  PRIMARY KEY (`exhibition_id`,`artwork_id`),
  KEY `artwork_id` (`artwork_id`),
  CONSTRAINT `Exhibition_Artworks_ibfk_1` FOREIGN KEY (`exhibition_id`) REFERENCES `Exhibitions` (`exhibition_id`) ON DELETE CASCADE,
  CONSTRAINT `Exhibition_Artworks_ibfk_2` FOREIGN KEY (`artwork_id`) REFERENCES `Artworks` (`artwork_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Exhibition_Artworks`
--

LOCK TABLES `Exhibition_Artworks` WRITE;
/*!40000 ALTER TABLE `Exhibition_Artworks` DISABLE KEYS */;
/*!40000 ALTER TABLE `Exhibition_Artworks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Exhibitions`
--

DROP TABLE IF EXISTS `Exhibitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Exhibitions` (
  `exhibition_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(30) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `venue_id` int DEFAULT NULL,
  `organizer` varchar(30) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  PRIMARY KEY (`exhibition_id`),
  KEY `venue_id` (`venue_id`),
  CONSTRAINT `Exhibitions_ibfk_1` FOREIGN KEY (`venue_id`) REFERENCES `Venues` (`venue_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_exh_venue` FOREIGN KEY (`venue_id`) REFERENCES `Venues` (`venue_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_exh_dates` CHECK ((`start_date` <= `end_date`))
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Exhibitions`
--

LOCK TABLES `Exhibitions` WRITE;
/*!40000 ALTER TABLE `Exhibitions` DISABLE KEYS */;
INSERT INTO `Exhibitions` VALUES (1,'Foundations of Art','2024-03-01','2024-11-15',3,'Curatorial','An early 20th-century art exhibition exploring the origins of modernism, featuring works by Picasso, Kandinsky, and Matisse.','https://static.mfah.com/images/gyula-kosice-viviendas-hidroespaciales-en-la-constelacion-de-yael.12844124525445776147.jpg?width=520&height=390&bgcolor=F5F5F5',NULL,'approved'),(3,'Impressionist Masters','2025-04-01','2025-05-31',4,'Exhibitions & Events','Monet, Renoir, Degas—light, color, and the modern gaze.','https://static.mfah.com/images/magnolias-on-gold-velvet-cloth.3453916822748958743.jpg?width=520&height=390&bgcolor=F5F5F5',NULL,'approved'),(4,'Texas Modernists','2025-06-01','2025-07-31',3,'Curatorial','Mid-century artists who shaped Texas modern art.','https://mfashop.mfah.org/cdn/shop/files/TheBlanketSignal-6599-NF-SM_900x.jpg?v=1706744961',NULL,'approved'),(5,'Sculpture in Motion','2025-08-01','2025-09-30',4,'Exhibitions & Events','Kinetic works exploring balance, gravity, and movement.','https://static.mfah.com/images/art-of-imperial-rome-statue-of-trajan.16737674745552259099.jpg?width=462&height=346&bgcolor=F5F5F5',NULL,'approved'),(6,'Renaissance Revival','2025-10-01','2025-11-30',3,'Curatorial','Italian Renaissance masterworks from Botticelli to Michelangelo.','https://mfashop.mfah.org/cdn/shop/files/48864-NF-XL_900x.jpg?v=1697052095',NULL,'approved'),(7,'Voices of the Americas','2025-12-01','2026-01-31',4,'Curatorial','Art across the Americas reflecting diverse traditions.','https://mfashop.mfah.org/cdn/shop/files/AidingaComrade-6539-NF-SM_900x.jpg?v=1706743759',NULL,'approved'),(8,'Light & Space Install','2026-02-01','2026-03-31',3,'Exhibitions & Events','Immersive installation on perception, light, and form.','https://static.mfah.com/images/gyula-kosice-la-ciudad-hidroespacial-the-hydrospatial-city.12968119330242025515.jpg?width=468&height=351&bgcolor=F5F5F5',NULL,'approved'),(9,'Contemporary Houston','2026-04-01','2026-05-31',4,'Curatorial','Juried showcase of Houston-based contemporary artists.','https://mfashop.mfah.org/cdn/shop/products/Matisse_Purple_Coat_45880_unframed_900x.jpg?v=1602089694',NULL,'approved'),(10,'Japanese Woodblock Prints','2026-06-01','2026-07-31',3,'Curatorial','Ukiyo-e traditions and their influence on Western art.','https://static.mfah.com/images/mfah-permanent-collection.16790392194612239719.jpg?width=440&height=440&bgcolor=F5F5F5',NULL,'approved'),(13,'Cat Exhibition','2025-11-07','2025-11-10',3,'Cat','Cat','https://www.bing.com/th/id/OIP.55juLL3t4D4_kTLSpLYuSAHaLH?w=160&h=211&c=8&rs=1&qlt=90&o=6&cb=ucfimg1&pid=3.1&rm=2&ucfimg=1',NULL,'pending'),(15,'Foundations of Art','2025-11-04','2025-11-19',4,'Curatorial','An early 20th-century art exhibition exploring the origins of modernism, featuring works by Picasso, Kandinsky, and Matisse.','https://static.mfah.com/images/gyula-kosice-viviendas-hidroespaciales-en-la-constelacion-de-yael.12844124525445776147.jpg?width=520&height=390&bgcolor=F5F5F5',NULL,'pending'),(16,'Impressionist Masters','2025-11-20','2025-11-21',4,'Exhibitions & Events','Monet, Renoir, Degas—light, color, and the modern gaze.','https://static.mfah.com/images/magnolias-on-gold-velvet-cloth.3453916822748958743.jpg?width=520&height=390&bgcolor=F5F5F5',NULL,'approved'),(20,'Approval Test','2026-01-01','2027-01-01',1,'emp1','desc','url',NULL,'rejected'),(21,'asd','2026-01-25','2027-05-05',3,'asd','asdas','asd',NULL,'rejected'),(22,'Test','2025-11-13','2025-11-14',3,NULL,NULL,NULL,NULL,'pending'),(23,'test','2020-01-01','2030-01-01',1,'test',NULL,NULL,'2025-11-14 00:26:59','pending'),(24,'Test','2025-11-14','2025-11-15',1,NULL,NULL,NULL,NULL,'approved'),(25,'test exhibition class','2024-01-01','2026-02-02',3,'test',NULL,NULL,NULL,'rejected');
/*!40000 ALTER TABLE `Exhibitions` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`appuser`@`%`*/ /*!50003 TRIGGER `tg_exhibition_pending` BEFORE INSERT ON `Exhibitions` FOR EACH ROW BEGIN
  SET NEW.status = 'pending';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`appuser`@`%`*/ /*!50003 TRIGGER `tg_exhibitions_ai_notify_admins` AFTER INSERT ON `Exhibitions` FOR EACH ROW BEGIN
  INSERT INTO Notifications (product_id, title, body, notify_at, created_at, status, type)
  VALUES (
    NULL,
    'Exhibition approval needed',
    CONCAT('Review: "', NEW.title, '" (ID ', NEW.exhibition_id, ').'),
    NOW(),
    NOW(),
    'pending',
    'exhibition_request'
  );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`appuser`@`%`*/ /*!50003 TRIGGER `reset_exhibition_approval_on_update` BEFORE UPDATE ON `Exhibitions` FOR EACH ROW BEGIN
  IF OLD.status = 'approved'  or OLD. STATUS = 'rejected' THEN
    SET NEW.status = 'pending';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Gift_Shop_Transactions`
--

DROP TABLE IF EXISTS `Gift_Shop_Transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Gift_Shop_Transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int DEFAULT NULL,
  `visitor_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `sale_date` date DEFAULT NULL,
  `total_price` decimal(12,2) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `department_id` (`department_id`),
  KEY `visitor_id` (`visitor_id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_gift_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Gift_Shop_Transactions_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `Departments` (`department_id`) ON DELETE SET NULL,
  CONSTRAINT `Gift_Shop_Transactions_ibfk_2` FOREIGN KEY (`visitor_id`) REFERENCES `Visitors` (`visitor_id`) ON DELETE SET NULL,
  CONSTRAINT `Gift_Shop_Transactions_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `Shop_Products` (`product_id`) ON DELETE SET NULL,
  CONSTRAINT `chk_gs_qty` CHECK ((`quantity` between 1 and 100)),
  CONSTRAINT `chk_gs_total` CHECK (((`total_price` > 0) and (`total_price` <= 20000.00)))
) ENGINE=InnoDB AUTO_INCREMENT=1056 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Gift_Shop_Transactions`
--

LOCK TABLES `Gift_Shop_Transactions` WRITE;
/*!40000 ALTER TABLE `Gift_Shop_Transactions` DISABLE KEYS */;
INSERT INTO `Gift_Shop_Transactions` VALUES (1,2,8,1,15,'2025-11-11',50.00,NULL),(1007,2,3,18,2,'2025-11-02',39.98,NULL),(1008,3,7,19,1,'2025-11-03',24.99,NULL),(1009,1,5,2,3,'2025-11-05',59.97,NULL),(1010,4,10,24,1,'2025-11-06',14.99,NULL),(1011,2,8,32,2,'2025-11-08',29.98,NULL),(1012,5,1,3,2,'2025-11-12',21.98,NULL),(1013,5,11,24,1,'2025-11-12',42.00,NULL),(1014,5,11,24,1,'2025-11-12',42.00,NULL),(1015,5,11,1,1,'2025-11-12',9.99,NULL),(1016,5,11,1,9,'2025-11-12',89.91,NULL),(1017,5,11,18,4,'2025-11-12',83.96,NULL),(1018,5,11,3,3,'2025-11-12',32.97,NULL),(1019,5,11,18,2,'2025-11-12',41.98,NULL),(1020,5,12,1,10,'2025-11-12',99.90,NULL),(1021,5,12,3,1,'2025-11-12',10.99,NULL),(1024,5,12,3,5,'2025-11-12',54.95,NULL),(1031,5,12,3,5,'2025-11-12',54.95,NULL),(1033,5,12,3,5,'2025-11-12',54.95,NULL),(1034,5,12,3,6,'2025-11-12',65.94,NULL),(1035,5,12,3,7,'2025-11-12',76.93,NULL),(1036,5,12,24,8,'2025-11-12',336.00,NULL),(1037,5,13,1,4,'2025-11-12',39.96,NULL),(1038,5,14,24,1,'2025-11-13',42.00,NULL),(1039,5,14,24,3,'2025-11-13',126.00,NULL),(1040,5,14,1,2,'2025-11-13',19.98,NULL),(1041,5,11,19,6,'2025-11-13',101.94,NULL),(1042,5,15,1,8,'2025-11-13',79.92,NULL),(1043,5,16,23,2,'2025-11-13',84.00,NULL),(1044,5,14,34,1,'2025-11-13',33.50,NULL),(1045,5,11,1,1,'2025-11-13',9.99,NULL),(1046,5,68,34,25,'2025-11-13',837.50,NULL),(1047,5,69,18,6,'2025-11-14',125.94,NULL),(1048,5,11,33,1,'2025-11-19',54.00,NULL),(1049,5,11,33,1,'2025-11-19',54.00,11),(1050,5,70,24,1,'2025-11-19',42.00,140),(1051,NULL,NULL,30,1,'2025-11-23',67.00,NULL),(1052,5,11,31,1,'2025-11-23',69.00,11),(1053,5,11,30,1,'2025-11-23',67.00,11),(1054,5,70,30,1,'2025-11-23',67.00,140),(1055,5,71,21,1,'2025-11-24',50.00,141);
/*!40000 ALTER TABLE `Gift_Shop_Transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Membership_Types`
--

DROP TABLE IF EXISTS `Membership_Types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Membership_Types` (
  `plan_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amt` decimal(10,2) NOT NULL DEFAULT '0.00',
  `duration_months` tinyint unsigned NOT NULL DEFAULT '12',
  `people_included` tinyint unsigned NOT NULL DEFAULT '1',
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` date DEFAULT NULL,
  `updated_at` date DEFAULT NULL,
  PRIMARY KEY (`plan_id`),
  UNIQUE KEY `uq_Membership_Types_name` (`name`),
  KEY `ix_Membership_Types_flags` (`is_active`,`is_featured`,`display_order`),
  CONSTRAINT `chk_discount_nonneg` CHECK ((`discount_amt` >= 0)),
  CONSTRAINT `chk_duration_range` CHECK ((`duration_months` between 1 and 60)),
  CONSTRAINT `chk_people_range` CHECK ((`people_included` between 1 and 10)),
  CONSTRAINT `chk_price_nonneg` CHECK ((`price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Membership_Types`
--

LOCK TABLES `Membership_Types` WRITE;
/*!40000 ALTER TABLE `Membership_Types` DISABLE KEYS */;
INSERT INTO `Membership_Types` VALUES (2,'Family',130.00,0.00,12,4,'All Standard benefits, plus:\nAdmission benefits extended to all children 18 and under in the same household\nDiscounts on children’s art classes at the Glassell School of Art\nInvitations to exclusive family art-making activities',1,1,3,'2025-11-08','2025-11-13'),(3,'Starter',70.00,0.00,12,1,'Discounted garage parking on future visits\n10% discount at the MFAH shop and on Tickets',1,1,1,'2025-11-09','2025-11-13'),(5,'Standard',95.00,0.00,12,1,'All Starter benefits, plus:\nInvitation to the annual Members Holiday Event Party',1,1,2,'2025-11-09','2025-11-13'),(6,'Premium',200.00,0.00,12,1,'All Family benefits, plus:\nInvitations to Premium exhibition previews\nSubscription to MFAH Magazine, the Museum’s publication\nDiscount on Art Studio School enrollment\nReciprocal admission privileges at 70+ partnering U.S. museums',1,0,4,'2025-11-13','2025-11-13'),(7,'Advanced',350.00,0.00,12,1,'All Premium benefits, plus:\nTen complimentary All-Access guest passes\nInvitations to members-only programs\nReciprocal privileges at additional Texas art museums\nTwo complimentary single-use guest passes for members-only daytime previews',1,0,5,'2025-11-13','2025-11-13'),(8,'Pro',800.00,0.00,12,1,'All Advanced benefits, plus:\nComplimentary museum admission for up to four accompanying guests\nOne complimentary exhibition catalogue of your choice\nFour guest passes for daytime members-only previews\nTwo complimentary passes to MFAH Films',1,0,6,'2025-11-13','2025-11-13');
/*!40000 ALTER TABLE `Membership_Types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Membership_records`
--

DROP TABLE IF EXISTS `Membership_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Membership_records` (
  `records_id` int unsigned NOT NULL AUTO_INCREMENT,
  `visitor_id` int DEFAULT NULL,
  `plan_id` int unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','canceled','expired') NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` date DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`records_id`),
  UNIQUE KEY `uq_visitor_plan` (`visitor_id`,`plan_id`,`start_date`),
  KEY `ix_member_by_visitor` (`visitor_id`,`start_date`),
  KEY `ix_member_by_plan_status` (`plan_id`,`status`),
  KEY `ix_member_expirations` (`status`,`end_date`),
  KEY `fk_membership_user` (`user_id`),
  CONSTRAINT `fk_membership_plan` FOREIGN KEY (`plan_id`) REFERENCES `Membership_Types` (`plan_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_membership_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_membership_visitor` FOREIGN KEY (`visitor_id`) REFERENCES `Visitors` (`visitor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_date_order` CHECK ((`end_date` > `start_date`)),
  CONSTRAINT `chk_price_positive` CHECK ((`price_at_purchase` >= 0)),
  CONSTRAINT `chk_status_valid` CHECK ((`status` in (_utf8mb4'active',_utf8mb4'canceled',_utf8mb4'expired')))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Membership_records`
--

LOCK TABLES `Membership_records` WRITE;
/*!40000 ALTER TABLE `Membership_records` DISABLE KEYS */;
INSERT INTO `Membership_records` VALUES (2,5,2,'2025-02-15','2026-02-14','active',120.00,'2025-11-08',NULL),(4,8,3,'2025-04-10','2026-04-09','active',120.00,'2025-11-08',NULL),(6,11,2,'2025-11-13','2026-11-13','active',130.00,'2025-11-13',NULL),(7,12,5,'2025-11-13','2026-11-13','active',95.00,'2025-11-13',NULL),(11,NULL,5,'2025-11-19','2026-11-19','active',95.00,'2025-11-19',140),(12,NULL,3,'2025-11-24','2026-11-24','active',70.00,'2025-11-24',141);
/*!40000 ALTER TABLE `Membership_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `message` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  `title` varchar(255) DEFAULT NULL,
  `body` text,
  `notify_at` datetime DEFAULT NULL,
  `status` enum('pending','unread','read') DEFAULT 'pending',
  `type` enum('low_stock','exhibition_request') NOT NULL DEFAULT 'low_stock',
  PRIMARY KEY (`notification_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `Notifications_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `Shop_Products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notifications`
--

LOCK TABLES `Notifications` WRITE;
/*!40000 ALTER TABLE `Notifications` DISABLE KEYS */;
INSERT INTO `Notifications` VALUES (1,1,'Low stock alert: \"Art Postcard Set\" now has only 4 items left.','2025-11-12 14:40:56',1,NULL,NULL,NULL,'pending','low_stock'),(2,1,'Low stock alert: \"Art Postcard Set\" now has only 4 items left.','2025-11-12 14:43:48',1,NULL,NULL,NULL,'pending','low_stock'),(19,18,'Low stock alert: \"Art Puzzle - Starry Night\" now has only 0 items left.','2025-11-12 18:35:27',1,NULL,NULL,NULL,'pending','low_stock'),(21,18,'Low stock alert: \"Art Puzzle - Starry Night\" now has only 3 items left.','2025-11-12 21:02:52',1,NULL,NULL,NULL,'pending','low_stock'),(23,NULL,'','2025-11-12 22:19:33',0,'Exhibition approval needed','Review: \"Approval Test\" (ID 20).','2025-11-12 22:19:33','pending',''),(24,NULL,'','2025-11-12 22:29:05',0,'Exhibition approval needed','Review: \"asd\" (ID 21).','2025-11-12 22:29:05','pending',''),(25,18,'Low stock alert: \"Art Puzzle - Starry Night\" now has only 4 items left.','2025-11-13 04:41:07',1,NULL,NULL,NULL,'pending','low_stock'),(26,NULL,'','2025-11-13 04:55:51',0,'Exhibition approval needed','Review: \"Test\" (ID 22).','2025-11-13 04:55:51','pending',''),(32,NULL,'','2025-11-13 06:05:46',0,'Event approval needed','New event \"Art\" requires admin approval.',NULL,'pending',''),(33,NULL,'','2025-11-13 06:12:37',0,'Event approval needed','New event \"Event\" requires admin approval.',NULL,'pending',''),(34,NULL,'','2025-11-13 06:26:42',0,'Event approval needed','New event \"New Event\" requires admin approval.',NULL,'pending',''),(36,1,'Low stock alert: \"Art Postcard Set\" now has only 5 items left.','2025-11-13 06:35:40',1,NULL,NULL,NULL,'pending','low_stock'),(37,NULL,'','2025-11-13 06:47:30',0,'Event approval needed','New event \"Light Show\" requires admin approval.',NULL,'pending',''),(38,NULL,'','2025-11-13 15:09:49',0,'Event approval needed','New event \"Light Show\" requires admin approval.',NULL,'pending',''),(39,NULL,'','2025-11-13 19:34:26',0,'Exhibition approval needed','Review: \"test\" (ID 23).','2025-11-13 19:34:26','pending','exhibition_request'),(40,NULL,'','2025-11-13 20:43:45',0,'Exhibition approval needed','Review: \"Test\" (ID 24).','2025-11-13 20:43:45','pending','exhibition_request'),(41,34,'Low stock alert: \"House Mug\" now has only 4 items left.','2025-11-13 23:04:02',1,NULL,NULL,NULL,'pending','low_stock'),(42,NULL,'','2025-11-13 23:10:07',0,'Exhibition approval needed','Review: \"test exhibition class\" (ID 25).','2025-11-13 23:10:07','pending','exhibition_request'),(43,NULL,'','2025-11-13 23:10:41',0,'Event approval needed','New event \"events test\" requires admin approval.',NULL,'pending',''),(44,NULL,'','2025-11-13 23:11:21',0,'Event approval needed','New event \"test event 2\" requires admin approval.',NULL,'pending',''),(45,1,'Low stock alert: \"Art Postcard Set\" now has only 3 items left.','2025-11-13 23:41:07',1,NULL,NULL,NULL,'pending','low_stock'),(46,33,'Low stock alert: \"Abstract Post Card\" now has only 4 items left.','2025-11-13 23:48:17',1,NULL,NULL,NULL,'pending','low_stock'),(48,18,'Low stock alert: \"Art Puzzle - Starry Night\" now has only 4 items left.','2025-11-14 00:35:27',1,NULL,NULL,NULL,'pending','low_stock'),(49,NULL,'','2025-11-14 00:40:03',0,'Event approval needed','New event \"Database presentation\" requires admin approval.',NULL,'pending',''),(50,NULL,'','2025-11-17 20:53:37',0,'Event approval needed','New event \"Placeholder\" requires admin approval.',NULL,'pending',''),(53,33,'Low stock alert: \"Abstract Post Card\" now has only 3 items left.','2025-11-22 20:55:12',0,NULL,NULL,NULL,'pending','low_stock'),(54,1,'Low stock alert: \"Art Postcard Set\" now has only 4 items left.','2025-11-22 21:01:13',0,NULL,NULL,NULL,'pending','low_stock');
/*!40000 ALTER TABLE `Notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Shop_Products`
--

DROP TABLE IF EXISTS `Shop_Products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Shop_Products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(30) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `category` varchar(30) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `deleted_at` datetime DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `sku` (`sku`),
  UNIQUE KEY `sku_2` (`sku`),
  CONSTRAINT `Shop_Products_chk_1` CHECK ((`price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Shop_Products`
--

LOCK TABLES `Shop_Products` WRITE;
/*!40000 ALTER TABLE `Shop_Products` DISABLE KEYS */;
INSERT INTO `Shop_Products` VALUES (1,'SKU1002','Art Postcard Set','Stationery',9.99,4,1,NULL,'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQfATtsSxkowRPS4pIk8MPZSN12aFfmji_uLgOcBHEQ3USfQkcng2Ifa5JvvuOtVdaPV63upTkDvqdd6BeTS5h8dpSPyVRF'),(2,'SKU1003','Museum T-Shirt','Apparel',24.99,150,1,NULL,'https://shop.famsf.org/cdn/shop/products/1_TSFSKY_2048x_2b26cc6b-ddfc-46f5-a647-2a8d7bb68637_1200x.jpg?v=1648159472'),(3,'SKU1004','Art Puzzle','Activity',10.99,10,1,NULL,'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSOcuibkI6MiGBzn8afIIlgzgOjog5iMVd_57jUihB8z70skj_9cw0vi5jymSKxcLdHb-hDcYXmSu-_L4Q28_QNZw46Dov4JVuVH4bZUdjPgdhQzzaLMilUQw'),(18,'SKU1005','Art Puzzle - Starry Night','Activity',20.99,10,1,NULL,'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTEt_BLUwSurmdJSlNr6UeQa_dMRBfsBXEKFaEIf6DkY93dEg_KzR2urtic9FqGLazdKiFxTA54pQ4p02oZ7nB2oI2Hji21j3qFijYJgxcL8wgpcptt1j7iN1BMrajTKg&usqp=CAc'),(19,'SKU1006','Horror Movies Coloring Book','Activity',16.99,7,1,NULL,'https://mfashop.mfah.org/cdn/shop/files/81KjCzkmIsL._SL1500_700x.jpg?v=1757092949'),(20,'SKU1007','Notepad','Stationery',17.99,50,1,NULL,'https://mfashop.mfah.org/cdn/shop/files/Positional_notepad_prodotti_004_1024x1024_2x_8ff099ef-1e9a-4fa8-a96f-47b82307a0d2_700x.jpg?v=1734124578'),(21,'SKU1008','Lion Plush Toy','Kids',50.00,49,1,NULL,'https://mfashop.mfah.org/cdn/shop/files/DonnaWilsonCreature-Richie_700x.jpg?v=1700072886'),(22,'SKU1009','Pizza Plush Toy','Kids',50.00,50,1,NULL,'https://mfashop.mfah.org/cdn/shop/files/A2SOP-Amuseable-Slice-of-Pizza-5_1_700x.jpg?v=1717799522'),(23,'SKU1100','\"The Corn Poppy\" Print','Art',42.00,11,1,NULL,'https://mfashop.mfah.org/cdn/shop/products/Van_Dongen_Corn_Poppy_6586_unframed_700x.jpg?v=1602092499'),(24,'SKU1101','\"Blue Monolith\" Print','Art',42.00,49,1,NULL,'https://mfashop.mfah.org/cdn/shop/products/Hoffmann_Blue_Monolith_45490_unframed_700x.jpg?v=1602089634'),(25,'SKU1102','Van Gogh Apron','Home',38.00,100,1,NULL,'https://store.metmuseum.org/media/catalog/product/8/0-189069-79618/van-gogh-wheat-field-with-cypresses-apron.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=448&width=448&canvas=448:448&dpr=2'),(26,'SKU1103','Van Gogh Placemats','Home',30.00,99,1,NULL,'https://store.metmuseum.org/media/catalog/product/8/0-194236-85173/van-gogh-irises-placemats.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=448&width=448&canvas=448:448&dpr=2'),(27,'SKU1104','Van Gogh Coasters','Home',30.00,50,1,NULL,'https://store.metmuseum.org/media/catalog/product/8/0-198747-90944/van-gogh-paintings-glass-coasters-.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=448&width=448&canvas=448:448'),(28,'SKU1105','Cat Mug','Home',30.00,100,1,NULL,'https://store.metmuseum.org/media/catalog/product/t/h-201604-91934/the-favorite-cat-covered-mug-with-tea-infuser.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=448&width=448&canvas=448:448&dpr=2'),(29,'SKU1106','Cat Apron','Home',30.00,100,1,NULL,'https://store.metmuseum.org/media/catalog/product/8/0-195580-86788/the-favorite-cat-apron.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=448&width=448&canvas=448:448&dpr=2'),(30,'SKU1107','Miffy Plush Toy','Kids',67.00,64,1,NULL,'https://store.metmuseum.org/media/catalog/product/m/i-203197-92642/miffy-degas-dancer-plush-toy.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=502&width=502&canvas=502:502&dpr=2%202x'),(31,'SKU1109','Floral Pajama Set','Apparel',69.00,99,1,NULL,'https://store.metmuseum.org/media/catalog/product/8/0-207726-95031/william-morris-pomegranate-women-039-s-cotton-short-pajamas.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=502&width=502&canvas=502:502&dpr=2%202x'),(32,'SKU1110','Socks Set','Apparel',20.00,50,1,NULL,'https://store.metmuseum.org/media/catalog/product/m/u-202561-92459/museum-favorites-men-039-s-gift-boxed-sock-set.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=502&width=502&canvas=502:502&dpr=2%202x'),(33,'SKU1234','Abstract Post Card','Art',54.00,3,1,NULL,'https://www.creativefabrica.com/wp-content/uploads/2023/05/11/Modern-colourful-abstract-background-Graphics-69439498-1.jpg'),(34,'SKU1111','House Mug','Home',33.50,12,1,NULL,'https://th.bing.com/th/id/OIP.3Iqy3dGluTv7Aiyms-mCrwHaGe?w=239&h=192&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'),(35,'123123123','Example','Art',12.00,12,0,'2025-11-18 01:08:14','');
/*!40000 ALTER TABLE `Shop_Products` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`appuser`@`%`*/ /*!50003 TRIGGER `low_shop_product_alert` AFTER UPDATE ON `Shop_Products` FOR EACH ROW BEGIN
  IF NEW.quantity <= 5 AND OLD.quantity > 5 THEN
    INSERT INTO Notifications (product_id, message)
    VALUES (
      NEW.product_id,
      CONCAT(
        'Low stock alert: "', NEW.name,
        '" now has only ', NEW.quantity, ' items left.'
      )
    );
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`appuser`@`%`*/ /*!50003 TRIGGER `clear_low_stock_alert` AFTER UPDATE ON `Shop_Products` FOR EACH ROW BEGIN
    IF NEW.quantity > 5 AND OLD.quantity <= 5 THEN
        DELETE FROM Notifications
        WHERE product_id = NEW.product_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Supplier_Products`
--

DROP TABLE IF EXISTS `Supplier_Products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Supplier_Products` (
  `supplier_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`supplier_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `Supplier_Products_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `Suppliers` (`supplier_id`) ON DELETE CASCADE,
  CONSTRAINT `Supplier_Products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `Shop_Products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Supplier_Products`
--

LOCK TABLES `Supplier_Products` WRITE;
/*!40000 ALTER TABLE `Supplier_Products` DISABLE KEYS */;
INSERT INTO `Supplier_Products` VALUES (1,1),(1,2),(2,2),(3,2),(1,3),(2,18),(1,19),(1,20),(3,21),(3,22),(2,23),(3,24),(2,25),(2,26),(2,27),(2,28),(2,29),(3,30),(2,31),(2,32),(3,33),(2,34),(1,35);
/*!40000 ALTER TABLE `Supplier_Products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Suppliers`
--

DROP TABLE IF EXISTS `Suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Suppliers` (
  `supplier_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`supplier_id`),
  UNIQUE KEY `uq_supplier_email` (`email`),
  CONSTRAINT `chk_sup_atleast_one_contact` CHECK ((((`email` is not null) and (`email` <> _utf8mb3'')) or ((`phone` is not null) and (`phone` <> _utf8mb3''))))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Suppliers`
--

LOCK TABLES `Suppliers` WRITE;
/*!40000 ALTER TABLE `Suppliers` DISABLE KEYS */;
INSERT INTO `Suppliers` VALUES (1,'Atlas Electronics','contact@atlaselec.com','555-839-4721','1420 Maple Ave, Austin, TX 78701'),(2,'BluePeak Distributors','sales@bluepeakdist.com','555-921-0043','87 Lakeview Rd, Denver, CO 80203'),(3,'Quantum Supplies Co.','info@quantumsupplies.com','555-314-7799','256 Harbor St, Seattle, WA 98109');
/*!40000 ALTER TABLE `Suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ticket_Sales`
--

DROP TABLE IF EXISTS `Ticket_Sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ticket_Sales` (
  `sale_id` int NOT NULL AUTO_INCREMENT,
  `visitor_id` int NOT NULL,
  `ticket_amount` int unsigned NOT NULL DEFAULT '1',
  `purchased_date` date DEFAULT NULL,
  `visit_date` date DEFAULT NULL,
  `purchase_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ticket_type_id` int unsigned DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`sale_id`),
  KEY `fk_ticket_sales_visitor` (`visitor_id`),
  KEY `fk_ticket_sales_type` (`ticket_type_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_ticket_sales_type` FOREIGN KEY (`ticket_type_id`) REFERENCES `Ticket_Type` (`ticket_type_id`),
  CONSTRAINT `fk_ticket_sales_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ticket_sales_visitor` FOREIGN KEY (`visitor_id`) REFERENCES `Visitors` (`visitor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_ticket_amount_positive` CHECK ((`ticket_amount` > 0)),
  CONSTRAINT `chk_ticket_sales_price_positive` CHECK ((`purchase_price` >= 0)),
  CONSTRAINT `chk_visit_date_future` CHECK ((`visit_date` >= `purchased_date`))
) ENGINE=InnoDB AUTO_INCREMENT=229 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ticket_Sales`
--

LOCK TABLES `Ticket_Sales` WRITE;
/*!40000 ALTER TABLE `Ticket_Sales` DISABLE KEYS */;
INSERT INTO `Ticket_Sales` VALUES (11,5,2,'2025-10-20','2025-10-22',48.00,1,NULL),(12,1,2,'2025-04-03','2025-04-05',48.00,1,NULL),(13,2,1,'2025-04-08','2025-04-09',20.00,2,NULL),(14,3,3,'2025-04-15','2025-04-17',0.00,3,NULL),(15,4,2,'2025-04-25','2025-04-26',20.00,4,NULL),(16,5,1,'2025-05-01','2025-05-03',24.00,1,NULL),(17,6,4,'2025-05-08','2025-05-10',80.00,2,NULL),(18,7,2,'2025-05-14','2025-05-16',0.00,3,NULL),(19,8,3,'2025-05-22','2025-05-25',30.00,4,NULL),(20,9,1,'2025-06-02','2025-06-04',24.00,1,NULL),(21,10,2,'2025-06-06','2025-06-08',40.00,2,NULL),(22,1,3,'2025-06-10','2025-06-12',0.00,3,NULL),(23,2,2,'2025-06-15','2025-06-17',20.00,4,NULL),(24,3,1,'2025-06-22','2025-06-23',24.00,1,NULL),(25,4,2,'2025-07-01','2025-07-02',40.00,2,NULL),(26,5,3,'2025-07-06','2025-07-08',0.00,3,NULL),(27,6,1,'2025-07-12','2025-07-14',10.00,4,NULL),(28,7,4,'2025-07-20','2025-07-21',96.00,1,NULL),(29,8,2,'2025-07-25','2025-07-27',40.00,2,NULL),(30,9,3,'2025-08-01','2025-08-03',0.00,3,NULL),(31,10,1,'2025-08-08','2025-08-09',10.00,4,NULL),(32,1,2,'2025-08-15','2025-08-17',48.00,1,NULL),(33,2,1,'2025-08-20','2025-08-22',20.00,2,NULL),(34,3,2,'2025-08-26','2025-08-28',0.00,3,NULL),(35,4,3,'2025-09-01','2025-09-03',30.00,4,NULL),(36,5,1,'2025-09-06','2025-09-08',24.00,1,NULL),(37,6,2,'2025-09-10','2025-09-12',40.00,2,NULL),(38,7,4,'2025-09-18','2025-09-20',0.00,3,NULL),(39,8,3,'2025-09-25','2025-09-27',30.00,4,NULL),(40,9,1,'2025-10-01','2025-10-03',24.00,1,NULL),(41,10,2,'2025-10-08','2025-10-10',40.00,2,NULL),(42,1,3,'2025-10-14','2025-10-16',0.00,3,NULL),(43,2,1,'2025-10-20','2025-10-22',10.00,4,NULL),(44,3,4,'2025-10-24','2025-10-26',96.00,1,NULL),(45,4,2,'2025-10-27','2025-10-29',40.00,2,NULL),(46,5,1,'2025-10-30','2025-11-01',0.00,3,NULL),(47,32,2,'2024-06-23','2024-07-05',40.00,2,NULL),(48,12,1,'2024-07-21','2025-08-02',40.00,5,NULL),(49,28,1,'2025-05-07','2025-05-15',20.00,2,NULL),(50,26,1,'2025-07-31','2025-10-16',40.00,5,NULL),(51,36,1,'2025-05-04','2025-06-29',24.00,1,NULL),(52,11,2,'2024-04-06','2024-07-22',20.00,4,NULL),(53,52,2,'2025-03-14','2025-03-14',0.00,3,NULL),(54,9,1,'2024-06-14','2024-07-14',40.00,5,NULL),(55,20,1,'2024-04-09','2025-03-05',40.00,5,NULL),(56,46,2,'2024-08-12','2024-11-28',40.00,2,NULL),(57,29,1,'2024-11-22','2025-03-06',24.00,1,NULL),(58,48,2,'2025-04-11','2025-05-22',48.00,1,NULL),(59,61,1,'2025-04-27','2025-07-15',24.00,1,NULL),(60,6,1,'2025-02-01','2025-03-10',40.00,5,NULL),(61,1,1,'2024-11-23','2024-12-02',0.00,3,NULL),(62,46,2,'2025-04-10','2025-04-13',48.00,1,NULL),(63,27,1,'2025-04-20','2025-08-16',0.00,3,NULL),(64,19,1,'2024-03-18','2024-07-18',24.00,1,NULL),(65,3,1,'2025-10-21','2025-11-04',40.00,5,NULL),(66,55,1,'2024-04-15','2024-06-10',0.00,3,NULL),(67,32,2,'2024-07-23','2025-06-11',20.00,4,NULL),(68,22,1,'2025-07-03','2025-10-15',10.00,4,NULL),(69,39,3,'2024-05-23','2024-06-28',0.00,3,NULL),(70,55,1,'2025-06-21','2025-06-24',10.00,4,NULL),(71,23,2,'2025-03-02','2025-07-21',80.00,5,NULL),(72,1,3,'2025-06-30','2025-09-29',72.00,1,NULL),(73,7,2,'2024-08-05','2025-01-16',40.00,2,NULL),(74,24,2,'2024-06-24','2024-10-12',80.00,5,NULL),(75,66,1,'2024-11-19','2025-02-16',24.00,1,NULL),(76,27,1,'2025-08-19','2025-10-22',10.00,4,NULL),(77,6,1,'2024-03-02','2024-06-27',10.00,4,NULL),(78,40,2,'2025-04-24','2025-07-04',80.00,5,NULL),(79,19,1,'2025-01-03','2025-07-24',24.00,1,NULL),(80,22,2,'2025-03-28','2025-09-28',48.00,1,NULL),(81,21,1,'2024-04-20','2024-05-26',10.00,4,NULL),(82,49,3,'2025-02-02','2025-04-22',72.00,1,NULL),(83,34,2,'2024-09-11','2024-09-16',20.00,4,NULL),(84,18,1,'2024-09-16','2024-10-11',40.00,5,NULL),(85,58,1,'2024-03-17','2024-10-15',40.00,5,NULL),(86,9,2,'2024-10-27','2025-05-02',0.00,3,NULL),(87,29,1,'2024-03-29','2024-09-24',20.00,2,NULL),(88,36,2,'2024-09-16','2025-01-10',40.00,2,NULL),(89,19,2,'2025-04-07','2025-06-04',80.00,5,NULL),(90,58,1,'2025-03-04','2025-06-02',24.00,1,NULL),(91,45,1,'2024-06-02','2024-11-24',40.00,5,NULL),(92,40,1,'2024-04-27','2024-10-03',40.00,5,NULL),(93,7,1,'2024-08-23','2024-11-10',20.00,2,NULL),(94,46,2,'2024-08-25','2025-01-24',80.00,5,NULL),(95,64,2,'2024-03-09','2024-11-19',20.00,4,NULL),(96,18,1,'2025-01-15','2025-11-01',10.00,4,NULL),(97,7,1,'2025-07-01','2025-07-31',10.00,4,NULL),(98,1,2,'2024-06-25','2024-11-25',80.00,5,NULL),(99,60,4,'2024-08-05','2024-09-09',160.00,5,NULL),(100,31,2,'2024-07-19','2025-04-17',0.00,3,NULL),(101,5,1,'2025-10-27','2025-10-29',40.00,5,NULL),(102,35,2,'2024-06-01','2024-10-10',20.00,4,NULL),(103,57,2,'2025-07-23','2025-10-23',48.00,1,NULL),(104,46,1,'2024-06-16','2024-07-08',40.00,5,NULL),(105,8,1,'2025-07-03','2025-09-03',24.00,1,NULL),(106,15,1,'2025-04-03','2025-09-04',40.00,5,NULL),(107,6,1,'2024-05-28','2024-07-11',40.00,5,NULL),(108,51,2,'2024-10-22','2025-01-02',48.00,1,NULL),(109,48,1,'2025-06-20','2025-10-04',0.00,3,NULL),(110,27,2,'2025-07-06','2025-09-29',48.00,1,NULL),(111,42,2,'2025-06-27','2025-09-20',0.00,3,NULL),(112,63,1,'2024-05-11','2024-10-26',24.00,1,NULL),(113,31,2,'2024-11-22','2025-03-08',40.00,2,NULL),(114,40,1,'2024-06-05','2024-10-08',20.00,2,NULL),(115,11,4,'2024-05-23','2024-07-04',80.00,2,NULL),(116,1,2,'2025-06-23','2025-08-21',48.00,1,NULL),(117,37,2,'2025-06-27','2025-09-14',40.00,2,NULL),(118,64,1,'2024-09-13','2024-12-15',10.00,4,NULL),(119,8,3,'2024-04-01','2024-09-26',120.00,5,NULL),(120,6,2,'2024-09-08','2024-11-13',48.00,1,NULL),(121,11,1,'2024-05-25','2024-07-09',10.00,4,NULL),(122,32,1,'2024-11-14','2025-04-22',24.00,1,NULL),(123,39,2,'2025-04-17','2025-09-22',48.00,1,NULL),(124,38,2,'2024-03-25','2025-02-17',20.00,4,NULL),(125,1,2,'2025-04-23','2025-06-30',40.00,2,NULL),(126,2,1,'2024-04-25','2024-08-22',10.00,4,NULL),(127,28,1,'2025-09-13','2025-10-23',0.00,3,NULL),(128,37,2,'2025-04-28','2025-05-21',0.00,3,NULL),(129,42,1,'2025-05-03','2025-09-04',40.00,5,NULL),(130,54,2,'2024-05-16','2024-09-09',20.00,4,NULL),(131,46,2,'2025-07-11','2025-07-17',80.00,5,NULL),(132,23,1,'2024-07-09','2024-09-29',20.00,2,NULL),(133,57,2,'2024-11-23','2025-07-10',0.00,3,NULL),(134,3,1,'2025-03-09','2025-08-08',24.00,1,NULL),(135,57,2,'2024-05-06','2024-08-21',20.00,4,NULL),(136,11,1,'2024-10-11','2025-03-20',24.00,1,NULL),(137,26,1,'2024-09-09','2024-10-02',0.00,3,NULL),(138,28,1,'2024-06-01','2024-08-17',20.00,2,NULL),(139,39,1,'2024-11-29','2025-03-06',10.00,4,NULL),(140,15,1,'2024-11-06','2024-11-17',24.00,1,NULL),(141,3,1,'2024-11-24','2025-10-31',0.00,3,NULL),(142,26,2,'2024-10-09','2024-12-20',20.00,4,NULL),(143,52,1,'2025-10-30','2025-11-01',20.00,2,NULL),(144,29,2,'2024-09-08','2024-12-31',80.00,5,NULL),(145,55,2,'2025-09-03','2025-10-06',20.00,4,NULL),(146,42,2,'2025-03-28','2025-08-08',80.00,5,NULL),(147,8,2,'2025-08-31','2025-09-13',80.00,5,NULL),(148,20,1,'2025-06-15','2025-08-23',20.00,2,NULL),(149,70,1,'2025-11-19','2025-11-19',24.00,1,140),(150,70,1,'2025-11-19','2025-11-19',10.00,4,140),(192,5,2,'2024-02-28','2024-03-03',48.00,1,NULL),(193,12,1,'2024-03-04','2024-03-05',24.00,1,NULL),(194,18,3,'2024-04-10','2024-04-12',72.00,1,NULL),(195,21,2,'2024-05-01','2024-05-03',40.00,2,NULL),(196,30,1,'2024-06-15','2024-06-16',20.00,2,NULL),(197,7,4,'2024-07-01','2024-07-05',80.00,2,NULL),(198,13,2,'2024-08-02','2024-08-03',0.00,3,NULL),(199,28,3,'2024-09-12','2024-09-14',72.00,1,NULL),(200,33,5,'2024-10-20','2024-10-22',100.00,2,NULL),(201,44,2,'2024-11-05','2024-11-07',48.00,1,NULL),(202,8,2,'2025-03-28','2025-04-03',40.00,2,NULL),(203,17,1,'2025-04-10','2025-04-11',24.00,1,NULL),(204,19,3,'2025-04-19','2025-04-20',60.00,2,NULL),(205,11,2,'2025-05-25','2025-06-02',48.00,1,NULL),(206,27,4,'2025-06-10','2025-06-12',80.00,2,NULL),(207,35,1,'2025-07-05','2025-07-06',24.00,1,NULL),(208,6,2,'2025-07-29','2025-08-02',40.00,2,NULL),(209,23,3,'2025-08-10','2025-08-12',0.00,3,NULL),(210,46,2,'2025-09-01','2025-09-03',48.00,1,NULL),(211,9,2,'2025-09-29','2025-10-02',48.00,1,NULL),(212,10,3,'2025-10-15','2025-10-17',60.00,2,NULL),(213,32,1,'2025-11-20','2025-11-22',0.00,3,NULL),(214,4,2,'2025-11-28','2025-12-04',48.00,1,NULL),(215,29,3,'2025-12-10','2025-12-12',60.00,2,NULL),(216,55,1,'2026-01-05','2026-01-06',24.00,1,NULL),(217,7,2,'2026-01-25','2026-02-03',40.00,2,NULL),(218,14,3,'2026-02-11','2026-02-13',0.00,3,NULL),(219,47,1,'2026-03-20','2026-03-21',24.00,1,NULL),(220,16,2,'2026-03-28','2026-04-02',48.00,1,NULL),(221,38,4,'2026-04-10','2026-04-12',80.00,2,NULL),(222,52,1,'2026-05-01','2026-05-02',0.00,3,NULL),(223,3,2,'2026-05-30','2026-06-03',48.00,1,NULL),(224,26,3,'2026-06-18','2026-06-20',60.00,2,NULL),(225,70,1,'2026-07-25','2026-07-27',24.00,1,NULL),(226,70,1,'2025-11-23','2025-11-23',10.00,4,140),(227,11,1,'2025-11-23','2025-11-23',40.00,5,11),(228,71,1,'2025-11-24','2025-11-24',10.00,4,141);
/*!40000 ALTER TABLE `Ticket_Sales` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`appuser`@`%`*/ /*!50003 TRIGGER `trg_ticket_sales_snapshot_price` BEFORE INSERT ON `Ticket_Sales` FOR EACH ROW BEGIN
  DECLARE v_unit DECIMAL(10,2);

  -- Get the current ticket type price
  SELECT total_price INTO v_unit
  FROM Ticket_Type
  WHERE ticket_type_id = NEW.ticket_type_id;

  -- Set purchase_price to total = unit * quantity
  SET NEW.purchase_price = ROUND(v_unit * NEW.ticket_amount, 2);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Ticket_Type`
--

DROP TABLE IF EXISTS `Ticket_Type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ticket_Type` (
  `ticket_type_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `total_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` date DEFAULT NULL,
  `updated_at` date DEFAULT NULL,
  PRIMARY KEY (`ticket_type_id`),
  CONSTRAINT `chk_ticket_price_positive` CHECK ((`total_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ticket_Type`
--

LOCK TABLES `Ticket_Type` WRITE;
/*!40000 ALTER TABLE `Ticket_Type` DISABLE KEYS */;
INSERT INTO `Ticket_Type` VALUES (1,'Adult 19+','Access to all current exhibitions',24.00,1,'2025-11-10','2025-11-11'),(2,'Senior 65+','Access to all current exhibitions',20.00,1,'2025-11-10','2025-11-10'),(3,'Child (under 12)','Children must be accompanied by an adult',0.00,1,'2025-11-10','2025-11-10'),(4,'Youth 13-18','Access to all current exhibitions',10.00,1,'2025-11-10','2025-11-10'),(5,'Family Pass','Admission for up to 4 guests, includes all exhibitions.',40.00,1,'2025-11-10','2025-11-11'),(7,'test ticket','2',10000.00,0,'2025-11-11','2025-11-11');
/*!40000 ALTER TABLE `Ticket_Type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','employee','visitor') NOT NULL DEFAULT 'visitor',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (5,'admin@example.com','$2b$11$gV9NqOexYEeFXchZyj3EVudgb/CCdi02.JpX/ceXmR2UY9jQ5GeZS','admin',1,'2025-10-20 18:02:55','2025-11-12 19:00:24','Ada','Lovelace'),(6,'aa@gmail.com','$2b$11$q7Koc7vw5K384UhUgl1u0uoYuD4OVz76ML5YBpOGrVcygqRe1hktO','visitor',1,'2025-10-20 19:38:02','2025-11-12 19:00:24','aa','aa'),(7,'admin@gmail.com','a','visitor',1,'2025-10-20 19:38:35','2025-11-12 19:00:24','admin','admin'),(8,'slop@slop.com','$2b$11$CMFevooOJrNeoGgQSRGxN.hrGr1WoDwPSTKJmKeKqkneDYrfnEOBm','visitor',1,'2025-10-21 00:17:49','2025-11-12 19:00:24','Brayan','Chavez'),(9,'jennysmith@gmail.com','$2b$11$jhuT5rNZNaVTSf6VC8CLZu7XLJDfC3wP8naA0/PKn3Z47WxRIfqmy','admin',1,'2025-10-21 00:19:49','2025-11-12 19:00:24','Jenny','Smith'),(10,'a@gmail.com','$2b$11$vRlAmtgkEMteCPk532laTO05xgS86RDz/2ZrNhlxhB6/Rt7SnD9M.','employee',1,'2025-10-21 05:31:52','2025-11-12 19:00:24','a','a'),(11,'jamescook@gmail.com','$2b$11$y5mz9/kpOw0SQU6YIggcn.7.XMo3Xpvyx55EQ2P9kzUEDTzSsnTOS','visitor',1,'2025-10-22 03:28:29','2025-11-12 19:00:24','James','Cook'),(12,'admin1@gmail.com','12345678','admin',1,'2025-10-23 22:22:10','2025-11-12 19:00:24','aa','aa'),(13,'newadmin@gmail.com','$2b$11$VUpSKhpgJ5Ku.IGZGCY9gOEgZWXi6SRlLQEyLnk/CEFYP2MGHrs4O','admin',1,'2025-10-23 22:49:42','2025-11-13 22:56:00','New','Admin'),(14,'ludi@crous.speed','$2b$11$vnqaXtkKK6hWQwqqvy0EY.4.yGUv2shwLXJmDoOfosn8Ij1BQAPnO','admin',1,'2025-10-24 03:06:19','2025-11-12 19:00:24','ludi','crous'),(15,'AbbyAnderson@gmail.com','Password123!','admin',1,'2025-10-24 17:35:34','2025-11-12 19:00:24','Abby','Anderson'),(16,'spongbob@squarepants.com','$2b$11$JJ5/JME8.ehNgVrlRrVGzuFaRsIcP6tcTwzNBD3B02..AVi4NNE.6','admin',1,'2025-10-24 19:53:17','2025-11-12 19:00:24','spongbob','SquarePants'),(17,'tpham@gmail.com','$2b$11$PndmY9tgUEVCtpQS407.JuKc2j7jnCla.g.cAEpbWj9RH3aO771i6','employee',1,'2025-10-27 01:59:32','2025-11-12 19:00:24','Tyler','Pham'),(18,'aaa@gmail.com','$2b$11$2g.buJECT8MLa6UsJpsGQ.IbfMi6qHDh704pf.JTXBBZfKMM2j72y','visitor',1,'2025-10-27 04:15:28','2025-11-12 19:00:24','aa','aa'),(19,'visitor@gmail.com','$2b$11$GezcreHsnfqBgUhqfz3.eu0DcgARzsl6DOkxXzRsj6WjPifkUqfLW','visitor',1,'2025-10-28 04:08:22','2025-11-12 19:00:24','test','test'),(20,'ngp@gmail.com','$2b$11$f5TnDApBTQU2ZFpWAoNnEekR1pkl4w3NV14ZugmNMfVCULuRnRuQa','visitor',1,'2025-10-28 19:39:07','2025-11-12 19:00:24','n','p'),(21,'tony@gmail.com','$2b$11$d/nwLBtBjUdPyoDLAaLQzeDYACMUrt9OEQo.myfR76nwSbnDHDcIG','visitor',1,'2025-10-29 00:21:26','2025-11-12 19:00:24','Tony','Stark'),(22,'visitor@user.org','$2b$11$5QMx2Jy33MbiqfsF.e.eBu/0gHc6Cq2/SK/o5sPTDisIzf5Nc3Yw.','visitor',1,'2025-10-29 03:29:10','2025-11-12 19:00:24','Visitor','User'),(23,'employee@user.org','$2b$11$xQwB0BalAOWVH06gNx5UGO68evvKA4c58VTfEWgAxFEniV81yud/K','employee',1,'2025-10-29 03:32:11','2025-11-12 19:00:24','Employee','User'),(24,'admin@user.org','$2b$11$AQ2gMy03HxffGm3yR2GVN.Rha8JX3N/Xlw9OQbCLuYuPAInC7xSR.','admin',1,'2025-10-29 03:36:56','2025-11-12 19:00:24','Admin','User'),(25,'ara@gmail.com','$2b$10$1dZGyjTDemCrqdKcNCFiXenMzOz3mYURj3Gr4IAfJDcHU3f9WOQki','visitor',1,'2025-10-31 04:22:48','2025-11-12 19:00:24','a','a'),(26,'testuser@gmail.com','$2b$11$bH5P28YmIt2r4lNsjqCXOuJ9r87/Qe2Y/8x//7UzV9dPfpsrzYzY.','visitor',1,'2025-10-31 04:46:51','2025-11-12 19:00:24','test','user'),(27,'ashley@yeni.com','$2b$10$XKwZh26GXD5tjjwWL1KC7uaXHVVUVrlsoE0Bk.QZp1IG8J3lWR1Dm','visitor',1,'2025-11-01 21:36:04','2025-11-12 19:00:24','Ashley','Yeni'),(28,'yeni@ashley.com','$2b$11$IBACYNxHu/ta0NE6.Kx6D.sM2AM5.V0L8HwVSpCKO7.nCpJDA3Wlq','visitor',1,'2025-11-01 21:42:56','2025-11-12 19:00:24','Yeni','Ashley'),(29,'ada@gmail.com','$2b$11$Z2qVMtIp4fv17BL.yV5Bdu/dpn/ouikjoYGlR4pO1K5tAJJBXjO2S','visitor',1,'2025-11-04 22:52:11','2025-11-12 19:00:24','adadada','adadaa'),(30,'Parker@gmail.com','$2b$10$qKMta/lwG0z6NTRr7/v4peBDesBa59d5rc5iSuobm3h.pXmCLhfhK','employee',1,'2025-11-06 04:50:04','2025-11-12 19:00:24','Peter','Parker'),(31,'aaaa@gmail.com','$2b$10$fILP/1ngkuGh2eNir22PMeEjGVMIVTkbEKmXuU1/J1WwfWvTSt2cO','visitor',1,'2025-11-09 21:21:35','2025-11-12 19:00:24','aa','aaa'),(35,'employee@john.org','$2b$10$O8rodPpK8T0NQGt.D6AkfuueJRt.L99pHXKGJ7aSVyINdm4WcKbJe','employee',1,'2025-11-12 20:48:18','2025-11-12 20:48:18','Employee','John'),(36,'visitor@john.org','$2b$11$bwD39mg7g7SaCZCIGPiibuJ3i425qvqFsk5GdDKcNuGnrIMCVFaDO','visitor',1,'2025-11-12 20:59:30','2025-11-12 20:59:30','visitor','john'),(39,'admin3@mfah.com','$2b$10$5dgt.L5gY2P17jhfw8SSkujk7rfn4puT0tjpoCkOx/YRejOYD9/CG','admin',1,'2025-11-13 01:44:48','2025-11-13 01:45:39','admin3','admin3'),(40,'a@a.com','$2b$11$kTslIi4byiMv/7Uj2tg4P.8tA8BoRWY8NZSXUoGym4YrJyeRmHdqu','visitor',1,'2025-11-13 05:02:24','2025-11-13 05:02:24','a','a'),(41,'dnguyen@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-14 00:15:36','Daniel','Nguyen'),(42,'ejohnson@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Emily','Johnson'),(43,'operez@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Olivia','Perez'),(44,'nrobinson@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Noah','Robinson'),(45,'akim@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Ava','Kim'),(46,'egarcia@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Ethan','Garcia'),(47,'idavis@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Isabella','Davis'),(48,'lramirez@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Liam','Ramirez'),(49,'mlopez@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Mia','Lopez'),(50,'jnguyen@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Jacob','Nguyen'),(51,'sclark@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Sophia','Clark'),(52,'bwright@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Benjamin','Wright'),(53,'ahill@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Amelia','Hill'),(54,'eadams@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Elijah','Adams'),(55,'cgonzalez@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Charlotte','Gonzalez'),(56,'hflores@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Henry','Flores'),(57,'apatel@mfah.org','TempPass123!','employee',1,'2025-11-13 05:19:23','2025-11-13 05:19:23','Avery','Patel'),(72,'v1@v1.com','$2b$11$hHSruugIxRi/ndqdJkBhsePRjNC6YytxNjbeVZm9MwtVlg.koSX4u','visitor',1,'2025-11-13 05:32:23','2025-11-13 05:32:23','v1','v1'),(83,'b@gmail.com','$2b$10$aDUG/EfNJRF04dMiU/gxN.dxv9VxhXT4XpDMZ272ygK1XYe/upBoy','employee',1,'2025-11-13 06:09:59','2025-11-13 06:09:59','b','b'),(84,'test@mfah.com','$2b$11$WZC9BuTJpCGMbya/wOrlNeyyYlfzZu6/yhIZ5bZaocpgvgZStYu/u','visitor',1,'2025-11-13 06:30:32','2025-11-13 06:30:32','test','2'),(85,'darny@doe.com','$2b$11$elVuO25KFoxGQH1EOkrJA.MdXxZaUj.g9I/q4gKmszqHxFUtisZDO','visitor',1,'2025-11-13 06:37:31','2025-11-13 06:37:31','Darny','Doe'),(87,'akjshdj@gmail.com','$2b$11$C1vEYZlwmu5Ajm2HDICe1.qSie/kZkrAZSdc3d0ZwbgH6OOscewFm','visitor',1,'2025-11-13 19:58:20','2025-11-13 19:58:20','Kevin','PP'),(88,'amy.lopez1@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Amy','Lopez'),(89,'brian.nguyen2@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Brian','Nguyen'),(90,'carla.martinez3@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Carla','Martinez'),(91,'david.chen4@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','David','Chen'),(92,'emma.patel5@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Emma','Patel'),(93,'frank.harris6@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Frank','Harris'),(94,'grace.jones7@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Grace','Jones'),(95,'henry.garcia8@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Henry','Garcia'),(96,'isabella.lee9@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Isabella','Lee'),(97,'jason.king10@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Jason','King'),(98,'karen.roberts11@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Karen','Roberts'),(99,'liam.scott12@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Liam','Scott'),(100,'mia.turner13@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Mia','Turner'),(101,'noah.clark14@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Noah','Clark'),(102,'olivia.adams15@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Olivia','Adams'),(103,'peter.baker16@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Peter','Baker'),(104,'quinn.campbell17@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Quinn','Campbell'),(105,'rachel.diaz18@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Rachel','Diaz'),(106,'samuel.edwards19@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Samuel','Edwards'),(107,'tina.foster20@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Tina','Foster'),(108,'umar.gomez21@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Umar','Gomez'),(109,'violet.howard22@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Violet','Howard'),(110,'william.iverson23@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','William','Iverson'),(111,'xavier.jenkins24@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Xavier','Jenkins'),(112,'yasmin.khan25@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Yasmin','Khan'),(113,'zach.lewis26@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Zach','Lewis'),(114,'chloe.morris27@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Chloe','Morris'),(115,'derek.nelson28@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Derek','Nelson'),(116,'elena.owens29@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Elena','Owens'),(117,'felix.perez30@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Felix','Perez'),(118,'gavin.quintana31@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Gavin','Quintana'),(119,'hannah.reed32@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Hannah','Reed'),(120,'ian.stewart33@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Ian','Stewart'),(121,'julia.taylor34@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Julia','Taylor'),(122,'kyle.underwood35@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Kyle','Underwood'),(123,'laura.vargas36@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Laura','Vargas'),(124,'marcus.white37@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Marcus','White'),(125,'nina.xu38@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Nina','Xu'),(126,'owen.young39@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Owen','Young'),(127,'paula.zimmerman40@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Paula','Zimmerman'),(128,'riley.brooks41@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Riley','Brooks'),(129,'sophia.carter42@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Sophia','Carter'),(130,'thomas.douglas43@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Thomas','Douglas'),(131,'uma.evans44@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Uma','Evans'),(132,'victor.fisher45@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Victor','Fisher'),(133,'wendy.gray46@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Wendy','Gray'),(134,'ximena.hughes47@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Ximena','Hughes'),(135,'yuri.ingram48@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Yuri','Ingram'),(136,'zoe.jordan49@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Zoe','Jordan'),(137,'amber.knight50@example.com','password123','visitor',1,'2025-11-13 20:30:08','2025-11-13 20:30:08','Amber','Knight'),(138,'123@gmail.com','$2b$11$r7jO61.x99u4MJ7zdZs5ce3tY/cEbUFhmEGdLPbukWaUPlet/DOeS','visitor',1,'2025-11-13 22:58:15','2025-11-13 22:58:15','test','your'),(139,'jodoe@gmail.com','$2b$11$JYeuG0WBytAEn5HCpHNEhOFZkjTUXH0navUPSvGMBXs29SVV0QAz.','visitor',1,'2025-11-14 00:33:02','2025-11-14 00:33:33','Johne','Doee'),(140,'gracejobs@gmail.com','$2b$11$c4xQdcK50TS5Y.SGTMn7D.7/cXyh2fD3KCXXxS5HSmE6UlUB5UIi2','visitor',1,'2025-11-19 18:45:15','2025-11-19 18:45:15','Grace','Jobs'),(141,'charlielabs@gmail.com','$2b$11$jFndki81OxIqxPb8aTIFJepbZpUEdtbIH8nkTNyDK.CzDPeS8E9d6','visitor',1,'2025-11-24 04:14:05','2025-11-24 04:14:05','Charlie','Labs');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Venues`
--

DROP TABLE IF EXISTS `Venues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Venues` (
  `venue_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int DEFAULT NULL,
  `name` varchar(30) NOT NULL,
  `location` varchar(30) DEFAULT NULL,
  `capacity` int NOT NULL,
  PRIMARY KEY (`venue_id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `fk_venue_dept` FOREIGN KEY (`department_id`) REFERENCES `Departments` (`department_id`) ON DELETE RESTRICT,
  CONSTRAINT `Venues_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `Departments` (`department_id`) ON DELETE SET NULL,
  CONSTRAINT `chk_venue_capacity` CHECK ((`capacity` between 1 and 750))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Venues`
--

LOCK TABLES `Venues` WRITE;
/*!40000 ALTER TABLE `Venues` DISABLE KEYS */;
INSERT INTO `Venues` VALUES (1,1,'Admin Offices','Building A - Floor 1',50),(2,2,'Main Gallery','Building B - Floor 1',200),(3,3,'Exhibition Hall 1','Building B - Floor 2',180),(4,3,'Exhibition Hall 2','Building B - Floor 3',170),(5,4,'Main entrance','Main Entrance',60),(6,5,'Showroom','Showroom',70);
/*!40000 ALTER TABLE `Venues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Visitors`
--

DROP TABLE IF EXISTS `Visitors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Visitors` (
  `visitor_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `last_visit` date DEFAULT NULL,
  `membership` tinyint(1) DEFAULT '0',
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`visitor_id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_visitors_user` (`user_id`),
  CONSTRAINT `fk_visitors_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_vis_email_format` CHECK (((`email` is null) or regexp_like(`email`,_utf8mb4'^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'))),
  CONSTRAINT `chk_vis_phone_format` CHECK (regexp_like(`phone`,_utf8mb4'^[0-9]{10}$'))
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Visitors`
--

LOCK TABLES `Visitors` WRITE;
/*!40000 ALTER TABLE `Visitors` DISABLE KEYS */;
INSERT INTO `Visitors` VALUES (1,'Jane','Doe','JaneDoe@gmail.com','7137872211','2000-12-01','1234 Love St','2025-10-16',0,NULL),(2,'Maria','Lopez','mlopez@yahoo.com','8325551002','1988-11-23','456 Pine Ave, Houston, TX 77006','2025-09-25',0,NULL),(3,'David','Nguyen','dnguyen@outlook.com','8325551003','1995-03-08','789 Maple Rd, Houston, TX 77007','2025-10-05',1,NULL),(4,'Sophia','Patel','sophia.patel@gmail.com','8325551004','1992-07-14','321 Cedar Ln, Houston, TX 77008','2025-08-30',0,NULL),(5,'James','Wilson','jwilson@gmail.com','8325551005','1985-01-02','654 Birch St, Houston, TX 77009','2025-10-12',1,NULL),(6,'Olivia','Hernandez','oliviah@icloud.com','8325551006','1998-09-27','987 Spruce Dr, Houston, TX 77010','2025-09-15',0,NULL),(7,'Ethan','Kim','ekim@gmail.com','8325551007','1993-02-16','159 Walnut Ct, Houston, TX 77011','2025-10-20',1,NULL),(8,'Isabella','Garcia','isabellag@yahoo.com','8325551008','2000-04-09','753 Willow Way, Houston, TX 77012','2025-10-01',1,NULL),(9,'Noah','Brown','noahb@mfah.org','8325551009','1991-12-18','852 Palm Blvd, Houston, TX 77013','2025-09-05',0,NULL),(10,'Ava','Tran','avatran@gmail.com','8325551010','1997-06-11','951 Cypress Cir, Houston, TX 77014','2025-10-21',1,NULL),(11,'James','Cook','JamesCook@gmail.com',NULL,NULL,NULL,NULL,0,11),(12,'Visitor','User','visitor@user.org',NULL,NULL,NULL,NULL,0,22),(13,'adadada','adadaa','ada@gmail.com',NULL,NULL,NULL,NULL,0,NULL),(14,'Tony','Stark','tony@gmail.com',NULL,NULL,NULL,NULL,0,NULL),(15,'test','2','test@mfah.com',NULL,NULL,NULL,NULL,0,NULL),(16,'Darny','Doe','darny@doe.com',NULL,NULL,NULL,NULL,0,NULL),(17,'Amy','Lopez','amy.lopez1@example.com','7131000001','1990-01-01','101 Museum Way, Houston, TX 77010',NULL,0,88),(18,'Brian','Nguyen','brian.nguyen2@example.com','7131000002','1990-01-02','102 Gallery Ave, Houston, TX 77011',NULL,0,89),(19,'Carla','Martinez','carla.martinez3@example.com','7131000003','1990-01-03','103 Art Lane, Houston, TX 77012',NULL,0,90),(20,'David','Chen','david.chen4@example.com','7131000004','1990-01-04','104 Canvas Blvd, Houston, TX 77013',NULL,0,91),(21,'Emma','Patel','emma.patel5@example.com','7131000005','1990-01-05','105 Sculpture Rd, Houston, TX 77014',NULL,0,92),(22,'Frank','Harris','frank.harris6@example.com','7131000006','1990-01-06','106 Museum Way, Houston, TX 77015',NULL,0,93),(23,'Grace','Jones','grace.jones7@example.com','7131000007','1990-01-07','107 Gallery Ave, Houston, TX 77016',NULL,0,94),(24,'Henry','Garcia','henry.garcia8@example.com','7131000008','1990-01-08','108 Art Lane, Houston, TX 77017',NULL,0,95),(25,'Isabella','Lee','isabella.lee9@example.com','7131000009','1990-01-09','109 Canvas Blvd, Houston, TX 77018',NULL,0,96),(26,'Jason','King','jason.king10@example.com','7131000010','1990-01-10','110 Sculpture Rd, Houston, TX 77019',NULL,0,97),(27,'Karen','Roberts','karen.roberts11@example.com','7131000011','1990-01-11','111 Museum Way, Houston, TX 77010',NULL,0,98),(28,'Liam','Scott','liam.scott12@example.com','7131000012','1990-01-12','112 Gallery Ave, Houston, TX 77011',NULL,0,99),(29,'Mia','Turner','mia.turner13@example.com','7131000013','1990-01-13','113 Art Lane, Houston, TX 77012',NULL,0,100),(30,'Noah','Clark','noah.clark14@example.com','7131000014','1990-01-14','114 Canvas Blvd, Houston, TX 77013',NULL,0,101),(31,'Olivia','Adams','olivia.adams15@example.com','7131000015','1990-01-15','115 Sculpture Rd, Houston, TX 77014',NULL,0,102),(32,'Peter','Baker','peter.baker16@example.com','7131000016','1990-01-16','116 Museum Way, Houston, TX 77015',NULL,0,103),(33,'Quinn','Campbell','quinn.campbell17@example.com','7131000017','1990-01-17','117 Gallery Ave, Houston, TX 77016',NULL,0,104),(34,'Rachel','Diaz','rachel.diaz18@example.com','7131000018','1990-01-18','118 Art Lane, Houston, TX 77017',NULL,0,105),(35,'Samuel','Edwards','samuel.edwards19@example.com','7131000019','1990-01-19','119 Canvas Blvd, Houston, TX 77018',NULL,0,106),(36,'Tina','Foster','tina.foster20@example.com','7131000020','1990-01-20','120 Sculpture Rd, Houston, TX 77019',NULL,0,107),(37,'Umar','Gomez','umar.gomez21@example.com','7131000021','1990-01-21','121 Museum Way, Houston, TX 77010',NULL,0,108),(38,'Violet','Howard','violet.howard22@example.com','7131000022','1990-01-22','122 Gallery Ave, Houston, TX 77011',NULL,0,109),(39,'William','Iverson','william.iverson23@example.com','7131000023','1990-01-23','123 Art Lane, Houston, TX 77012',NULL,0,110),(40,'Xavier','Jenkins','xavier.jenkins24@example.com','7131000024','1990-01-24','124 Canvas Blvd, Houston, TX 77013',NULL,0,111),(41,'Yasmin','Khan','yasmin.khan25@example.com','7131000025','1990-01-25','125 Sculpture Rd, Houston, TX 77014',NULL,0,112),(42,'Zach','Lewis','zach.lewis26@example.com','7131000026','1990-01-26','126 Museum Way, Houston, TX 77015',NULL,0,113),(43,'Chloe','Morris','chloe.morris27@example.com','7131000027','1990-01-27','127 Gallery Ave, Houston, TX 77016',NULL,0,114),(44,'Derek','Nelson','derek.nelson28@example.com','7131000028','1990-01-28','128 Art Lane, Houston, TX 77017',NULL,0,115),(45,'Elena','Owens','elena.owens29@example.com','7131000029','1990-01-29','129 Canvas Blvd, Houston, TX 77018',NULL,0,116),(46,'Felix','Perez','felix.perez30@example.com','7131000030','1990-01-30','130 Sculpture Rd, Houston, TX 77019',NULL,0,117),(47,'Gavin','Quintana','gavin.quintana31@example.com','7131000031','1990-01-31','131 Museum Way, Houston, TX 77010',NULL,0,118),(48,'Hannah','Reed','hannah.reed32@example.com','7131000032','1990-02-01','132 Gallery Ave, Houston, TX 77011',NULL,0,119),(49,'Ian','Stewart','ian.stewart33@example.com','7131000033','1990-02-02','133 Art Lane, Houston, TX 77012',NULL,0,120),(50,'Julia','Taylor','julia.taylor34@example.com','7131000034','1990-02-03','134 Canvas Blvd, Houston, TX 77013',NULL,0,121),(51,'Kyle','Underwood','kyle.underwood35@example.com','7131000035','1990-02-04','135 Sculpture Rd, Houston, TX 77014',NULL,0,122),(52,'Laura','Vargas','laura.vargas36@example.com','7131000036','1990-02-05','136 Museum Way, Houston, TX 77015',NULL,0,123),(53,'Marcus','White','marcus.white37@example.com','7131000037','1990-02-06','137 Gallery Ave, Houston, TX 77016',NULL,0,124),(54,'Nina','Xu','nina.xu38@example.com','7131000038','1990-02-07','138 Art Lane, Houston, TX 77017',NULL,0,125),(55,'Owen','Young','owen.young39@example.com','7131000039','1990-02-08','139 Canvas Blvd, Houston, TX 77018',NULL,0,126),(56,'Paula','Zimmerman','paula.zimmerman40@example.com','7131000040','1990-02-09','140 Sculpture Rd, Houston, TX 77019',NULL,0,127),(57,'Riley','Brooks','riley.brooks41@example.com','7131000041','1990-02-10','141 Museum Way, Houston, TX 77010',NULL,0,128),(58,'Sophia','Carter','sophia.carter42@example.com','7131000042','1990-02-11','142 Gallery Ave, Houston, TX 77011',NULL,0,129),(59,'Thomas','Douglas','thomas.douglas43@example.com','7131000043','1990-02-12','143 Art Lane, Houston, TX 77012',NULL,0,130),(60,'Uma','Evans','uma.evans44@example.com','7131000044','1990-02-13','144 Canvas Blvd, Houston, TX 77013',NULL,0,131),(61,'Victor','Fisher','victor.fisher45@example.com','7131000045','1990-02-14','145 Sculpture Rd, Houston, TX 77014',NULL,0,132),(62,'Wendy','Gray','wendy.gray46@example.com','7131000046','1990-02-15','146 Museum Way, Houston, TX 77015',NULL,0,133),(63,'Ximena','Hughes','ximena.hughes47@example.com','7131000047','1990-02-16','147 Gallery Ave, Houston, TX 77016',NULL,0,134),(64,'Yuri','Ingram','yuri.ingram48@example.com','7131000048','1990-02-17','148 Art Lane, Houston, TX 77017',NULL,0,135),(65,'Zoe','Jordan','zoe.jordan49@example.com','7131000049','1990-02-18','149 Canvas Blvd, Houston, TX 77018',NULL,0,136),(66,'Amber','Knight','amber.knight50@example.com','7131000050','1990-02-19','150 Sculpture Rd, Houston, TX 77019',NULL,0,137),(68,'test','your','123@gmail.com',NULL,NULL,NULL,NULL,0,NULL),(69,'Johne','Doee','jodoe@gmail.com',NULL,NULL,NULL,NULL,0,NULL),(70,'Grace','Jobs','gracejobs@gmail.com',NULL,NULL,NULL,NULL,0,NULL),(71,'Charlie','Labs','charlielabs@gmail.com',NULL,NULL,NULL,NULL,0,NULL);
/*!40000 ALTER TABLE `Visitors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_revenue_detailed`
--

DROP TABLE IF EXISTS `vw_revenue_detailed`;
/*!50001 DROP VIEW IF EXISTS `vw_revenue_detailed`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_revenue_detailed` AS SELECT 
 1 AS `transaction_id`,
 1 AS `transaction_type`,
 1 AS `visitor_id`,
 1 AS `customer_name`,
 1 AS `transaction_date`,
 1 AS `item_name`,
 1 AS `quantity`,
 1 AS `unit_price`,
 1 AS `total_amount`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'mfah'
--

--
-- Dumping routines for database 'mfah'
--

--
-- Final view structure for view `vw_revenue_detailed`
--

/*!50001 DROP VIEW IF EXISTS `vw_revenue_detailed`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`appuser`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_revenue_detailed` AS select `ts`.`sale_id` AS `transaction_id`,'ticket' AS `transaction_type`,`v`.`visitor_id` AS `visitor_id`,concat(`v`.`first_name`,' ',`v`.`last_name`) AS `customer_name`,`ts`.`purchased_date` AS `transaction_date`,`tt`.`name` AS `item_name`,`ts`.`ticket_amount` AS `quantity`,`ts`.`purchase_price` AS `unit_price`,(`ts`.`ticket_amount` * `ts`.`purchase_price`) AS `total_amount` from ((`Ticket_Sales` `ts` join `Ticket_Type` `tt` on((`ts`.`ticket_type_id` = `tt`.`ticket_type_id`))) left join `Visitors` `v` on((`ts`.`visitor_id` = `v`.`visitor_id`))) union all select `mr`.`records_id` AS `transaction_id`,'membership' AS `transaction_type`,`v`.`visitor_id` AS `visitor_id`,concat(`v`.`first_name`,' ',`v`.`last_name`) AS `customer_name`,`mr`.`created_at` AS `transaction_date`,`mt`.`name` AS `item_name`,1 AS `quantity`,`mr`.`price_at_purchase` AS `unit_price`,`mr`.`price_at_purchase` AS `total_amount` from ((`Membership_records` `mr` join `Membership_Types` `mt` on((`mr`.`plan_id` = `mt`.`plan_id`))) left join `Visitors` `v` on((`mr`.`visitor_id` = `v`.`visitor_id`))) union all select `gst`.`transaction_id` AS `transaction_id`,'giftshop' AS `transaction_type`,`v`.`visitor_id` AS `visitor_id`,concat(`v`.`first_name`,' ',`v`.`last_name`) AS `customer_name`,`gst`.`sale_date` AS `transaction_date`,`sp`.`name` AS `item_name`,`gst`.`quantity` AS `quantity`,(`gst`.`total_price` / nullif(`gst`.`quantity`,0)) AS `unit_price`,`gst`.`total_price` AS `total_amount` from ((`Gift_Shop_Transactions` `gst` join `Shop_Products` `sp` on((`gst`.`product_id` = `sp`.`product_id`))) left join `Visitors` `v` on((`gst`.`visitor_id` = `v`.`visitor_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 15:26:54
