const express = require("express");
let router = express.Router();
const db = require("../db/sale-queries");

router.get("/", (req, res) => {
    res.status(200).render("owner/", {session: req.session});
});


router.get("/reports", getReport, sendReport);

function getReport(req, res, next) {
    if(req.query.type == "all") {
        db.getBasicReport([req.query.from_date, req.query.to_date], (err, results) => {
            if(err) { 
                console.error(err.stack);
                req.app.locals.sendError(req, res, 500, "Error retrieving report");
                return;
            }
            res.report = results;
            next();
        });
    }
    else if(req.query.type == "genre") {
        db.getGenreReport([req.query.from_date, req.query.to_date], (err, results) => {
            if(err) { 
                console.error(err.stack);
                req.app.locals.sendError(req, res, 500, "Error retrieving report");
                return;
            }
            res.report = results;
            next();
        });
    }
    else if(req.query.type == "author") {
        db.getAuthorReport([req.query.from_date, req.query.to_date], (err, results) => {
            if(err) { 
                console.error(err.stack);
                req.app.locals.sendError(req, res, 500, "Error retrieving report");
                return;
            }
            res.report = results;
            next();
        });
    }
}

function sendReport(req, res) {
    res.status(200).render("owner/report-list", {
        session: req.session,
        report: {
            type: req.query.type,
            from: req.query.from_date,
            to: req.query.from_date,
            results: res.report
        }
    });
}

module.exports = router;