import cors from 'cors';
import Express from 'express';
import morgan from 'morgan';
import * as fs from 'fs';
import * as stream from 'stream';
import * as n3 from 'n3';

const app = Express();
var store = new n3.Store();

app.use(Express.json());
app.use(cors({
    origin: 'http://localhost:3000',
}));


// logging
app.use(morgan('combined'));

app.get('/', (req, res) => {

    const parser = new n3.Parser();
    const turtle = fs.readFileSync('schemas/portfolio.ttl', 'utf-8');

    //    rdfStream = fs.createReadStream('schemas/portfolio.ttl');
    //    rdfStream.pipe(parser).on()
    parser.parse(turtle,
        (error, triple, prefixes) => {
            if (triple) {
                store.addQuad(triple);
                // console.log(triple);
                console.log(triple.predicate.id.toString());
            }
            else if (prefixes) {
                console.log('PREFIX ' + prefixes);
            }
            else {
                console.log("# That's all, folks!", prefixes);
            }
        });

    store.getQuads(null, 'http://www.w3.org/2000/01/rdf-schema#Class', null, null).forEach()
    res.send('Hello World!')
});

// start server
app.listen(9000, () => console.info('api listening at http://localhost:9000'));