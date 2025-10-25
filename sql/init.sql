-- init.sql
-- Creates schema for FORDAC Connect V1 (Moungo)

BEGIN;

-- USERS
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- superadmin/admin/member
  phone VARCHAR(50),
  membership_level VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending', -- pending / approved / rejected
  region_id INT,
  departement_id INT,
  zone_id INT,
  arrondissement_id INT,
  service_assigned VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LOCATIONS: regions -> departements -> zones -> arrondissements
DROP TABLE IF EXISTS arrondissements CASCADE;
CREATE TABLE arrondissements (
  id SERIAL PRIMARY KEY,
  zone_id INT NOT NULL,
  name VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS zones CASCADE;
CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  departement_id INT NOT NULL,
  name VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS departements CASCADE;
CREATE TABLE departements (
  id SERIAL PRIMARY KEY,
  region_id INT NOT NULL,
  name VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS regions CASCADE;
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- MESSAGES
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert region / departement / zones / arrondissements for Moungo
INSERT INTO regions (name) VALUES ('Littoral');

-- assume region id = 1
INSERT INTO departements (region_id, name) VALUES (1, 'Moungo');

-- assume departement id = 1
INSERT INTO zones (departement_id, name) VALUES
  (1, 'Moungo Nord'),
  (1, 'Moungo Sud');

-- assume zones ids 1 and 2
INSERT INTO arrondissements (zone_id, name) VALUES
  (2, 'Njombé-Penja'),
  (2, 'Loum'),
  (2, 'Manjo'),
  (2, 'Melong'),
  (1, 'Nkongsamba'),
  (1, 'Mbanga');

-- Demo users (SuperAdmin / Admins / Members)
-- NOTE: demo passwords are plaintext as requested (fordac2025) and marked as demo only.
INSERT INTO users (name, email, password, role, phone, membership_level, status, region_id, departement_id, zone_id, arrondissement_id, service_assigned)
VALUES
  ('Super Admin', 'superadmin@fordac-connect.org', 'fordac2025', 'superadmin', '+237600000000', NULL, 'approved', 1, 1, 2, 1, 'platform'),
  ('Admin Njombe', 'admin.njombe@fordac-connect.org', 'fordac2025', 'admin', '+237670000001', NULL, 'approved', 1, 1, 2, 1, 'admin_blog'),
  ('Admin Loum', 'admin.loum@fordac-connect.org', 'fordac2025', 'admin', '+237670000002', NULL, 'approved', 1, 1, 2, 2, 'admin_membership'),
  ('Admin Manjo', 'admin.manjo@fordac-connect.org', 'fordac2025', 'admin', '+237670000003', NULL, 'approved', 1, 1, 2, 3, 'admin_finance'),
  ('Membre Loum 1', 'membre1.loum@fordac.org', 'fordac2025', 'member', '+237650000001', 'Base', 'approved', 1, 1, 2, 2, NULL),
  ('Membre Njombe 1', 'membre2.njombe@fordac.org', 'fordac2025', 'member', '+237650000002', 'Santé 70%', 'approved', 1, 1, 2, 1, NULL),
  ('Membre Penja 1', 'membre3.penja@fordac.org', 'fordac2025', 'member', '+237650000003', 'Santé 100%', 'approved', 1, 1, 2, 1, NULL);

COMMIT;
