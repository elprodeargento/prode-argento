"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const client = (0, supabase_js_1.createClient)('https://test.co', 'key');
const builder = client.from('predictions');
builder.select('*');
//# sourceMappingURL=test.js.map