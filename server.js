const express = require('express');
const bodyParser = require('body-parser');
const Atomizer = require('atomizer');
const path = require('path');
const atomizerVersion = require('atomizer/package.json').version;

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));

// Set up Atomizer with default configs
const atomizer = new Atomizer({
  breakPoints: {
    sm: '@media(min-width:750px)',
    md: '@media(min-width:1000px)',
    lg: '@media(min-width:1200px)'
  },
  custom: {
    'primary': '#1c7ef6',
    'secondary': '#f65e1c'
  }
});

console.log('Atomizer instance:', atomizer);
console.log('Atomizer methods:', Object.keys(atomizer));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.post('/process_acss', (req, res) => {
  console.log('Received request to /process_acss');
  const { html, config } = req.body;
  console.log('Received HTML:', html);
  console.log('Received Config:', config);

  try {
    const parsedConfig = config ? JSON.parse(config) : {};
    console.log('Parsed Config:', parsedConfig);
    
    console.log('HTML being processed:', html);
    
    // Extract ACSS classes from HTML
    const acssClasses = atomizer.findClassNames(html);
    console.log('ACSS classes found:', acssClasses);
    
    if (acssClasses.length === 0) {
      console.log('No ACSS classes found in the HTML');
      res.json({ css: '', version: atomizerVersion });
      return;
    }
    
    // Generate Atomizer configuration
    const acssConfig = atomizer.getConfig(acssClasses, parsedConfig);
    console.log('ACSS Config:', acssConfig);
    
    // Generate CSS
    const css = atomizer.getCss(acssConfig);
    console.log('Generated CSS:', css);
    
    if (css) {
      res.json({ css, version: atomizerVersion });
    } else {
      console.error('No CSS generated');
      res.status(500).json({ error: 'No CSS generated', version: atomizerVersion });
    }
  } catch (error) {
    console.error('Error processing ACSS:', error);
    res.status(400).json({ error: 'Error processing ACSS: ' + error.message, version: atomizerVersion });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
