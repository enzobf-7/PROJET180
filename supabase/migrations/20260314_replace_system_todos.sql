-- Remplacer les 4 anciens system todos par 2 nouveaux
-- "Partage to-do validée" + "Prépa to-do de demain"

-- Supprimer tous les anciens system todos
DELETE FROM todos WHERE is_system = true;

-- Insérer les 2 nouveaux pour tous les clients existants
INSERT INTO todos (id, client_id, title, is_system, created_at)
SELECT gen_random_uuid(), p.id, 'Partage to-do validée', true, now()
FROM profiles p WHERE p.role = 'client';

INSERT INTO todos (id, client_id, title, is_system, created_at)
SELECT gen_random_uuid(), p.id, 'Prépa to-do de demain', true, now()
FROM profiles p WHERE p.role = 'client';
