import cors from 'cors';
import Express from 'express';
import morgan from 'morgan';
import * as fs from 'fs';
import * as stream from 'stream';
import * as n3 from 'n3';
import path from 'path';

const ttl2jsonld = require('@frogcat/ttl2jsonld').parse;

const app = Express();
var store = new n3.Store();

function getAllFiles(dirPath: string){
    fs.readdirSync(dirPath).forEach(function(file) {
    let filepath = path.join(dirPath , file);
    let stat= fs.statSync(filepath);
    if (stat.isDirectory()) {            
      getAllFiles(filepath);
    } else {
          console.info(dirPath + '\n');
          console.info(filepath+ '\n');                      
    }    
});  
}



app.use(Express.json());
app.use(cors({
    origin: 'http://localhost:3000',
}));

// logging
app.use(morgan('combined'));


function addallFilePaths(dirPath: string){
    fs.readdirSync(dirPath).forEach(function(file) {
    let filepath = path.join(dirPath , file);
    let stat= fs.statSync(filepath);
    if (stat.isDirectory()) {            
        addallFilePaths(filepath);
    } else {
        const fileComponents: string[] = filepath.split('.');
        console.info('Get URI: ' + fileComponents[0] + '\n');
        app.get('/' + fileComponents[0], (req, res) => {
            const turtle = fs.readFileSync(filepath, 'utf-8');
            const jsonld = ttl2jsonld(turtle);
            console.log(jsonld);
            //console.log(JSON.stringify(jsonld,null,2));
            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify(jsonld,null,2));
        }); 
    }    
});  
}

process.chdir('schemas')
addallFilePaths('.');

app.get('/refresh', (req, res) => {
    addallFilePaths('.');
});

app.get('/', (req, res) => {
    const parser = new n3.Parser();
    const turtle = fs.readFileSync('schemas/portfolio.ttl', 'utf-8');

    //    rdfStream = fs.createReadStream('schemas/portfolio.ttl');
    //    rdfStream.pipe(parser).on()
    /*
    parser.parse(turtle,
        (error, triple, prefixes) => {
            if (triple) {
                store.addQuad(triple);
                console.log(triple);
                console.log(triple.predicate.id.toString());
            }
            else {
                console.log("# That's all, folks!", prefixes);
            }
        });
    */

    const quads: n3.Quad[] =parser.parse(turtle);

    quads.forEach((quad) => {
        store.addQuad(quad);
        console.log(quad);
    });

    console.log("Retreiveing all triples");
    
    store.getQuads(null, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/2000/01/rdf-schema#Class', null).forEach((quad) => {
        console.log(quad);
        store.getQuads(quad.subject.id, 'http://www.w3.org/2000/01/rdf-schema#Property', null, null).forEach((quad) => {
            console.log(quad);
            n3.Util.prefix
        });
    });

    res.send('Hello World!')
});

// start server
app.listen(9000, () => console.info('api listening at http://localhost:9000'));
