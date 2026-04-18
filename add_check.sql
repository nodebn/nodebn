ALTER TABLE payments ADD CONSTRAINT payments_bank_name_check CHECK (bank_name IN ('Baiduri Bank', 'Bank Islam Brunei Darussalam', 'Standard Chartered Brunei', 'TAIB', 'BIBD VCARD'));
