-- Migration to add hourly check-in/out columns to properties
ALTER TABLE `properties` ADD COLUMN `check_in_time_hourly` TIME DEFAULT NULL AFTER `check_out_time`;
ALTER TABLE `properties` ADD COLUMN `check_out_time_hourly` TIME DEFAULT NULL AFTER `check_in_time_hourly`;
