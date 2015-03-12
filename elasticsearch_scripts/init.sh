curl -XPOST http://localhost:9200/scavenger_hunt -d '{
    "mappings": {
        "places": {
            "properties": {
                "location": {
                    "type": "geo_shape",
                    "precision": "1m"
                }
            }
        }
    }
}'



curl -XPUT http://localhost:9200/scavenger_hunt/places/kelly_home -d '{
    "location": {
        "type": "polygon",
        "coordinates": [
            [
                [
                    40.753149,
                    -73.993542
                ],
                [
                    40.75339,
                    -73.994141
                ],
                [
                    40.753673,
                    -73.993279
                ],
                [
                    40.753149,
                    -73.993542
                ]
            ]
        ]
    }
}' 


curl -XPOST 'http://localhost:9200/scavenger_hunt/places/_search?pretty' -d '{
    "query":{
        "filtered": {
            "query": {
                "match": {
                  "_id": "kelly_home"
                }
            },
            "filter": {
                "geo_shape": {
                    "location": {
                        "shape": {
                            "type": "point",
                            "coordinates" : [40.753383, -73.993736]
                        }
                    }
                }
            }
        }
    }
}'



