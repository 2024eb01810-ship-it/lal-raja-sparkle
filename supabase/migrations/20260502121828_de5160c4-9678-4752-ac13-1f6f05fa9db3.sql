
DO $$
DECLARE
  new_uid uuid;
  existing_uid uuid;
BEGIN
  SELECT id INTO existing_uid FROM auth.users WHERE email = 'nagadurga20054@gmail.com';

  IF existing_uid IS NULL THEN
    new_uid := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_uid,
      'authenticated',
      'authenticated',
      'nagadurga20054@gmail.com',
      crypt('8074992074', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      new_uid,
      jsonb_build_object('sub', new_uid::text, 'email', 'nagadurga20054@gmail.com', 'email_verified', true),
      'email',
      new_uid::text,
      now(), now(), now()
    );
  ELSE
    new_uid := existing_uid;
  END IF;

  INSERT INTO public.profiles (id, email)
  VALUES (new_uid, 'nagadurga20054@gmail.com')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_uid, 'admin')
  ON CONFLICT DO NOTHING;
END $$;
