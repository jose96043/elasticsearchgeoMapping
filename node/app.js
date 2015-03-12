var elasticsearch = require('elasticsearch'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Promise = require("node-promise").Promise;


var INDEX = "scavenger_hunt",
    TYPE = "places",
    ES_HOST = "localhost:9200";

var app = express(),
    router = express.Router(),
    client = new elasticsearch.Client({host: ES_HOST});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

router.use(function(req, res, next) {
    console.log('Router is initializing.\nGoing to next routes');
    next(); // make sure we go to the next routes and don't stop here
});

router.get("/", function (req, res) {
    res.json({message: "Scavenger Api"});
});

router.route("/places/:id")
    .post(function (req, res) {
        var id = req.params.id,
            coordinates = req.body.location.split(",").map(Number).filter(Boolean),
            promise = elasticSearchQuery(id, coordinates);

        promise.then(function (result) {
            var isCorrectLocation = false;
            if (result > 0) {
                isCorrectLocation = true;
            }
            res.send({correctLocation: isCorrectLocation});
        }, function (err) {
            res.status(400);
            res.send({error: "invalid query"});
        });
    });

function elasticSearchQuery(id, coordinates) {
    var promise = new Promise();
    client.search({
        index: INDEX,
        type: TYPE,
        body: {
            query: {
                filtered: {
                    query: {
                        match: {
                            _id: id
                        }
                    },
                    filter: {
                        geo_shape: {
                            location: {
                                shape: {
                                    type: "point",
                                    coordinates: coordinates
                                }
                            }
                        }
                    }
                }
            }
        }
    }).then(function (resp) {
        promise.resolve(resp.hits.total);
        console.log("ElasticSearch response on geolocation hits", resp.hits.total);
    }, function (err) {
        promise.reject(err.message);
        console.log("Error on elasticsearch query geolocation hits.", err.message);
    });
    return promise;
}


// Register routes with prefix api.
app.use("/api", router);

app.listen(3000);
console.log('Listening on port 3000...');
