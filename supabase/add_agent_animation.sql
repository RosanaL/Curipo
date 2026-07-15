-- Add animated card art fields for agent profiles.
alter table agents add column if not exists animation_url text;
alter table agents add column if not exists poster_url text;

-- Okara's local animated avatar. This path works after the asset is deployed
-- from public/agents/okara.webm.
update agents
set animation_url = '/agents/okara.webm'
where lower(name) = 'okara';
