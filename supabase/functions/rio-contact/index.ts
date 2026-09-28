import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import postgres from 'npm:postgres@3.4.5';
import { createHandler } from './handler.ts';

Deno.serve(createHandler({
  env: key => Deno.env.get(key),
  connect: () => postgres(Deno.env.get('SUPABASE_DB_URL')!, {prepare:false,max:1,connect_timeout:10,idle_timeout:20}),
  request: fetch,
}));
