import { createClient } from '@supabase/supabase-js';
import type { Database } from '@prode/db';

const client = createClient<Database>('https://test.co', 'key');
const builder = client.from('predictions');
builder.select('*');
