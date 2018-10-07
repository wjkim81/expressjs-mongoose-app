

mongo

> use vntcDb
> db.patients.createIndex( { updatedAt: -1 } )
