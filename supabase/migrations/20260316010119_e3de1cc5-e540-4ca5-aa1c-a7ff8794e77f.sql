
CREATE TABLE public.hashrate_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  hashrate numeric NOT NULL,
  daily_profit numeric NOT NULL,
  plan_type text NOT NULL DEFAULT 'BTC',
  features text[] NOT NULL DEFAULT '{}',
  is_popular boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hashrate_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are viewable by everyone"
  ON public.hashrate_plans FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert plans"
  ON public.hashrate_plans FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update plans"
  ON public.hashrate_plans FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete plans"
  ON public.hashrate_plans FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.hashrate_plans (name, description, price, hashrate, daily_profit, plan_type, features, is_popular) VALUES
  ('Starter', 'Perfect for beginners exploring cloud mining', 99, 1000, 0.0000015, 'BTC', ARRAY['1 TH/s mining power','Basic AI optimization','Email support','Daily payouts','Standard security'], false),
  ('Professional', 'Ideal for serious miners seeking growth', 299, 5000, 0.0000075, 'BTC', ARRAY['5 TH/s mining power','Advanced AI optimization','Priority support','Real-time payouts','Enhanced security','Analytics dashboard'], true),
  ('Enterprise', 'Maximum power for professional operations', 999, 20000, 0.00003, 'BTC', ARRAY['20 TH/s mining power','Premium AI optimization','24/7 dedicated support','Instant payouts','Maximum security','Advanced analytics','Custom configuration','API access'], false);
