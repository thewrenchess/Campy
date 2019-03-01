const { states } = require('./states');

const request = require('request-promise');
const xmlParser = require('xml2json');

const APIKEY = '6hn8xprxwy84d3gnwf4wf26a';

async function findCampground(options) {
    let rs;

    try {
        rs = await request({
            url: 'http://api.amp.active.com/camping/campgrounds',
            qs: {   // query string data
                    api_key: APIKEY,
                    siteType: '2003',
                    ...options
            },
            method: 'GET'
        });
    } catch (e) {
        console.log('Error', e);
        return null;
    }

    rs = JSON.parse(xmlParser.toJson(rs));

    rs = rs.resultset ? rs.resultset.result : null;

    if (rs && rs.length) {
        rs = rs.filter(el =>  el.contractType !== 'PRIVATE');

        if (rs.length) {
            let index = Math.floor(Math.random() * rs.length);
            rs = rs[index];
        } else {
            rs = null;
        }
    }

    return rs;
}

/**
 * active's campground detail api does not seem to be working
 * function commented out til further investigation

async function getCampgroundDetail(options) {
    let rs;

    try {
        rs = await request({
            url: 'http://api.amp.active.com/camping/campground/details',
            qs: {
                api_key: APIKEY,
                ...options
            },
            method: 'GET'
        });
        console.log(rs);
    } catch (e) {
        console.log('Error', e);
        return null;
    }

    rs = JSON.parse(xmlParser.toJson(rs));

    return rs.resultset ? rs.resultset.result : null;
}
 */

async function getCampground(text) {
    let mods = text.split(' ');

    let state = mods.find(el => states.includes(el.toUpperCase()));

    let options = {
        pstate: state ? state.toUpperCase() : 'CA',
    }

    let pets = mods.map(el => el.toLowerCase()).includes('pets');

    if (pets) {
        options.pets = '3010';
    }

    let rs = await findCampground(options);

    // if (rs) {
    //     return await getCampgroundDetail({
    //         parkId: rs.facilityID,
    //         contractCode: rs.contractID
    //     });
    // }

    return rs;

}

module.exports = {
    getCampground
}