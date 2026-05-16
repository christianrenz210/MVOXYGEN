-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 02, 2026 at 07:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mv_oxygen_trading`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `rental_request_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'info',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `user_id`, `customer_id`, `rental_request_id`, `action`, `description`, `type`, `created_at`, `updated_at`) VALUES
(3, 32, NULL, NULL, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Medical Oxygen', 'info', '2026-04-11 02:06:00', '2026-04-11 02:06:38'),
(4, 32, NULL, NULL, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Tank', 'info', '2026-04-12 23:28:52', '2026-04-17 01:37:52'),
(5, 32, NULL, NULL, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Tank', 'info', '2026-04-12 23:28:53', '2026-04-12 23:28:53'),
(21, 20, NULL, NULL, 'rental_rejected', 'Admin Admin User rejected rental request for Medical Oxygen from Test User. Reason: mali purpose', 'error', '2026-04-17 22:35:49', '2026-04-17 22:35:49'),
(22, 32, NULL, NULL, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Medical Oxygen', 'info', '2026-04-17 23:13:31', '2026-04-17 23:13:31'),
(23, 20, NULL, NULL, 'rental_completed', 'Admin Admin User marked rental request for Medical Oxygen from Test User as completed', 'success', '2026-04-18 00:09:46', '2026-04-18 00:09:46'),
(24, 20, NULL, NULL, 'rental_approved', 'Admin Admin User approved rental request for Medical Oxygen from Test User', 'success', '2026-04-18 00:10:00', '2026-04-18 00:10:00'),
(25, 20, NULL, NULL, 'rental_approved', 'Admin Admin User approved rental request for Medical Oxygen from Christian Renz Ledesma', 'success', '2026-04-18 00:11:33', '2026-04-18 00:11:33'),
(26, 32, NULL, NULL, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Medical Oxygen', 'info', '2026-04-18 01:41:30', '2026-04-18 01:41:30'),
(27, 32, NULL, NULL, 'refill_request', 'User Christian Renz Ledesma submitted a refill request for Medical Oxygen', 'info', '2026-04-18 01:42:41', '2026-04-18 01:42:41'),
(28, 20, NULL, NULL, 'rental_approved', 'Admin Admin User approved rental request for Medical Oxygen from Christian Renz Ledesma', 'success', '2026-04-18 01:47:42', '2026-04-18 01:47:42'),
(29, 32, NULL, NULL, 'refill_request', 'User Christian Renz Ledesma submitted a refill request for Medical Oxygen', 'info', '2026-04-18 03:40:45', '2026-04-18 03:40:45'),
(30, 20, NULL, NULL, 'refill_approved', 'Admin Admin User approved refill request for Medical Oxygen from Christian Renz Ledesma', 'success', '2026-04-18 05:31:33', '2026-04-18 05:31:33'),
(31, 20, NULL, NULL, 'rental_rejected', 'Admin Admin User rejected rental request for Medical Oxygen from Test User. Reason: sdhfkjsdf', 'error', '2026-04-18 05:42:02', '2026-04-18 05:42:02'),
(32, 20, NULL, NULL, 'rental_rejected', 'Admin Admin User rejected rental request for Medical Oxygen from Test User. Reason: sdfsd', 'error', '2026-04-18 05:42:08', '2026-04-18 05:42:08'),
(33, 20, 19, 50, 'refill_approved', 'Admin Admin approved refill request for Argon Small from Christian Renz Ledesma', 'success', '2026-04-19 01:37:12', '2026-04-19 01:37:12'),
(34, 20, 19, NULL, 'rental_rejected', 'Admin Admin rejected rental request for Medical Oxygen from Christian Renz Ledesma. Reason: fdgdfg', 'error', '2026-04-19 01:41:25', '2026-04-19 01:41:25'),
(35, 20, 19, 47, 'rental_approved', 'Admin Admin approved rental request for Industrial Oxygen from Christian Renz Ledesma', 'success', '2026-04-19 01:41:31', '2026-04-19 01:41:31'),
(36, 32, 19, 51, 'refill_request', 'User Christian Renz Ledesma submitted a refill customer oxygen request for Argon Small', 'info', '2026-04-19 04:52:55', '2026-04-19 04:52:55'),
(37, 32, 19, 52, 'refill_request', 'User Christian Renz Ledesma submitted a refill customer oxygen request for Argon Small', 'info', '2026-04-19 04:55:52', '2026-04-19 04:55:52'),
(38, 20, 19, 53, 'refill_created', 'Admin Admin created a refill oxygen customer request for Argon Small for Christian Renz Ledesma', 'info', '2026-04-20 20:49:02', '2026-04-20 20:49:02'),
(39, 20, 19, 53, 'refill_approved', 'Admin Admin approved refill oxygen customer request for Argon Small from Christian Renz Ledesma', 'success', '2026-04-20 20:49:17', '2026-04-20 20:49:17'),
(40, 32, 19, 54, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small', 'info', '2026-04-21 01:50:54', '2026-04-21 01:50:54'),
(41, 20, 19, 54, 'rental_approved', 'Admin Admin approved rental request for Argon Small from Christian Renz Ledesma', 'success', '2026-04-21 01:55:22', '2026-04-21 01:55:22'),
(42, 20, 19, 52, 'refill_approved', 'Admin Admin approved refill oxygen customer request for Argon Small from Christian Renz Ledesma', 'success', '2026-04-22 18:37:39', '2026-04-22 18:37:39'),
(43, 32, 19, 55, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small, Argon Small', 'info', '2026-04-22 18:39:02', '2026-04-22 18:39:02'),
(44, 20, 19, 55, 'rental_approved', 'Admin Admin approved rental request for Argon Small, Argon Small from Christian Renz Ledesma', 'success', '2026-04-22 18:39:23', '2026-04-22 18:39:23'),
(45, 32, 19, 56, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small, Argon Big', 'info', '2026-04-22 21:47:00', '2026-04-22 21:47:00'),
(46, 32, 19, 57, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Big', 'info', '2026-04-22 22:06:16', '2026-04-22 22:06:16'),
(47, 20, 19, 57, 'rental_approved', 'Admin Admin approved rental request for Argon Big from Christian Renz Ledesma', 'success', '2026-04-22 22:07:06', '2026-04-22 22:07:06'),
(48, 32, 19, 58, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small', 'info', '2026-04-22 22:32:49', '2026-04-22 22:32:49'),
(49, 20, 19, 58, 'rental_approved', 'Admin Admin approved rental request for Argon Small from Christian Renz Ledesma', 'success', '2026-04-22 22:33:20', '2026-04-22 22:33:20'),
(50, 35, 20, 59, 'rental_request', 'User Ronald John submitted a rental request for Argon Big, Argon Small', 'info', '2026-04-23 01:16:55', '2026-04-23 01:16:55'),
(51, 20, 20, 59, 'rental_approved', 'Admin Admin approved rental request for Argon Big, Argon Small from Ronald John', 'success', '2026-04-23 01:23:09', '2026-04-23 01:23:09'),
(52, 20, 19, 60, 'refill_created', 'Admin Admin created a refill oxygen customer request for Argon Small for Christian Renz Ledesma', 'info', '2026-04-23 01:26:09', '2026-04-23 01:26:09'),
(53, 20, 19, 60, 'rental_approved', 'Admin Admin approved rental request for Argon Small from Christian Renz Ledesma', 'success', '2026-04-23 01:26:45', '2026-04-23 01:26:45'),
(54, 32, 19, 61, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Nitro', 'info', '2026-04-27 22:29:40', '2026-04-27 22:29:40'),
(55, 20, 19, 61, 'rental_approved', 'Admin Admin approved rental request for Nitro from Christian Renz Ledesma', 'success', '2026-04-27 22:30:08', '2026-04-27 22:30:08'),
(56, 32, 19, 62, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small', 'info', '2026-04-27 23:21:36', '2026-04-27 23:21:36'),
(57, 32, 19, 63, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small', 'info', '2026-04-28 07:44:56', '2026-04-28 07:44:56'),
(58, 32, 19, 64, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small', 'info', '2026-04-28 07:48:07', '2026-04-28 07:48:07'),
(59, 32, 19, 65, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small', 'info', '2026-04-28 07:48:12', '2026-04-28 07:48:12'),
(60, 32, 19, 66, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small', 'info', '2026-04-28 08:05:58', '2026-04-28 08:05:58'),
(61, 32, 19, 67, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small', 'info', '2026-04-28 08:05:59', '2026-04-28 08:05:59'),
(62, 32, 19, 68, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small', 'info', '2026-04-28 08:06:00', '2026-04-28 08:06:00'),
(63, 32, 19, 69, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Nitro', 'info', '2026-04-28 08:14:31', '2026-04-28 08:14:31'),
(64, 32, 19, 70, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small', 'info', '2026-04-28 08:17:27', '2026-04-28 08:17:27'),
(65, 32, 19, 71, 'rental_request', 'User Christian Renz Ledesma submitted a rental request for Argon Small', 'info', '2026-04-28 09:03:20', '2026-04-28 09:03:20'),
(66, 20, 19, 61, 'rental_completed', 'Admin Admin marked rental request for Nitro from Christian Renz Ledesma as completed', 'success', '2026-04-28 09:14:19', '2026-04-28 09:14:19'),
(67, 20, 19, 71, 'rental_approved', 'Admin Admin approved rental request for Argon Small from Christian Renz Ledesma', 'success', '2026-04-28 09:34:49', '2026-04-28 09:34:49'),
(68, 20, 19, 70, 'rental_approved', 'Admin Admin approved rental request for Argon Small from Christian Renz Ledesma', 'success', '2026-04-28 09:35:20', '2026-04-28 09:35:20'),
(69, 20, 19, 69, 'rental_approved', 'Admin Admin approved rental request for Nitro from Christian Renz Ledesma', 'success', '2026-04-30 05:47:59', '2026-04-30 05:47:59'),
(70, 20, 19, 68, 'rental_approved', 'Admin Admin approved rental request for Argon Small from Christian Renz Ledesma', 'success', '2026-04-30 05:51:37', '2026-04-30 05:51:37'),
(71, 20, 19, 67, 'rental_approved', 'Admin Admin approved rental request for Argon Small from Christian Renz Ledesma', 'success', '2026-04-30 05:59:38', '2026-04-30 05:59:38'),
(72, 20, 19, 66, 'rental_approved', 'Admin Admin approved rental request for Argon Small from Christian Renz Ledesma', 'success', '2026-04-30 06:06:14', '2026-04-30 06:06:14'),
(73, 38, 21, 72, 'rental_request', 'User Renz submitted a rental request for Argon Big', 'info', '2026-05-01 01:16:02', '2026-05-01 01:16:02');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('mv-oxygen-trading-cache-admin@mvoxygen.com|127.0.0.1', 'i:1;', 1777741056),
('mv-oxygen-trading-cache-admin@mvoxygen.com|127.0.0.1:timer', 'i:1777741056;', 1777741056),
('mv-oxygen-trading-cache-john@example.com|127.0.0.1', 'i:1;', 1777741269),
('mv-oxygen-trading-cache-john@example.com|127.0.0.1:timer', 'i:1777741269;', 1777741269),
('mv-oxygen-trading-cache-otp_', 's:6:\"661785\";', 1777741905),
('mv-oxygen-trading-cache-renzledesma76@gmail.com|127.0.0.1', 'i:2;', 1777741292),
('mv-oxygen-trading-cache-renzledesma76@gmail.com|127.0.0.1:timer', 'i:1777741292;', 1777741292),
('mv-oxygen-trading-cache-viupremium767@gmail.com|127.0.0.1', 'i:1;', 1777741471),
('mv-oxygen-trading-cache-viupremium767@gmail.com|127.0.0.1:timer', 'i:1777741471;', 1777741471);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cart_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `description`, `image`, `order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Electronics', 'electronics', 'Electronic devices and gadgets', NULL, 0, 1, '2026-04-10 06:17:38', '2026-04-10 06:17:38'),
(2, NULL, 'Clothing', 'clothing', 'Fashion and apparel', NULL, 0, 1, '2026-04-10 06:17:38', '2026-04-10 06:17:38'),
(3, NULL, 'Books', 'books', 'Books and publications', NULL, 0, 1, '2026-04-10 06:17:38', '2026-04-10 06:17:38'),
(4, NULL, 'Home & Garden', 'home-garden', 'Home improvement and gardening', NULL, 0, 1, '2026-04-10 06:17:38', '2026-04-10 06:17:38'),
(5, NULL, 'Sports', 'sports', 'Sports equipment and gear', NULL, 0, 1, '2026-04-10 06:17:39', '2026-04-10 06:17:39'),
(6, 1, 'Smartphones', 'smartphones', 'Mobile phones', NULL, 0, 1, '2026-04-10 06:17:39', '2026-04-10 06:17:39'),
(7, 1, 'Laptops', 'laptops', 'Portable computers', NULL, 0, 1, '2026-04-10 06:17:39', '2026-04-10 06:17:39'),
(8, 2, 'Men\'s Clothing', 'mens-clothing', 'Men\'s fashion', NULL, 0, 1, '2026-04-10 06:17:39', '2026-04-10 06:17:39'),
(9, 2, 'Women\'s Clothing', 'womens-clothing', 'Women\'s fashion', NULL, 0, 1, '2026-04-10 06:17:39', '2026-04-10 06:17:39');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('fixed','percentage') NOT NULL DEFAULT 'fixed',
  `value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `valid_from` datetime DEFAULT NULL,
  `valid_until` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `type`, `value`, `min_order_amount`, `max_discount`, `usage_limit`, `used_count`, `valid_from`, `valid_until`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 'percentage', 10.00, 50.00, NULL, 100, 0, '2026-04-10 14:17:39', '2026-05-10 14:17:39', 1, '2026-04-10 06:17:39', '2026-04-10 06:17:39'),
(2, 'SAVE20', 'fixed', 20.00, 100.00, NULL, 50, 0, '2026-04-10 14:17:39', '2026-06-10 14:17:39', 1, '2026-04-10 06:17:39', '2026-04-10 06:17:39');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
  `total_rentals` int(11) NOT NULL DEFAULT 0,
  `join_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `contact_number`, `address`, `profile_image`, `status`, `total_rentals`, `join_date`, `created_at`, `updated_at`) VALUES
(18, 'Admin', 'N/A', 'N/A', NULL, 'active', 0, '2026-04-18', '2026-04-18 06:21:27', '2026-04-18 06:21:27'),
(19, 'Christian Renz Ledesma', '09914458507', 'N/A', NULL, 'active', 0, '2026-04-18', '2026-04-18 06:21:27', '2026-04-30 05:02:26'),
(20, 'Ronald John', '09914458507', 'Pickup', NULL, 'active', 0, '2026-04-23', '2026-04-23 01:16:55', '2026-04-30 00:05:28'),
(21, 'Renz', '09395478320', 'PWS 049, Rizal Street, Poblacion West, General Tinio, Nueva Ecija, (Near: Near at west central school)', NULL, 'active', 0, '2026-05-01', '2026-05-01 01:16:01', '2026-05-01 01:16:01');

-- --------------------------------------------------------

--
-- Table structure for table `deposits`
--

CREATE TABLE `deposits` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rental_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL DEFAULT 'cash',
  `reference_number` varchar(255) DEFAULT NULL,
  `status` enum('pending','paid','refunded') NOT NULL DEFAULT 'pending',
  `payment_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `deposits`
--

INSERT INTO `deposits` (`id`, `rental_id`, `customer_id`, `amount`, `payment_method`, `reference_number`, `status`, `payment_date`, `notes`, `created_at`, `updated_at`) VALUES
(3, 22, 20, 1100.00, 'cash', NULL, 'paid', '2026-04-23', NULL, '2026-04-23 01:23:09', '2026-04-23 01:23:09'),
(4, 24, 19, 1000.00, 'cash', NULL, 'paid', '2026-04-28', NULL, '2026-04-27 22:30:08', '2026-04-27 22:30:08'),
(5, 25, 19, 999.00, 'cash', NULL, 'paid', '2026-04-30', NULL, '2026-04-30 00:06:10', '2026-04-30 00:07:28'),
(6, 27, 19, 999.00, 'cash', NULL, 'paid', '2026-04-30', NULL, '2026-04-30 05:47:59', '2026-04-30 05:47:59');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenances`
--

CREATE TABLE `maintenances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tank_type` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `condition` varchar(255) NOT NULL,
  `valve` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `maintenances`
--

INSERT INTO `maintenances` (`id`, `tank_type`, `quantity`, `condition`, `valve`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Argon Small', 1, 'Poor', 'Broken', 'pending', '2026-04-21 00:39:26', '2026-04-21 00:39:26'),
(2, 'Argon Big', 1, 'Poor', 'Broken', 'pending', '2026-04-21 10:33:35', '2026-04-21 10:33:35'),
(3, 'Nitro', 1, 'Damaged', 'Leaking', 'done', '2026-04-22 21:29:34', '2026-04-29 02:40:57');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000001_create_cache_table', 1),
(2, '0001_01_01_000002_create_jobs_table', 1),
(3, '2024_01_01_000001_create_users_table', 1),
(4, '2024_01_01_000002_create_categories_table', 1),
(5, '2024_01_01_000003_create_products_table', 1),
(6, '2024_01_01_000004_create_product_variants_table', 1),
(7, '2024_01_01_000005_create_orders_table', 1),
(8, '2024_01_01_000006_create_order_items_table', 1),
(9, '2024_01_01_000007_create_reviews_table', 1),
(10, '2024_01_01_000008_create_carts_table', 1),
(11, '2024_01_01_000009_create_cart_items_table', 1),
(12, '2024_01_01_000010_create_wishlists_table', 1),
(13, '2024_01_01_000011_create_coupons_table', 1),
(14, '2024_01_01_000012_create_password_reset_tokens_table', 1),
(15, '2024_01_01_000013_create_sessions_table', 1),
(16, '2026_04_09_093008_create_customers_table', 1),
(17, '2026_04_09_095909_create_transactions_table', 1),
(18, '2026_04_10_000000_drop_phone_from_users_table', 1),
(19, '2026_04_08_125737_add_phone_to_users_table', 2),
(20, '2026_04_11_050144_create_rental_requests_table', 3),
(21, '2026_04_11_050200_create_rentals_table', 4),
(22, '2026_04_11_051238_add_soon_status_to_rental_requests_table', 5),
(23, '2026_04_11_051932_remove_soon_status_from_rental_requests_table', 6),
(24, '2026_04_11_151747_create_notifications_table', 7),
(25, '2026_04_16_000000_modify_role_column_in_users_table', 8),
(26, '2026_04_17_000000_add_geolocation_to_rentals_table', 9),
(27, '2026_04_17_120000_add_barangay_to_rental_requests', 10),
(28, '2026_04_17_130000_fix_rental_status_enum', 11),
(29, '2026_04_17_140000_fix_rental_status_final', 12),
(30, '2026_04_17_150000_recreate_status_column', 13),
(31, '2026_04_17_160000_add_canceled_status', 14),
(32, '2026_04_17_170000_direct_enum_fix', 15),
(33, '2026_04_17_100934_add_request_type_to_rental_requests_table', 16),
(34, '2026_04_09_093343_add_fields_to_customers_table', 1),
(35, '2026_04_18_000000_add_archived_status_to_customers_table', 17),
(36, '2026_04_18_000001_create_activities_table', 18),
(37, '2026_04_19_000000_add_tracking_number_to_rental_requests_table', 19),
(38, '2026_04_19_000001_backfill_transactions_for_approved_rentals', 19),
(39, '2026_04_21_000001_create_otps_table', 20),
(40, '2026_04_21_000002_create_suppliers_table', 21),
(41, '2026_04_21_000003_add_supplier_id_to_rentals_table', 21),
(42, '2026_04_21_000004_create_deposits_table', 22),
(45, '2026_04_21_000005_add_deposit_fields_to_rentals_table', 23),
(46, '2026_04_21_000006_create_tanks_table', 23),
(47, '2026_04_21_000007_add_tank_id_to_tanks_table', 23),
(48, '2026_04_21_000008_create_maintenances_table', 24),
(49, '2026_04_21_095945_add_deposit_type_to_rentals_table', 25),
(50, '2026_04_21_172938_add_profile_image_to_users_table', 26),
(51, '2026_04_21_184109_add_status_to_users_table', 27),
(52, '2026_04_23_021701_add_price_to_tanks_table', 28),
(53, '2026_04_23_023113_add_assigned_tank_id_to_rental_requests_table', 29),
(54, '2026_04_23_035640_add_image_to_tanks_table', 30),
(55, '2026_04_28_145135_add_supplier_id_to_orders_table', 31),
(56, '2026_04_28_145526_modify_order_items_for_tanks', 31),
(57, '2026_04_29_013000_add_priority_to_rental_requests_table', 32),
(58, '2026_04_29_014000_make_dates_nullable_in_rental_requests', 32),
(59, '2026_04_29_103723_add_status_to_maintenances_table', 32),
(60, '2026_04_29_115712_add_user_id_to_suppliers_table', 33),
(61, '2026_04_29_115833_create_supplier_orders_table', 33),
(62, '2026_04_29_144610_add_fixed_prices_to_suppliers_table', 34),
(63, '2026_04_29_145529_add_fixed_prices_to_suppliers_table_v2', 34),
(64, '2026_05_01_230000_create_supplier_products_table', 35),
(65, '2026_05_02_000001_create_purchase_orders_table', 36),
(66, '2026_05_02_170000_update_purchase_orders_status_enum', 37),
(67, '2026_05_02_180000_add_payment_method_to_purchase_orders', 38),
(68, '2026_05_02_110318_create_sales_table', 39),
(70, '2026_05_02_151636_add_profile_image_to_customers_table', 40),
(71, '2026_05_02_152405_add_profile_image_to_customers_table', 40);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `link`, `read`, `read_at`, `created_at`, `updated_at`) VALUES
(47, 20, 'info', 'New Rental Request', 'New rental request for Argon Big from Christian Renz Ledesma', '/rentals/57', 1, '2026-04-22 22:56:28', '2026-04-22 22:06:16', '2026-04-22 22:56:28'),
(48, 32, 'success', 'Rental Approved', 'Your rental request for Argon Big has been approved', '/user/rentals/57', 1, '2026-04-22 22:35:23', '2026-04-22 22:07:06', '2026-04-22 22:35:23'),
(49, 20, 'info', 'New Rental Request', 'New rental request for Argon Small from Christian Renz Ledesma', '/rentals/58', 1, '2026-04-22 22:56:23', '2026-04-22 22:32:49', '2026-04-22 22:56:23'),
(50, 32, 'success', 'Rental Approved', 'Your rental request for Argon Small has been approved', '/user/rentals/58', 1, '2026-04-22 22:54:31', '2026-04-22 22:33:20', '2026-04-22 22:54:31'),
(51, 20, 'info', 'New Rental Request', 'New rental request for Argon Big, Argon Small from Ronald John', '/rentals/59', 0, NULL, '2026-04-23 01:16:55', '2026-04-23 01:16:55'),
(52, 35, 'success', 'Rental Approved', 'Your rental request for Argon Big, Argon Small has been approved', '/user/rentals/59', 0, NULL, '2026-04-23 01:23:09', '2026-04-23 01:23:09'),
(53, 32, 'success', 'Rental Approved', 'Your rental request for Argon Small has been approved', '/user/rentals/60', 1, '2026-04-28 06:34:16', '2026-04-23 01:26:45', '2026-04-28 06:34:16'),
(54, 20, 'info', 'New Rental Request', 'New rental request for Nitro from Christian Renz Ledesma', '/rentals/61', 1, '2026-04-27 22:29:48', '2026-04-27 22:29:40', '2026-04-27 22:29:48'),
(55, 32, 'success', 'Rental Approved', 'Your rental request for Nitro has been approved', '/user/rentals/61', 1, '2026-04-27 22:30:28', '2026-04-27 22:30:08', '2026-04-27 22:30:28'),
(56, 20, 'info', 'New Rental Request', 'New rental request for Argon Small from Christian Renz Ledesma', '/rentals/62', 1, '2026-04-27 23:24:42', '2026-04-27 23:21:36', '2026-04-27 23:24:42'),
(57, 20, 'info', 'New Rental Request', 'New rental request for Argon Small from Christian Renz Ledesma', '/rentals/63', 0, NULL, '2026-04-28 07:44:56', '2026-04-28 07:44:56'),
(58, 20, 'info', 'New Rental Request', 'New rental request for Argon Small from Christian Renz Ledesma', '/rentals/64', 0, NULL, '2026-04-28 07:48:07', '2026-04-28 07:48:07'),
(59, 20, 'info', 'New Rental Request', 'New rental request for Argon Small from Christian Renz Ledesma', '/rentals/65', 0, NULL, '2026-04-28 07:48:13', '2026-04-28 07:48:13'),
(60, 20, 'info', 'New Rental Request', 'New rental request for Argon Small from Christian Renz Ledesma', '/rentals/66', 0, NULL, '2026-04-28 08:05:58', '2026-04-28 08:05:58'),
(61, 20, 'info', 'New Rental Request', 'New rental request for Argon Small from Christian Renz Ledesma', '/rentals/67', 0, NULL, '2026-04-28 08:05:59', '2026-04-28 08:05:59'),
(62, 20, 'info', 'New Rental Request', 'New rental request for Argon Small from Christian Renz Ledesma', '/rentals/68', 0, NULL, '2026-04-28 08:06:00', '2026-04-28 08:06:00'),
(63, 20, 'info', 'New Rental Request', 'New rental request for Nitro from Christian Renz Ledesma', '/rentals/69', 0, NULL, '2026-04-28 08:14:31', '2026-04-28 08:14:31'),
(64, 20, 'info', 'New Rental Request', 'New rental request for Argon Small from Christian Renz Ledesma', '/rentals/70', 0, NULL, '2026-04-28 08:17:27', '2026-04-28 08:17:27'),
(65, 20, 'info', 'New Rental Request', 'New rental request for Argon Small from Christian Renz Ledesma', '/rentals/71', 1, '2026-04-29 02:37:47', '2026-04-28 09:03:20', '2026-04-29 02:37:47'),
(66, 32, 'success', 'Rental Returned', 'Your rental for Nitro has been marked as returned', '/user/rentals/61', 1, '2026-04-28 09:29:27', '2026-04-28 09:14:19', '2026-04-28 09:29:27'),
(67, 32, 'success', 'Rental Approved', 'Your rental request for Argon Small has been approved', '/user/rentals/71', 0, NULL, '2026-04-28 09:34:49', '2026-04-28 09:34:49'),
(68, 32, 'success', 'Rental Approved', 'Your rental request for Argon Small has been approved', '/user/rentals/70', 1, '2026-04-28 09:43:09', '2026-04-28 09:35:20', '2026-04-28 09:43:09'),
(69, 32, 'success', 'Rental Approved', 'Your rental request for Nitro has been approved', '/user/rentals/69', 0, NULL, '2026-04-30 05:47:59', '2026-04-30 05:47:59'),
(70, 32, 'success', 'Rental Approved', 'Your rental request for Argon Small has been approved', '/user/rentals/68', 0, NULL, '2026-04-30 05:51:37', '2026-04-30 05:51:37'),
(71, 32, 'success', 'Rental Approved', 'Your rental request for Argon Small has been approved', '/user/rentals/67', 0, NULL, '2026-04-30 05:59:38', '2026-04-30 05:59:38'),
(72, 32, 'success', 'Rental Approved', 'Your rental request for Argon Small has been approved', '/user/rentals/66', 0, NULL, '2026-04-30 06:06:14', '2026-04-30 06:06:14'),
(73, 20, 'info', 'New Rental Request', 'New rental request for Argon Big from Renz', '/rentals/72', 1, '2026-05-02 06:43:25', '2026-05-01 01:16:02', '2026-05-02 06:43:25'),
(74, 36, 'info', 'New Purchase Order', 'Admin has placed a new purchase order (PO-002) for 55000 worth of items.', '/supplier/orders', 0, NULL, '2026-05-02 01:12:54', '2026-05-02 01:12:54'),
(75, 36, 'info', 'New Purchase Order', 'Admin has placed a new purchase order (PO-003) for 44000 worth of items.', '/supplier/orders', 0, NULL, '2026-05-02 01:20:18', '2026-05-02 01:20:18'),
(76, 36, 'info', 'New Purchase Order', 'Admin has placed a new purchase order (PO-004) for 2200 worth of items.', '/supplier/orders', 0, NULL, '2026-05-02 01:45:35', '2026-05-02 01:45:35'),
(77, 36, 'info', 'New Purchase Order', 'Admin has placed a new purchase order (PO-005) for 1100 worth of items.', '/supplier/orders', 0, NULL, '2026-05-02 01:56:12', '2026-05-02 01:56:12');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_number` varchar(50) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `shipping_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','processing','completed','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `payment_status` enum('unpaid','paid','refunded','failed') NOT NULL DEFAULT 'unpaid',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `shipping_method` varchar(100) DEFAULT NULL,
  `shipping_address` text NOT NULL,
  `billing_address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_price` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `tank_id` bigint(20) UNSIGNED DEFAULT NULL,
  `tank_type` varchar(255) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `otps`
--

CREATE TABLE `otps` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otps`
--

INSERT INTO `otps` (`id`, `user_id`, `email`, `code`, `expires_at`, `used`, `created_at`, `updated_at`) VALUES
(1, 32, 'renzledesma76@gmail.com', '612400', '2026-04-21 05:05:58', 1, '2026-04-20 21:03:59', '2026-04-20 21:05:58'),
(2, 32, 'renzledesma76@gmail.com', '115138', '2026-04-21 05:07:40', 1, '2026-04-20 21:07:02', '2026-04-20 21:07:40'),
(3, 32, 'renzledesma76@gmail.com', '031306', '2026-04-21 05:08:10', 1, '2026-04-20 21:07:40', '2026-04-20 21:08:10'),
(4, 38, 'nbak3027@gmail.com', '396175', '2026-05-02 16:16:02', 1, '2026-05-02 08:15:35', '2026-05-02 08:16:02'),
(5, 32, 'renzledesma76@gmail.com', '368116', '2026-05-02 16:27:16', 1, '2026-05-02 08:22:47', '2026-05-02 08:27:16'),
(6, 32, 'renzledesma76@gmail.com', '534954', '2026-05-02 16:27:48', 1, '2026-05-02 08:27:16', '2026-05-02 08:27:48');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `sku` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(280) NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `compare_price` decimal(12,2) DEFAULT NULL,
  `cost` decimal(12,2) DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `low_stock_threshold` int(11) NOT NULL DEFAULT 5,
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_taxable` tinyint(1) NOT NULL DEFAULT 1,
  `views_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `sku`, `name`, `slug`, `short_description`, `description`, `price`, `compare_price`, `cost`, `stock_quantity`, `low_stock_threshold`, `weight`, `dimensions`, `image_url`, `gallery`, `is_active`, `is_featured`, `is_taxable`, `views_count`, `created_at`, `updated_at`) VALUES
(1, 3, 'IPHONE-14-PRO', 'Medical Oxygen Tank - Small', 'iphone-14-pro', NULL, 'Latest iPhone with dynamic island and A16 chip', 500.00, NULL, NULL, 50, 5, NULL, NULL, NULL, NULL, 1, 1, 1, 0, '2026-04-10 06:17:39', '2026-04-29 02:05:11'),
(2, 3, 'SAMSUNG-S23', 'Medical Oxygen Tank - Medium', 'samsung-galaxy-s23', NULL, 'Premium Android smartphone with amazing camera', 750.00, NULL, NULL, 35, 5, NULL, NULL, NULL, NULL, 1, 1, 1, 0, '2026-04-10 06:17:39', '2026-04-29 02:05:11'),
(3, 4, 'MACBOOK-PRO', 'Medical Oxygen Tank - Large', 'macbook-pro-14', NULL, 'Powerful laptop for professionals with M2 chip', 1000.00, NULL, NULL, 20, 5, NULL, NULL, NULL, NULL, 1, 1, 1, 0, '2026-04-10 06:17:39', '2026-04-29 02:05:11'),
(4, 5, 'COTTON-TSHIRT', 'Industrial Oxygen Tank', 'cotton-tshirt', NULL, 'Comfortable 100% cotton t-shirt', 1500.00, NULL, NULL, 100, 5, NULL, NULL, NULL, NULL, 1, 0, 1, 0, '2026-04-10 06:17:39', '2026-04-29 02:05:11'),
(5, 6, 'PROGRAMMING-101', 'Portable Oxygen Cylinder', 'programming-101', NULL, 'Learn programming basics with this comprehensive guide', 350.00, NULL, NULL, 30, 5, NULL, NULL, NULL, NULL, 1, 0, 1, 0, '2026-04-10 06:17:39', '2026-04-29 02:05:11');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `sku` varchar(50) NOT NULL,
  `attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`attributes`)),
  `price_adjustment` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `po_number` varchar(255) NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery_date` date NOT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','order_placed','shipped','partial_received','received','cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` enum('cash','gcash','cash_on_delivery') NOT NULL DEFAULT 'cash_on_delivery',
  `payment_status` enum('unpaid','partial_paid','paid') NOT NULL DEFAULT 'unpaid',
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `supplier_id`, `po_number`, `order_date`, `expected_delivery_date`, `total_amount`, `status`, `payment_method`, `payment_status`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 3, 'PO-001', '2026-05-01', '2026-05-03', 1100.00, 'received', 'cash_on_delivery', 'unpaid', NULL, 20, '2026-05-01 10:25:39', '2026-05-02 01:11:46'),
(2, 3, 'PO-002', '2026-05-02', '2026-05-04', 55000.00, 'received', 'cash_on_delivery', 'paid', 'badly needed', 20, '2026-05-02 01:12:54', '2026-05-02 01:33:33'),
(3, 3, 'PO-003', '2026-05-02', '2026-05-05', 44000.00, 'received', 'cash_on_delivery', 'paid', NULL, 20, '2026-05-02 01:20:18', '2026-05-02 01:33:51'),
(4, 3, 'PO-004', '2026-05-02', '2026-05-07', 2200.00, 'received', 'cash_on_delivery', 'paid', NULL, 20, '2026-05-02 01:45:35', '2026-05-02 01:56:54'),
(5, 3, 'PO-005', '2026-05-02', '2026-05-04', 1100.00, 'received', 'cash_on_delivery', 'paid', NULL, 20, '2026-05-02 01:56:12', '2026-05-02 01:56:31');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_order_id` bigint(20) UNSIGNED NOT NULL,
  `supplier_product_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `received_quantity` int(11) NOT NULL DEFAULT 0,
  `price` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `supplier_product_id`, `product_name`, `quantity`, `received_quantity`, `price`, `total`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Argon Small', 1, 1, 1100.00, 1100.00, '2026-05-01 10:25:39', '2026-05-02 01:11:46'),
(2, 2, 1, 'Argon Small', 50, 50, 1100.00, 55000.00, '2026-05-02 01:12:54', '2026-05-02 01:33:33'),
(3, 3, 1, 'Argon Small', 40, 40, 1100.00, 44000.00, '2026-05-02 01:20:18', '2026-05-02 01:33:51'),
(4, 4, 1, 'Argon Small', 2, 4, 1100.00, 2200.00, '2026-05-02 01:45:35', '2026-05-02 01:56:54'),
(5, 5, 1, 'Argon Small', 1, 1, 1100.00, 1100.00, '2026-05-02 01:56:12', '2026-05-02 01:56:31');

-- --------------------------------------------------------

--
-- Table structure for table `rentals`
--

CREATE TABLE `rentals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `rental_request_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `supplier_id` bigint(20) UNSIGNED DEFAULT NULL,
  `tank_id` varchar(255) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
  `total_amount` decimal(10,2) DEFAULT NULL,
  `deposit_amount` decimal(10,2) DEFAULT NULL,
  `deposit_payment_method` varchar(255) DEFAULT NULL,
  `deposit_payment_date` date DEFAULT NULL,
  `deposit_status` varchar(255) NOT NULL DEFAULT 'pending',
  `deposit_reference_number` varchar(255) DEFAULT NULL,
  `pickup_date` datetime DEFAULT NULL,
  `deposit_type` varchar(255) NOT NULL DEFAULT 'Security Deposit',
  `return_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rentals`
--

INSERT INTO `rentals` (`id`, `rental_request_id`, `customer_id`, `product_id`, `supplier_id`, `tank_id`, `start_date`, `end_date`, `status`, `total_amount`, `deposit_amount`, `deposit_payment_method`, `deposit_payment_date`, `deposit_status`, `deposit_reference_number`, `pickup_date`, `deposit_type`, `return_date`, `notes`, `created_at`, `updated_at`) VALUES
(21, 58, 19, NULL, NULL, 'ARG-0001', '2026-04-24', '2026-04-30', 'active', NULL, 0.00, NULL, '2026-04-23', 'pending', NULL, '2026-04-23 06:33:20', 'Security Deposit', NULL, NULL, '2026-04-22 22:33:20', '2026-04-22 22:33:20'),
(22, 59, 20, NULL, NULL, NULL, '2026-04-24', '2026-04-30', 'active', NULL, 1100.00, 'cash', '2026-04-23', 'paid', NULL, '2026-04-23 09:23:09', 'Security Deposit', NULL, NULL, '2026-04-23 01:23:09', '2026-04-23 01:23:09'),
(23, 60, 19, NULL, NULL, 'ARG-0001', '2026-04-24', '2026-04-30', 'active', NULL, 0.00, NULL, '2026-04-23', 'pending', NULL, '2026-04-23 09:26:45', 'Security Deposit', NULL, NULL, '2026-04-23 01:26:45', '2026-04-23 01:26:45'),
(24, 61, 19, NULL, NULL, 'NIT-0003', '2026-04-29', '2026-05-05', 'completed', NULL, 1000.00, 'cash', '2026-04-28', 'paid', NULL, '2026-04-28 06:30:08', 'Security Deposit', '2026-04-28 17:14:19', NULL, '2026-04-27 22:30:08', '2026-04-28 09:14:19'),
(25, 71, 19, NULL, NULL, 'ARG-0001', '2026-04-29', '2026-05-05', 'active', NULL, 999.00, 'cash', '2026-04-30', 'paid', NULL, '2026-04-28 17:34:49', 'Security Deposit', NULL, NULL, '2026-04-28 09:34:49', '2026-04-30 00:07:28'),
(26, 70, 19, NULL, NULL, NULL, '2026-04-29', '2026-05-05', 'active', NULL, 0.00, NULL, '2026-04-28', 'pending', NULL, '2026-04-28 17:35:20', 'Security Deposit', NULL, NULL, '2026-04-28 09:35:20', '2026-04-28 09:35:20'),
(27, 69, 19, NULL, NULL, 'NIT-0003', '2026-04-29', '2026-05-05', 'active', 0.00, 999.00, 'cash', '2026-04-30', 'paid', NULL, '2026-04-30 13:47:59', 'Security Deposit', NULL, NULL, '2026-04-30 05:47:59', '2026-04-30 05:47:59');

-- --------------------------------------------------------

--
-- Table structure for table `rental_requests`
--

CREATE TABLE `rental_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `request_type` enum('rental','refill') NOT NULL DEFAULT 'rental',
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `tank_type` varchar(255) NOT NULL,
  `assigned_tank_id` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `contact_number` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `status` enum('pending','approved','rejected','completed','canceled') NOT NULL DEFAULT 'pending',
  `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  `barangay` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `delivery_lat` decimal(10,8) DEFAULT NULL,
  `delivery_lng` decimal(11,8) DEFAULT NULL,
  `delivery_address` text DEFAULT NULL,
  `pickup_lat` decimal(10,8) DEFAULT NULL,
  `pickup_lng` decimal(11,8) DEFAULT NULL,
  `pickup_address` text DEFAULT NULL,
  `current_lat` decimal(10,8) DEFAULT NULL,
  `current_lng` decimal(11,8) DEFAULT NULL,
  `location_updated_at` timestamp NULL DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `rejected_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rental_requests`
--

INSERT INTO `rental_requests` (`id`, `tracking_number`, `customer_id`, `request_type`, `product_id`, `tank_type`, `assigned_tank_id`, `quantity`, `start_date`, `end_date`, `purpose`, `contact_number`, `address`, `status`, `priority`, `barangay`, `city`, `province`, `postal_code`, `delivery_lat`, `delivery_lng`, `delivery_address`, `pickup_lat`, `pickup_lng`, `pickup_address`, `current_lat`, `current_lng`, `location_updated_at`, `admin_notes`, `rejected_reason`, `created_at`, `updated_at`) VALUES
(47, NULL, 19, 'rental', NULL, 'Industrial Oxygen', NULL, 1, '2026-04-26', '2026-05-03', 'Welding project', '0987-654-3210', '456 Industrial Area, Quezon City', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18 07:08:48', '2026-04-19 01:41:31'),
(48, NULL, 19, 'rental', NULL, 'Argon Tank', NULL, 3, '2026-04-08', '2026-04-15', 'Laboratory research', '0955-123-4567', '789 Research Facility, Makati', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Approved for laboratory use', NULL, '2026-04-18 07:08:48', '2026-04-18 07:08:48'),
(50, NULL, 19, 'refill', NULL, 'Argon Small', NULL, 1, '2026-04-20', '2026-04-26', 'asdtgasg', '09914458507', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-19 01:35:27', '2026-04-19 01:37:12'),
(51, 'MVO-5988DD9C', 19, 'refill', NULL, 'Argon Small', NULL, 1, '2026-04-20', '2026-04-26', 'dhgasd', '09914458507', 'Pickup at Store', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-19 04:52:55', '2026-04-19 04:52:55'),
(52, 'MVO-F2A19DBC', 19, 'refill', NULL, 'Argon Small', NULL, 1, '2026-04-20', '2026-04-26', 'sahhdghass', '09914458507', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-19 04:55:52', '2026-04-22 18:37:39'),
(53, NULL, 19, 'refill', NULL, 'Argon Small', NULL, 1, '2026-04-22', '2026-04-28', 'Refill period: 2days', '09914458507', 'N/A', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-20 20:49:02', '2026-04-20 20:49:17'),
(54, 'MVO-91744669', 19, 'rental', NULL, 'Argon Small', NULL, 1, '2026-04-22', '2026-04-28', 'Welding', '09914458507', 'Brgy Pob west', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-21 01:50:54', '2026-04-21 01:55:22'),
(55, 'MVO-85B85A54', 19, 'rental', NULL, 'Argon Small, Argon Small', NULL, 1, '2026-04-24', '2026-04-30', 'Welding', '09914458507', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-22 18:39:02', '2026-04-22 18:39:23'),
(56, 'MVO-09163F81', 19, 'rental', NULL, 'Argon Small, Argon Big', NULL, 1, '2026-04-24', '2026-04-30', 'Welding', '09914458507', 'Pickup at Store', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-22 21:47:00', '2026-04-22 21:47:00'),
(57, 'MVO-728DFD3F', 19, 'rental', NULL, 'Argon Big', 'ARG-0002', 1, '2026-04-24', '2026-04-30', 'Welding', '09914458507', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-22 22:06:16', '2026-04-22 22:07:06'),
(58, 'MVO-00EBBAC4', 19, 'rental', NULL, 'Argon Small', 'ARG-0001', 1, '2026-04-24', '2026-04-30', 'Welding', '09914458507', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-22 22:32:49', '2026-04-22 22:33:20'),
(59, 'MVO-CDE9286F', 20, 'rental', NULL, 'Argon Big, Argon Small', NULL, 1, '2026-04-24', '2026-04-30', 'Welding', '09914458507', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-23 01:16:55', '2026-04-23 01:23:09'),
(60, NULL, 19, 'refill', NULL, 'Argon Small', 'ARG-0001', 1, '2026-04-24', '2026-04-30', 'Refill period: 2', '09914458507', 'N/A', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-23 01:26:09', '2026-04-23 01:26:45'),
(61, 'MVO-8D648550', 19, 'rental', NULL, 'Nitro', 'NIT-0003', 1, '2026-04-29', '2026-05-05', 'Laboratory', '09914458507', 'Pickup at Store', 'completed', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-27 22:29:40', '2026-04-28 09:14:19'),
(62, 'MVO-1C383BE3', 19, 'rental', NULL, 'Argon Small', NULL, 1, '2026-04-29', '2026-05-05', 'Welding', '0987866756767', 'Pulong Matong', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-27 23:21:36', '2026-04-27 23:21:36'),
(63, 'MVO-7366EF88', 19, 'rental', NULL, 'Argon Small', NULL, 1, '2026-04-29', '2026-05-05', 'Welding', '09914458507', 'Pickup at Store', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-28 07:44:56', '2026-04-28 07:44:56'),
(64, 'MVO-D2DD7BCE', 19, 'rental', NULL, 'Argon Small', NULL, 1, '2026-04-29', '2026-05-05', 'Welding', '09914458507', 'Pickup at Store', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-28 07:48:07', '2026-04-28 07:48:07'),
(65, 'MVO-8ABA5CB9', 19, 'rental', NULL, 'Argon Small', NULL, 1, '2026-04-29', '2026-05-05', 'Welding', '09914458507', 'Pickup at Store', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-28 07:48:10', '2026-04-28 07:48:10'),
(66, 'MVO-89EAA815', 19, 'rental', NULL, 'Argon Small', NULL, 1, '2026-04-29', '2026-05-05', 'Welding', '09914458507\\', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-28 08:05:58', '2026-04-30 06:06:14'),
(67, 'MVO-5477FC93', 19, 'rental', NULL, 'Argon Small', NULL, 1, '2026-04-29', '2026-05-05', 'Welding', '09914458507\\', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-28 08:05:59', '2026-04-30 05:59:38'),
(68, 'MVO-4177DBE6', 19, 'rental', NULL, 'Argon Small', NULL, 1, '2026-04-29', '2026-05-05', 'Welding', '09914458507', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-28 08:06:00', '2026-04-30 05:51:36'),
(69, 'MVO-D871D4BE', 19, 'rental', NULL, 'Nitro', 'NIT-0003', 1, '2026-04-29', '2026-05-05', 'Laboratory', '09914458507', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-28 08:14:31', '2026-04-30 05:47:59'),
(70, 'MVO-DC0F68AB', 19, 'rental', NULL, 'Argon Small', NULL, 1, '2026-04-29', '2026-05-05', 'Welding', '09914458507', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-28 08:17:27', '2026-04-28 09:35:20'),
(71, 'MVO-DEB05AD3', 19, 'rental', NULL, 'Argon Small', 'ARG-0001', 1, '2026-04-29', '2026-05-05', 'Welding', '09914458507', 'Pickup at Store', 'approved', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-28 09:03:20', '2026-04-28 09:34:49'),
(72, 'MVO-2CCF40F5', 21, 'rental', NULL, 'Argon Big', NULL, 1, NULL, NULL, 'Welding', '09395478320', 'PWS 049, Rizal Street, Poblacion West, General Tinio, Nueva Ecija, (Near: Near at west central school)', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-01 01:16:02', '2026-05-01 01:16:02');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `is_verified_purchase` tinyint(1) NOT NULL DEFAULT 0,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `status` varchar(255) NOT NULL DEFAULT 'completed',
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `customer_name`, `payment_method`, `total_amount`, `items`, `status`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'Renz', 'cash', 800.00, '[{\"tank_id\":3,\"tank_type\":\"Nitro\",\"quantity\":1,\"price\":\"800.00\"}]', 'completed', 20, '2026-05-02 05:27:02', '2026-05-02 05:27:02');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('7Dfs5goShUU5SSqHP8UYMxVvvfWB5AsHkajZi60z', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'YTo3OntzOjY6Il90b2tlbiI7czo0MDoiWFZmOVdmMzlUclVsZHJXOE5EZ0NjUVNNZDBWSkw3Q0dhMUJESGJEVCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtOO3M6MzoidXJsIjthOjE6e3M6ODoiaW50ZW5kZWQiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9kYXNoYm9hcmQiO31zOjExOiJvdHBfdXNlcl9pZCI7TjtzOjEwOiJ1c2VyX2VtYWlsIjtzOjIzOiJ2aXVwcmVtaXVtNzY3QGdtYWlsLmNvbSI7fQ==', 1777741412),
('B5FEHNeG3mR4ctl0qRKzWJTZ9aEEM3a13MUzm7MN', 20, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiZkN5WldlQW1nVWptSUFYbENtTkozQlczTVhnZWVVUjlOakxIb3VwSyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MjA7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9ub3RpZmljYXRpb25zIjtzOjU6InJvdXRlIjtzOjE5OiJub3RpZmljYXRpb25zLmluZGV4Ijt9fQ==', 1777737271),
('S0l8hcuf1Fdqy63mG6AEzYmU8XrgIfaW3f8GLGF1', 20, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoia2U5RjJ6QURTYUQxYXRvNGEwMVBOTjVrQk5OcktDNkJMVkhvekZEbyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MjA7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9ub3RpZmljYXRpb25zIjtzOjU6InJvdXRlIjtzOjE5OiJub3RpZmljYXRpb25zLmluZGV4Ijt9fQ==', 1777740841);

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `plant_name` varchar(255) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `contact_person` varchar(255) NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `oxygen_tank_price` decimal(12,2) DEFAULT NULL,
  `argon_small_price` decimal(12,2) DEFAULT NULL,
  `argon_big_price` decimal(12,2) DEFAULT NULL,
  `nitro_price` decimal(12,2) DEFAULT NULL,
  `medical_oxygen_big_price` decimal(12,2) DEFAULT NULL,
  `medical_oxygen_medium_price` decimal(12,2) DEFAULT NULL,
  `flask_type_standard_price` decimal(12,2) DEFAULT NULL,
  `flask_type_small_price` decimal(12,2) DEFAULT NULL,
  `industrial_oxygen_price` decimal(12,2) DEFAULT NULL,
  `acetylene_price` decimal(12,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `user_id`, `name`, `plant_name`, `address`, `contact_person`, `contact_number`, `email`, `oxygen_tank_price`, `argon_small_price`, `argon_big_price`, `nitro_price`, `medical_oxygen_big_price`, `medical_oxygen_medium_price`, `flask_type_standard_price`, `flask_type_small_price`, `industrial_oxygen_price`, `acetylene_price`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 36, 'Test Supplier Co', 'Main Plant', '123 Supplier St', 'John Doe', '09123456789', 'supplier@test.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-04-29 04:13:45', '2026-04-29 04:13:45');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_orders`
--

CREATE TABLE `supplier_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `tank_type` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` enum('order_placed','shipped','received','cancelled') NOT NULL DEFAULT 'order_placed',
  `payment_status` enum('paid','unpaid') NOT NULL DEFAULT 'unpaid',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier_products`
--

CREATE TABLE `supplier_products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(255) NOT NULL DEFAULT 'pcs',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supplier_products`
--

INSERT INTO `supplier_products` (`id`, `supplier_id`, `product_name`, `description`, `price`, `stock_quantity`, `unit`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 3, 'Argon Small', 'welding', 1100.00, 100, 'pcs', 1, '2026-05-01 08:01:18', '2026-05-01 08:01:18');

-- --------------------------------------------------------

--
-- Table structure for table `tanks`
--

CREATE TABLE `tanks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tank_id` varchar(255) DEFAULT NULL,
  `tank_type` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `last_refilled` date DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'available',
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tanks`
--

INSERT INTO `tanks` (`id`, `tank_id`, `tank_type`, `quantity`, `price`, `last_refilled`, `status`, `image`, `created_at`, `updated_at`) VALUES
(1, 'ARG-0001', 'Argon Small', 98, 1100.00, '2026-05-02', 'available', '/storage/tank-images/1776920634_OIP.jpg', '2026-04-21 00:11:35', '2026-05-02 03:44:12'),
(2, 'ARG-0002', 'Argon Big', 97, 2200.00, '2026-04-22', 'available', '/storage/tank-images/1777714530_OIP.jpg', '2026-04-21 10:32:35', '2026-05-02 04:11:01'),
(3, 'NIT-0003', 'Nitro', 83, 800.00, '2026-04-23', 'available', '/storage/tank-images/1777716826_OIP.jpg', '2026-04-22 20:16:38', '2026-05-02 05:27:02');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `tank_id` varchar(255) NOT NULL,
  `transaction_type` enum('Rent','Returned','Refill') NOT NULL,
  `transaction_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `customer_id`, `tank_id`, `transaction_type`, `transaction_date`, `created_at`, `updated_at`) VALUES
(7, 19, 'Industrial Oxygen', 'Rent', '2026-04-18', '2026-04-19 04:28:07', '2026-04-19 04:28:07'),
(8, 19, 'Argon Tank', 'Rent', '2026-04-18', '2026-04-19 04:28:07', '2026-04-19 04:28:07'),
(9, 19, 'Argon Small', 'Refill', '2026-04-19', '2026-04-19 04:28:07', '2026-04-19 04:28:07'),
(10, 19, 'Argon Small', 'Refill', '2026-04-21', '2026-04-20 20:49:17', '2026-04-20 20:49:17'),
(11, 19, 'Argon Small', 'Rent', '2026-04-21', '2026-04-21 01:55:22', '2026-04-21 01:55:22'),
(12, 19, 'Argon Small', 'Refill', '2026-04-23', '2026-04-22 18:37:39', '2026-04-22 18:37:39'),
(13, 19, 'Argon Small, Argon Small', 'Rent', '2026-04-23', '2026-04-22 18:39:23', '2026-04-22 18:39:23'),
(14, 19, 'Argon Big', 'Rent', '2026-04-23', '2026-04-22 22:07:06', '2026-04-22 22:07:06'),
(15, 19, 'Argon Small', 'Rent', '2026-04-23', '2026-04-22 22:33:20', '2026-04-22 22:33:20'),
(16, 20, 'Argon Big, Argon Small', 'Rent', '2026-04-23', '2026-04-23 01:23:09', '2026-04-23 01:23:09'),
(17, 19, 'Argon Small', 'Rent', '2026-04-23', '2026-04-23 01:26:45', '2026-04-23 01:26:45'),
(18, 19, 'Nitro', 'Rent', '2026-04-28', '2026-04-27 22:30:08', '2026-04-27 22:30:08'),
(19, 19, 'Nitro', 'Returned', '2026-04-28', '2026-04-28 09:14:19', '2026-04-28 09:14:19'),
(20, 19, 'Argon Small', 'Rent', '2026-04-28', '2026-04-28 09:34:49', '2026-04-28 09:34:49'),
(21, 19, 'Argon Small', 'Rent', '2026-04-28', '2026-04-28 09:35:20', '2026-04-28 09:35:20'),
(22, 19, 'Nitro', 'Rent', '2026-04-30', '2026-04-30 05:47:59', '2026-04-30 05:47:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `remember_token` varchar(100) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `profile_image`, `phone`, `email_verified_at`, `password`, `role`, `remember_token`, `avatar`, `is_active`, `status`, `last_login_at`, `created_at`, `updated_at`) VALUES
(20, 'Admin', 'admin@mvoxygen.com', '/storage/profile-images/1777477487_134051830930214109.jpg', NULL, NULL, '$2y$12$HLaCsOPC7ctsvhpMiemz.uYbL6hcWZ6nUxcoaY5lDm5O0MNzi6KAO', 'admin', NULL, NULL, 1, 'active', NULL, '2026-04-16 04:09:15', '2026-04-29 07:44:47'),
(32, 'Christian Renz Ledesma', 'renzledesma76@gmail.com', '/storage/profile-images/1777395837_134059182592490994.jpg', '09914458507', '2026-04-16 05:23:17', '$2y$12$FAUCkr5GSq1OGtRBS80wX.O.5o3cCPJkFPgcISPgTCHldPbAsS2bi', 'user', 'qIrV8oj9AiidU0x97WvjA3FXSdEycZ1VXNrTZErpw1viRduzsJG5IYntd75F', NULL, 1, 'active', NULL, '2026-04-16 05:21:39', '2026-05-02 08:31:51'),
(35, 'Ronald John', 'rjtrinidad45@gmail.com', NULL, '09126757174', '2026-04-23 01:13:47', '$2y$12$E62U6v9hvMxYbMGLgwQTJ.lgyR8OG9ZOlbTXc63PAKRZ0AbNgl6Ku', 'user', NULL, NULL, 1, 'active', NULL, '2026-04-23 01:12:56', '2026-04-30 00:05:28'),
(36, 'Test Supplier', 'supplier@test.com', '/storage/profile-images/1777470723_iron-man-avenger-in-red-4j.jpg', NULL, NULL, '$2y$12$ggc/f3D0GcZrYONGd8CpVOTxfxgo2vjMXNfNffh0FMRMpZy/dwM1y', 'vendor', NULL, NULL, 1, 'active', NULL, '2026-04-29 04:13:45', '2026-04-29 05:52:03'),
(37, 'Christian Renz Ledesma', 'christianrenzledesma210@gmail.com', NULL, '09914458507', '2026-05-01 00:17:04', '$2y$12$n5gzTQ097YpxNMaC3/CDsezV0js18suvuckGb2r0Z4PiDQcTwU1OW', 'user', NULL, NULL, 1, 'active', NULL, '2026-05-01 00:14:08', '2026-05-01 00:17:04'),
(38, 'Renz', 'nbak3027@gmail.com', '/storage/profile-images/1777738661_Screenshot 2026-03-05 184705.png', '09395478320', '2026-05-01 00:34:11', '$2y$12$1cT6CmIQrkmCslTyLNaAiObwgiWtPbb9MeXMvzN9OgI1S57n23u.a', 'user', 'pksLjo9rXsfb9cbJEUiF5UOMiTdgfBxUeT8Q7hLqIKIrsi2fkXutZdRuEyIP', NULL, 1, 'active', NULL, '2026-05-01 00:33:14', '2026-05-02 08:17:41'),
(39, 'Christian Renz Ledesma', 'viupremium767@gmail.com', NULL, NULL, NULL, '$2y$12$tKSFh9i015hSddQO4V6kZOkXMoCi3TeEmfaQqS/vJysdogcjRwzY2', 'user', NULL, NULL, 1, 'active', NULL, '2026-05-02 09:01:45', '2026-05-02 09:01:45');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activities_user_id_index` (`user_id`),
  ADD KEY `activities_customer_id_index` (`customer_id`),
  ADD KEY `activities_rental_request_id_index` (`rental_request_id`),
  ADD KEY `activities_created_at_index` (`created_at`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carts_user_id_index` (`user_id`),
  ADD KEY `carts_session_id_index` (`session_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cart_items_cart_id_index` (`cart_id`),
  ADD KEY `cart_items_product_id_index` (`product_id`),
  ADD KEY `cart_items_variant_id_index` (`variant_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`),
  ADD KEY `categories_slug_index` (`slug`),
  ADD KEY `categories_parent_id_index` (`parent_id`),
  ADD KEY `categories_is_active_index` (`is_active`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coupons_code_unique` (`code`),
  ADD KEY `coupons_code_index` (`code`),
  ADD KEY `coupons_valid_from_index` (`valid_from`),
  ADD KEY `coupons_valid_until_index` (`valid_until`),
  ADD KEY `coupons_is_active_index` (`is_active`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deposits`
--
ALTER TABLE `deposits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deposits_rental_id_foreign` (`rental_id`),
  ADD KEY `deposits_customer_id_foreign` (`customer_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `maintenances`
--
ALTER TABLE `maintenances`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_read_index` (`user_id`,`read`),
  ADD KEY `notifications_created_at_index` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_number_unique` (`order_number`),
  ADD KEY `orders_order_number_index` (`order_number`),
  ADD KEY `orders_user_id_index` (`user_id`),
  ADD KEY `orders_status_index` (`status`),
  ADD KEY `orders_payment_status_index` (`payment_status`),
  ADD KEY `orders_created_at_index` (`created_at`),
  ADD KEY `orders_supplier_id_foreign` (`supplier_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_index` (`order_id`),
  ADD KEY `order_items_tank_id_foreign` (`tank_id`);

--
-- Indexes for table `otps`
--
ALTER TABLE `otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `otps_user_id_foreign` (`user_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_sku_unique` (`sku`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD KEY `products_sku_index` (`sku`),
  ADD KEY `products_slug_index` (`slug`),
  ADD KEY `products_category_id_index` (`category_id`),
  ADD KEY `products_price_index` (`price`),
  ADD KEY `products_is_active_index` (`is_active`),
  ADD KEY `products_is_featured_index` (`is_featured`),
  ADD KEY `products_stock_quantity_index` (`stock_quantity`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_variants_sku_unique` (`sku`),
  ADD KEY `product_variants_product_id_index` (`product_id`),
  ADD KEY `product_variants_sku_index` (`sku`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_orders_po_number_unique` (`po_number`),
  ADD KEY `purchase_orders_supplier_id_foreign` (`supplier_id`),
  ADD KEY `purchase_orders_created_by_foreign` (`created_by`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_order_items_purchase_order_id_foreign` (`purchase_order_id`),
  ADD KEY `purchase_order_items_supplier_product_id_foreign` (`supplier_product_id`);

--
-- Indexes for table `rentals`
--
ALTER TABLE `rentals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rentals_rental_request_id_foreign` (`rental_request_id`),
  ADD KEY `rentals_customer_id_foreign` (`customer_id`),
  ADD KEY `rentals_product_id_foreign` (`product_id`),
  ADD KEY `rentals_supplier_id_foreign` (`supplier_id`);

--
-- Indexes for table `rental_requests`
--
ALTER TABLE `rental_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rental_requests_tracking_number_unique` (`tracking_number`),
  ADD KEY `rental_requests_customer_id_foreign` (`customer_id`),
  ADD KEY `rental_requests_product_id_foreign` (`product_id`),
  ADD KEY `rental_requests_delivery_lat_delivery_lng_index` (`delivery_lat`,`delivery_lng`),
  ADD KEY `rental_requests_pickup_lat_pickup_lng_index` (`pickup_lat`,`pickup_lng`),
  ADD KEY `rental_requests_current_lat_current_lng_index` (`current_lat`,`current_lng`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reviews_user_id_product_id_unique` (`user_id`,`product_id`),
  ADD KEY `reviews_order_id_foreign` (`order_id`),
  ADD KEY `reviews_user_id_index` (`user_id`),
  ADD KEY `reviews_product_id_index` (`product_id`),
  ADD KEY `reviews_rating_index` (`rating`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_user_id_foreign` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `suppliers_user_id_foreign` (`user_id`);

--
-- Indexes for table `supplier_orders`
--
ALTER TABLE `supplier_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_orders_supplier_id_foreign` (`supplier_id`);

--
-- Indexes for table `supplier_products`
--
ALTER TABLE `supplier_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_products_supplier_id_foreign` (`supplier_id`);

--
-- Indexes for table `tanks`
--
ALTER TABLE `tanks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tanks_tank_id_unique` (`tank_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transactions_customer_id_foreign` (`customer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_email_index` (`email`),
  ADD KEY `users_is_active_index` (`is_active`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wishlists_user_id_product_id_unique` (`user_id`,`product_id`),
  ADD KEY `wishlists_user_id_index` (`user_id`),
  ADD KEY `wishlists_product_id_index` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `deposits`
--
ALTER TABLE `deposits`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maintenances`
--
ALTER TABLE `maintenances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `otps`
--
ALTER TABLE `otps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `rentals`
--
ALTER TABLE `rentals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `rental_requests`
--
ALTER TABLE `rental_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `supplier_orders`
--
ALTER TABLE `supplier_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `supplier_products`
--
ALTER TABLE `supplier_products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tanks`
--
ALTER TABLE `tanks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `activities_rental_request_id_foreign` FOREIGN KEY (`rental_request_id`) REFERENCES `rental_requests` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `activities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `deposits`
--
ALTER TABLE `deposits`
  ADD CONSTRAINT `deposits_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `deposits_rental_id_foreign` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_tank_id_foreign` FOREIGN KEY (`tank_id`) REFERENCES `tanks` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `otps`
--
ALTER TABLE `otps`
  ADD CONSTRAINT `otps_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `purchase_orders_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `purchase_order_items_purchase_order_id_foreign` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_order_items_supplier_product_id_foreign` FOREIGN KEY (`supplier_product_id`) REFERENCES `supplier_products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rentals`
--
ALTER TABLE `rentals`
  ADD CONSTRAINT `rentals_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rentals_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `rentals_rental_request_id_foreign` FOREIGN KEY (`rental_request_id`) REFERENCES `rental_requests` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `rentals_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rental_requests`
--
ALTER TABLE `rental_requests`
  ADD CONSTRAINT `rental_requests_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rental_requests_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `suppliers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `supplier_orders`
--
ALTER TABLE `supplier_orders`
  ADD CONSTRAINT `supplier_orders_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `supplier_products`
--
ALTER TABLE `supplier_products`
  ADD CONSTRAINT `supplier_products_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlists_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
