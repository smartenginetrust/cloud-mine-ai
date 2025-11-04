-- Fix function search path security issue
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'REF' || UPPER(SUBSTRING(MD5(user_id::TEXT || NOW()::TEXT) FROM 1 FOR 8));
  RETURN code;
END;
$$;