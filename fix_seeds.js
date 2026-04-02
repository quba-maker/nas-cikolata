const fs = require('fs');
let content = fs.readFileSync('src/data/seedData.ts', 'utf8');

// The file exports `products: Product[] = [ ... ]`
// We can just find the array and inject/replace items, but it's hard to parse a huge JS array using regex.
// Instead, let's just generate the new objects and append them dynamically at runtime!
// Wait! If they want 20 products *in* the UI, and the data is hardcoded in seedData.ts, we can just replace the list.
