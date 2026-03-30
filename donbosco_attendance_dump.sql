/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.5-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: donbosco_attendance
-- ------------------------------------------------------
-- Server version	11.8.5-MariaDB-4 from Debian

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `attendance_audit_log`
--

DROP TABLE IF EXISTS `attendance_audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_audit_log` (
  `audit_id` int(11) NOT NULL AUTO_INCREMENT,
  `record_id` int(11) NOT NULL,
  `changed_by` int(11) NOT NULL,
  `old_status` enum('PRESENT','ABSENT','OD','INFORMED_LEAVE') NOT NULL,
  `new_status` enum('PRESENT','ABSENT','OD','INFORMED_LEAVE') NOT NULL,
  `changed_at` datetime NOT NULL,
  PRIMARY KEY (`audit_id`),
  KEY `record_id` (`record_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `attendance_audit_log_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `attendance_records` (`record_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `attendance_audit_log_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_audit_log`
--

LOCK TABLES `attendance_audit_log` WRITE;
/*!40000 ALTER TABLE `attendance_audit_log` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `attendance_audit_log` VALUES
(1,1,4,'PRESENT','ABSENT','2026-03-13 10:18:22'),
(2,36,1,'OD','ABSENT','2026-03-16 05:38:09'),
(3,36,1,'ABSENT','PRESENT','2026-03-16 06:17:52'),
(7,35,4,'PRESENT','ABSENT','2026-03-16 10:17:13'),
(8,35,4,'ABSENT','PRESENT','2026-03-24 06:54:06');
/*!40000 ALTER TABLE `attendance_audit_log` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `record_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `class_type` enum('THEORY','LAB') NOT NULL DEFAULT 'THEORY',
  `date` date NOT NULL,
  `slot_id` int(11) NOT NULL,
  `status` enum('PRESENT','ABSENT','OD','INFORMED_LEAVE') NOT NULL,
  `od_reason` text DEFAULT NULL,
  `submitted_by` int(11) NOT NULL,
  `submitted_at` datetime NOT NULL,
  `is_locked` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`record_id`),
  UNIQUE KEY `attendance_records_student_id_date_slot_id_semester_id` (`student_id`,`date`,`slot_id`,`semester_id`),
  KEY `semester_id` (`semester_id`),
  KEY `subject_id` (`subject_id`),
  KEY `slot_id` (`slot_id`),
  KEY `submitted_by` (`submitted_by`),
  CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `attendance_records_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `attendance_records_ibfk_4` FOREIGN KEY (`slot_id`) REFERENCES `timetable_slots` (`slot_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `attendance_records_ibfk_5` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `attendance_records` VALUES
(1,5,3,11,'THEORY','2026-03-13',1,'PRESENT','',4,'2026-03-13 16:34:54',0),
(2,6,3,11,'THEORY','2026-03-13',1,'PRESENT','',4,'2026-03-13 16:34:54',0),
(3,5,3,11,'THEORY','2026-03-12',1,'PRESENT','None',4,'2026-03-15 12:49:36',1),
(7,6,3,11,'THEORY','2026-03-12',1,'ABSENT','uninformed_leave',4,'2026-03-15 12:49:36',1),
(23,5,3,11,'THEORY','2026-03-13',2,'PRESENT','None',4,'2026-03-13 16:35:02',1),
(24,6,3,11,'THEORY','2026-03-13',2,'PRESENT','None',4,'2026-03-13 16:35:02',1),
(25,5,3,11,'THEORY','2026-03-13',3,'PRESENT','None',4,'2026-03-13 16:35:10',1),
(26,6,3,11,'THEORY','2026-03-13',3,'PRESENT','None',4,'2026-03-13 16:35:10',1),
(27,5,3,9,'THEORY','2026-03-13',4,'PRESENT','None',4,'2026-03-13 16:35:20',1),
(28,6,3,9,'THEORY','2026-03-13',4,'PRESENT','None',4,'2026-03-13 16:35:20',1),
(29,5,3,9,'THEORY','2026-03-13',5,'ABSENT','uninformed_leave',4,'2026-03-13 16:35:30',1),
(30,6,3,9,'THEORY','2026-03-13',5,'PRESENT','None',4,'2026-03-13 16:35:30',1),
(33,10,25,NULL,'THEORY','2026-03-15',1,'OD','',24,'2026-03-15 17:42:18',0),
(34,5,3,11,'THEORY','2026-03-15',1,'ABSENT','Uninformed Leave',4,'2026-03-16 10:17:13',1),
(35,6,3,11,'THEORY','2026-03-15',1,'PRESENT','None',4,'2026-03-28 11:16:03',1),
(36,10,25,NULL,'THEORY','2026-03-16',1,'OD','',24,'2026-03-16 02:38:46',1),
(37,5,3,11,'THEORY','2026-03-16',1,'PRESENT','',4,'2026-03-16 02:39:44',1),
(38,6,3,11,'THEORY','2026-03-16',1,'PRESENT','',4,'2026-03-16 02:39:44',0),
(39,11,3,11,'THEORY','2026-03-16',1,'PRESENT','',4,'2026-03-16 02:39:44',0),
(40,12,3,11,'THEORY','2026-03-16',1,'PRESENT','',4,'2026-03-16 05:50:16',0),
(41,11,3,11,'THEORY','2026-03-15',1,'PRESENT','None',4,'2026-03-28 11:16:03',1),
(42,12,3,11,'THEORY','2026-03-15',1,'PRESENT','None',4,'2026-03-28 11:16:03',1),
(45,12,25,NULL,'THEORY','2026-03-16',1,'OD',NULL,24,'2026-03-16 06:28:16',1),
(54,10,25,NULL,'THEORY','2026-03-16',2,'OD',NULL,24,'2026-03-16 11:00:36',1),
(55,10,25,NULL,'THEORY','2026-03-16',3,'OD',NULL,24,'2026-03-16 11:00:36',1),
(56,10,25,NULL,'THEORY','2026-03-16',4,'OD',NULL,24,'2026-03-16 11:00:36',1),
(57,10,25,NULL,'THEORY','2026-03-16',5,'OD',NULL,24,'2026-03-16 11:00:36',1),
(58,5,3,11,'THEORY','2026-03-23',1,'ABSENT','Uninformed Leave',4,'2026-03-23 08:48:53',1),
(59,6,3,11,'THEORY','2026-03-23',1,'PRESENT','None',4,'2026-03-23 08:48:53',1),
(60,11,3,11,'THEORY','2026-03-23',1,'PRESENT','None',4,'2026-03-23 08:48:53',1),
(61,12,3,11,'THEORY','2026-03-23',1,'PRESENT','None',4,'2026-03-23 08:48:53',1),
(63,1,3,6,'THEORY','2026-03-28',1,'PRESENT','None',4,'2026-03-28 03:45:38',1),
(64,2,3,6,'THEORY','2026-03-28',1,'PRESENT','None',4,'2026-03-28 03:45:38',1),
(65,5,3,10,'THEORY','2026-03-28',1,'PRESENT','None',4,'2026-03-28 04:06:42',1),
(66,6,3,10,'THEORY','2026-03-28',1,'PRESENT','None',4,'2026-03-28 04:06:42',1),
(67,11,3,10,'THEORY','2026-03-28',1,'ABSENT','Uninformed Leave',4,'2026-03-28 04:06:42',1),
(68,12,3,10,'THEORY','2026-03-28',1,'PRESENT','None',4,'2026-03-28 04:06:42',1),
(69,1,3,6,'THEORY','2026-03-28',2,'PRESENT','None',4,'2026-03-28 11:15:38',1),
(70,2,3,6,'THEORY','2026-03-28',2,'PRESENT','None',4,'2026-03-28 11:15:38',1);
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `college_calendar`
--

DROP TABLE IF EXISTS `college_calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `college_calendar` (
  `calendar_id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `day_type` enum('WORKING','HOLIDAY','SATURDAY_ENABLED') NOT NULL,
  `holiday_name` varchar(100) DEFAULT NULL,
  `holiday_description` text DEFAULT NULL,
  `declared_by` int(11) NOT NULL,
  `declared_on` date NOT NULL,
  PRIMARY KEY (`calendar_id`),
  UNIQUE KEY `date` (`date`),
  KEY `declared_by` (`declared_by`),
  CONSTRAINT `college_calendar_ibfk_1` FOREIGN KEY (`declared_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `college_calendar`
--

LOCK TABLES `college_calendar` WRITE;
/*!40000 ALTER TABLE `college_calendar` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `college_calendar` VALUES
(7,'2026-03-22','HOLIDAY','testing','testng\n',1,'2026-03-19');
/*!40000 ALTER TABLE `college_calendar` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `lab_batches`
--

DROP TABLE IF EXISTS `lab_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_batches` (
  `lab_batch_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `year` tinyint(4) NOT NULL,
  `capacity` int(11) NOT NULL,
  `student_count` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`lab_batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_batches`
--

LOCK TABLES `lab_batches` WRITE;
/*!40000 ALTER TABLE `lab_batches` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `lab_batches` VALUES
(1,'(year 1 ) A',1,30,2),
(2,'(year 1 ) B',1,30,1),
(3,'(year 1 ) C',1,30,1),
(4,'(year 1 ) D',1,30,1),
(5,'(year 2 ) A',2,30,3),
(6,'(year 2 ) B',2,30,1),
(7,'(year 2 ) C',2,30,0),
(8,'(year 2 ) D',2,30,0),
(9,'(year 3 ) A',3,30,2),
(10,'(year 3 ) B',3,30,0),
(11,'(year 3 ) C',3,30,1),
(12,'(year 3 ) D',3,30,0),
(13,'(year 4 ) A',4,30,1),
(14,'(year 4 ) B',4,30,0),
(15,'(year 4 ) C',4,30,0),
(16,'(year 4 ) D',4,30,0);
/*!40000 ALTER TABLE `lab_batches` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `notification_log`
--

DROP TABLE IF EXISTS `notification_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `sent_to_phone` varchar(15) NOT NULL,
  `trigger_type` enum('PER_PERIOD','MONTHLY_SUMMARY') NOT NULL,
  `trigger_date` date NOT NULL,
  `attendance_percentage` decimal(5,2) DEFAULT NULL,
  `message_sent` text NOT NULL,
  `sent_at` datetime NOT NULL,
  `status` enum('SENT','FAILED') NOT NULL,
  PRIMARY KEY (`log_id`),
  KEY `student_id` (`student_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `notification_log_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `notification_log_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_log`
--

LOCK TABLES `notification_log` WRITE;
/*!40000 ALTER TABLE `notification_log` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `notification_log` VALUES
(1,5,3,'9944711288','PER_PERIOD','2026-03-23',NULL,'Dear Parent, your ward Ezhil Arasan P () was marked ABSENT for Period 1 on 23 Mar 2026. Please contact the college if needed. - Don Bosco College','2026-03-23 08:48:55','SENT'),
(2,11,3,'9922711277','PER_PERIOD','2026-03-28',NULL,'Dear Parent, your ward test () was marked ABSENT for Period 1 on 28 Mar 2026. Please contact the college if needed. - Don Bosco College','2026-03-28 04:06:44','FAILED');
/*!40000 ALTER TABLE `notification_log` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `semesters`
--

DROP TABLE IF EXISTS `semesters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `semesters` (
  `semester_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `academic_year` tinyint(4) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`semester_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semesters`
--

LOCK TABLES `semesters` WRITE;
/*!40000 ALTER TABLE `semesters` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `semesters` VALUES
(1,'Year 1 ODD',1,0),
(2,'Year 1 EVEN',1,0),
(3,'Year 2 ODD',2,1),
(4,'Year 2 EVEN',2,0),
(5,'Year 3 ODD',3,0),
(6,'Year 3 EVEN',3,0),
(7,'Year 4 ODD',4,0),
(8,'Year 4 EVEN',4,0),
(9,'Year 1 ODD',1,1),
(10,'Year 1 EVEN',1,0),
(11,'Year 2 ODD',2,0),
(12,'Year 2 EVEN',2,0),
(13,'Year 3 ODD',3,0),
(14,'Year 3 EVEN',3,0),
(15,'Year 4 ODD',4,0),
(16,'Year 4 EVEN',4,0),
(17,'Year 1 ODD',1,1),
(18,'Year 1 EVEN',1,0),
(19,'Year 2 ODD',2,0),
(20,'Year 2 EVEN',2,0),
(21,'Year 3 ODD',3,0),
(22,'Year 3 EVEN',3,0),
(23,'Year 4 ODD',4,0),
(24,'Year 4 EVEN',4,0),
(25,'Year 1 ODD',1,1),
(26,'Year 1 EVEN',1,0),
(27,'Year 2 ODD',2,0),
(28,'Year 2 EVEN',2,0),
(29,'Year 3 ODD',3,0),
(30,'Year 3 EVEN',3,0),
(31,'Year 4 ODD',4,0),
(32,'Year 4 EVEN',4,0);
/*!40000 ALTER TABLE `semesters` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `student_subject_enrollment`
--

DROP TABLE IF EXISTS `student_subject_enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_subject_enrollment` (
  `enrollment_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  PRIMARY KEY (`enrollment_id`),
  UNIQUE KEY `student_subject_enrollment_student_id_subject_id_semester_id` (`student_id`,`subject_id`,`semester_id`),
  KEY `subject_id` (`subject_id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `student_subject_enrollment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `student_subject_enrollment_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `student_subject_enrollment_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_subject_enrollment`
--

LOCK TABLES `student_subject_enrollment` WRITE;
/*!40000 ALTER TABLE `student_subject_enrollment` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `student_subject_enrollment` VALUES
(1,1,1,3),
(2,1,2,3),
(3,1,3,3),
(4,1,4,3),
(5,2,1,3),
(6,2,2,3),
(7,2,3,3),
(8,2,4,3),
(9,3,1,3),
(10,3,2,3),
(11,3,3,3),
(12,3,4,3),
(13,4,1,3),
(14,4,2,3),
(15,4,3,3),
(16,4,4,3),
(17,5,1,3),
(18,5,2,3),
(19,5,3,3),
(20,5,4,3),
(21,6,1,3),
(22,6,2,3),
(23,6,3,3),
(24,6,4,3),
(25,7,1,3),
(26,7,2,3),
(27,7,3,3),
(28,7,4,3),
(29,8,1,3),
(30,8,2,3),
(31,8,3,3),
(32,8,4,3),
(33,9,1,3),
(34,9,2,3),
(35,9,3,3),
(36,9,4,3),
(37,10,1,3),
(38,10,2,3),
(39,10,3,3),
(40,10,4,3);
/*!40000 ALTER TABLE `student_subject_enrollment` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `roll_number` varchar(20) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `address` text DEFAULT NULL,
  `parent_phone` varchar(15) NOT NULL,
  `current_year` tinyint(4) NOT NULL,
  `theory_batch_id` int(11) NOT NULL,
  `lab_batch_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `roll_number` (`roll_number`),
  KEY `theory_batch_id` (`theory_batch_id`),
  KEY `lab_batch_id` (`lab_batch_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`theory_batch_id`) REFERENCES `theory_batches` (`theory_batch_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `students_ibfk_2` FOREIGN KEY (`lab_batch_id`) REFERENCES `lab_batches` (`lab_batch_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `students` VALUES
(1,'Antony Raj S','23AG001',NULL,NULL,NULL,NULL,NULL,'9000100001',1,1,1,'2026-03-13 05:39:59','2026-03-13 05:39:59'),
(2,'Buvana M','23AG002',NULL,NULL,NULL,NULL,NULL,'9000100002',1,1,2,'2026-03-13 05:39:59','2026-03-13 05:39:59'),
(3,'Charles V','23AG003',NULL,NULL,NULL,NULL,NULL,'9000100003',1,2,3,'2026-03-13 05:39:59','2026-03-13 05:39:59'),
(4,'Divya Bharati K','23AG004',NULL,NULL,NULL,NULL,NULL,'9000100004',1,2,4,'2026-03-13 05:39:59','2026-03-13 05:39:59'),
(5,'Ezhil Arasan P','22AG010',NULL,NULL,NULL,NULL,NULL,'9944711288',2,3,5,'2026-03-13 05:39:59','2026-03-23 14:18:40'),
(6,'Fathima Beevi S','22AG011',NULL,NULL,NULL,NULL,NULL,'9000200002',2,3,6,'2026-03-13 05:39:59','2026-03-13 05:39:59'),
(7,'Ganesh Ram M','21AG050',NULL,NULL,NULL,NULL,NULL,'9000300001',3,5,9,'2026-03-13 05:39:59','2026-03-13 05:39:59'),
(8,'Hema Malini R','21AG051',NULL,NULL,NULL,NULL,NULL,'9000300002',3,6,11,'2026-03-13 05:39:59','2026-03-13 05:39:59'),
(9,'Inba Tamilan','20AG101',NULL,NULL,NULL,NULL,NULL,'9000400001',4,7,13,'2026-03-13 05:39:59','2026-03-13 05:39:59'),
(10,'Aathi','22AG012','9944711288','test@gail.com','2026-03-10','MALE','nothni','9112334455',2,1,1,'2026-03-13 16:33:13','2026-03-13 16:33:13'),
(11,'test','22AG013','9944811288','test@gmail.com','2026-03-11','MALE','testing','9922711277',2,3,5,'2026-03-16 02:37:40','2026-03-16 02:37:40'),
(12,'aat','551234','8855443322','aath@gc.com','2026-03-01','MALE','','9944722331',2,3,5,'2026-03-16 05:45:14','2026-03-29 16:13:28'),
(13,'Aasaimain A','511523205002','9597833971','msaasai493@gmail.com','2005-03-03','MALE','Dubai kuruku santhu,dubai main road','7639505052',3,5,9,'2026-03-28 08:15:56','2026-03-28 08:15:56');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `subject_id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `subject_year` tinyint(4) NOT NULL,
  `subject_description` text DEFAULT NULL,
  `credits` int(11) NOT NULL,
  `semester` enum('ODD','EVEN') NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`subject_id`),
  UNIQUE KEY `subject_code` (`subject_code`),
  UNIQUE KEY `subjects_subject_name_subject_year_semester` (`subject_name`,`subject_year`,`semester`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `subjects` VALUES
(6,'AGR 101','Fundamentals of Agronomy',1,'testing',4,'ODD','2026-03-13 05:39:59','2026-03-28 10:35:18'),
(7,'HOR 111','Fundamentals of Horticulture',1,NULL,2,'ODD','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(8,'SAC 101','Fundamentals of Soil Science',1,NULL,3,'EVEN','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(9,'GPB 201','Fundamentals of Genetics',2,NULL,3,'ODD','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(10,'PAT 201','Fundamentals of Plant Pathology',2,NULL,3,'ODD','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(11,'AET 201','Fundamentals of Entomology',2,NULL,3,'ODD','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(12,'AGR 301','Crop Production - I',3,NULL,3,'ODD','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(13,'ECO 301','Agricultural Marketing',3,NULL,2,'ODD','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(14,'RAWE 401','Rural Agricultural Work Experience',4,NULL,10,'ODD','2026-03-13 05:39:59','2026-03-13 05:39:59');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `theory_batches`
--

DROP TABLE IF EXISTS `theory_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `theory_batches` (
  `theory_batch_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `year` tinyint(4) NOT NULL,
  `capacity` int(11) NOT NULL,
  `student_count` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`theory_batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `theory_batches`
--

LOCK TABLES `theory_batches` WRITE;
/*!40000 ALTER TABLE `theory_batches` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `theory_batches` VALUES
(1,'(year 1 ) A',1,60,3),
(2,'(year 1 ) B',1,60,2),
(3,'(year 2 ) A',2,60,4),
(4,'(year 2 ) B',2,60,0),
(5,'(year 3 ) A',3,60,2),
(6,'(year 3 ) B',3,60,1),
(7,'(year 4 ) A',4,60,1),
(8,'(year 4 ) B',4,60,0);
/*!40000 ALTER TABLE `theory_batches` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `timetable_slots`
--

DROP TABLE IF EXISTS `timetable_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable_slots` (
  `slot_id` int(11) NOT NULL AUTO_INCREMENT,
  `slot_number` tinyint(4) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `slot_type` enum('THEORY','LAB','OTHER') NOT NULL,
  PRIMARY KEY (`slot_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_slots`
--

LOCK TABLES `timetable_slots` WRITE;
/*!40000 ALTER TABLE `timetable_slots` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `timetable_slots` VALUES
(1,1,'07:30:00','10:00:00','LAB'),
(2,2,'10:30:00','11:30:00','THEORY'),
(3,3,'11:30:00','12:30:00','THEORY'),
(4,4,'13:30:00','14:30:00','THEORY'),
(5,5,'14:45:00','17:15:00','LAB');
/*!40000 ALTER TABLE `timetable_slots` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `role` enum('PRINCIPAL','YEAR_COORDINATOR','SUBJECT_STAFF') NOT NULL,
  `managed_year` tinyint(4) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
(1,'Principal Admin','principal@donbosco.edu','9000000001','PRINCIPAL',NULL,'$2b$10$zvOMakeve1eNF705lxMZZuidi0wnd.uWXaOXMqyF7H8v0FZzUebHG','2026-03-11 13:34:54','2026-03-11 13:34:54'),
(3,'John Doe (Staff)','staff1@donbosco.edu','9000000003','SUBJECT_STAFF',NULL,'$2b$10$zvOMakeve1eNF705lxMZZuidi0wnd.uWXaOXMqyF7H8v0FZzUebHG','2026-03-11 13:34:54','2026-03-11 13:34:54'),
(4,'Jane Smith (Staff)','staff2@donbosco.edu','9000000004','SUBJECT_STAFF',NULL,'$2b$10$zvOMakeve1eNF705lxMZZuidi0wnd.uWXaOXMqyF7H8v0FZzUebHG','2026-03-11 13:34:54','2026-03-11 13:34:54'),
(17,'Dr. Arulappan S','yc1@dbca.edu','9840123456','YEAR_COORDINATOR',1,'$2b$10$PaRXr7ih8szbM2zTw4qHE.V33GxUVFNfC5XtagcZJIEQb5IMZF8VG','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(19,'Ms. Catherine R','yc3@dbca.edu','9840123458','YEAR_COORDINATOR',3,'$2b$10$PaRXr7ih8szbM2zTw4qHE.V33GxUVFNfC5XtagcZJIEQb5IMZF8VG','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(20,'Mr. Sebastian G','yc4@dbca.edu','9840123459','YEAR_COORDINATOR',4,'$2b$10$PaRXr7ih8szbM2zTw4qHE.V33GxUVFNfC5XtagcZJIEQb5IMZF8VG','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(21,'Dr. Prem Kumar','staff1@dbca.edu','9840111111','SUBJECT_STAFF',NULL,'$2b$10$PaRXr7ih8szbM2zTw4qHE.V33GxUVFNfC5XtagcZJIEQb5IMZF8VG','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(22,'Ms. Anitha Mary','staff2@dbca.edu','9840222222','SUBJECT_STAFF',NULL,'$2b$10$PaRXr7ih8szbM2zTw4qHE.V33GxUVFNfC5XtagcZJIEQb5IMZF8VG','2026-03-13 05:39:59','2026-03-13 05:39:59'),
(24,'Ath','yc@gmail.com','9944711288','YEAR_COORDINATOR',2,'$2b$10$r7NEaRG3sks9QdcTd7bKbu7jApG7ar.VT3QCDyqxonE8ItZIfaK4y','2026-03-13 16:31:46','2026-03-28 10:32:30'),
(25,'testing','test@gmail.com','9092634117','SUBJECT_STAFF',NULL,'$2b$10$Ep2bHQN0uuttwe6N22JG/OG4cri709th/fR4SbnmEiqCI6a/7gCce','2026-03-23 01:47:30','2026-03-23 01:47:30');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-03-30 20:53:56
