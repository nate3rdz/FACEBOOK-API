const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.listen(4100, f => {
    console.log('Api in ascolto sulla porta 4100.');
});

/** ROUTER **/

const facebookApi = require('./routes/api/facebook.js');
app.use('/api/facebookv1', facebookApi);

const facebookApi2 = require('./routes/api/facebook2.js');
app.use('/api/facebookv2', facebookApi2);

/** ROUTER **/