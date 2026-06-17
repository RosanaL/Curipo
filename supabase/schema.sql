-- Curipo agents table
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists agents (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,          -- 名称
  models      text[] default '{}',    -- 模型 (e.g. {gpt-4o, claude-3-5-sonnet})
  price       text,                   -- 价格 (e.g. Free, $10/mo)
  description text not null,          -- 具体做的事
  rating      numeric(2,1),           -- 评分 (0.0 - 5.0)
  url         text,                   -- 链接
  created_at  timestamptz default now()
);

-- Enable Row Level Security
alter table agents enable row level security;

-- Allow public read access (the app only reads agents)
create policy "Public read access"
  on agents for select
  using (true);

-- Optional: a couple of sample rows to test with
insert into agents (name, models, price, description, rating) values
  ('InboxZero', '{gpt-4o, claude-3-5-sonnet}', 'Free', '读取你的邮箱，按紧急程度分类，用你的语气起草回复，自动处理常规邮件。', 4.5),
  ('Soar', '{}', 'Free', '搜索全网找最便宜的机票，支持指定城市日期，也支持"从洛杉矶出发最便宜的国家"这种开放搜索。', 4.2),
  ('ReviewBot', '{claude-3-5-sonnet}', '$15/mo', '分析 pull request，标记潜在 bug、安全漏洞和风格问题，并留下行内评论。', 4.7);
