-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  subscription_status text default 'free' check (subscription_status in ('free', 'active', 'cancelled')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Quests table (Field Manuals)
create table public.quests (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  description text,
  version text default '1.0',
  is_free boolean default false,
  module_order integer not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Quest modules (Rounds within quests)
create table public.quest_modules (
  id uuid primary key default uuid_generate_v4(),
  quest_id uuid not null references quests(id) on delete cascade,
  module_order integer not null,
  title text not null,
  questions jsonb default '[]'::jsonb,
  is_free boolean default false,
  created_at timestamp with time zone default now()
);

-- Questionnaires (User responses)
create table public.questionnaires (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  quest_id uuid not null references quests(id) on delete cascade,
  version integer default 1,
  responses jsonb default '{}'::jsonb,
  patterns_detected jsonb default '[]'::jsonb,
  skills_canvas jsonb,
  positioning_statement text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, quest_id, version)
);

-- Subscriptions table
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references users(id) on delete cascade,
  stripe_subscription_id text,
  status text default 'inactive' check (status in ('active', 'paused', 'cancelled', 'inactive')),
  modules_unlocked text[] default array['architecture-of-you'],
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Row-level security policies
alter table public.users enable row level security;
alter table public.questionnaires enable row level security;
alter table public.subscriptions enable row level security;

-- Users can only see their own data
create policy "Users can view their own data" on public.users
  for select using (auth.uid() = auth_id);

create policy "Users can update their own data" on public.users
  for update using (auth.uid() = auth_id);

-- Questionnaires: Users can see their own responses
create policy "Users can view their own questionnaires" on public.questionnaires
  for select using (auth.uid() = (select auth_id from users where users.id = questionnaires.user_id));

create policy "Users can insert their own questionnaires" on public.questionnaires
  for insert with check (auth.uid() = (select auth_id from users where users.id = questionnaires.user_id));

create policy "Users can update their own questionnaires" on public.questionnaires
  for update using (auth.uid() = (select auth_id from users where users.id = questionnaires.user_id));

-- Subscriptions: Users can see their own subscription
create policy "Users can view their own subscription" on public.subscriptions
  for select using (auth.uid() = (select auth_id from users where users.id = subscriptions.user_id));

-- Insert initial quests
insert into public.quests (slug, title, description, is_free, module_order) values
  (
    'architecture-of-you',
    'The Architecture of You',
    'Discover the hidden operating system behind how you think, create, and make decisions.',
    false,
    1
  ),
  (
    'the-offer',
    'The Offer',
    'Turn your strengths into something people are willing to pay for.',
    false,
    2
  ),
  (
    'the-audience',
    'The Audience',
    'Find who actually needs what you offer.',
    false,
    3
  )
on conflict (slug) do nothing;

-- Create indexes for performance
create index if not exists idx_questionnaires_user_id on questionnaires(user_id);
create index if not exists idx_questionnaires_quest_id on questionnaires(quest_id);
create index if not exists idx_questionnaires_user_quest on questionnaires(user_id, quest_id);
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);

-- Create function to handle updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to users
create trigger users_updated_at
  before update on users
  for each row
  execute function update_updated_at();

-- Apply updated_at trigger to quests
create trigger quests_updated_at
  before update on quests
  for each row
  execute function update_updated_at();

-- Apply updated_at trigger to questionnaires
create trigger questionnaires_updated_at
  before update on questionnaires
  for each row
  execute function update_updated_at();

-- Apply updated_at trigger to subscriptions
create trigger subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function update_updated_at();
