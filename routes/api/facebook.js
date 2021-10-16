/****
 * FACEBOOK CONNECTION API
 * v.1.0
 */

const express = require('express');
const router = express.Router();
const https = require('https');

//access token è il token di accesso a lunga durata, gettato manualmente e immesso nel codice; esso viene refreshato dal codice in via automatica
const access_token = 'EAATOv8np5PoBAK64rwqZBsYQOzLq5gDAnBEnDCNFarUobi3DREZBzfRrbTYqUnbapfkfUDSrJGJXTfwAJhGMZChMzkR3m2y3ZAdjYT5tgjEN3R2CXKHsJwYwsF3Cw3uRokVi5xm2JI9BHLxgEGho5RaTtwFk8ALfYrEy4r7Ort4cks2Wc5Fh';
//ObjectID rappresenta l'ID della pagina o dell'utente di cui vogliamo visualizzare le immagini
const ObjectID = '101286595680806';

const Width = '1920';
const Height = '1280';
var feedsPostNumber = 0;

const URL_GetFeed = 'https://graph.facebook.com/'+ObjectID+'/feed?access_token='+access_token;

async function getImagesData(i, FeedIds){
    var ImagesData = [];
    return new Promise(function (resolve, reject) {

        const req = https.get('https://graph.facebook.com/'+FeedIds[i]+'/attachments?access_token='+access_token, resp => {
            let rawJson = '';

            resp.on('data', chunk => {
                rawJson += chunk;
            });
            resp.on('end', chunk => {

                rawJson = JSON.parse(rawJson);
                //dato che i JSON restituiti da facebook per quanto riguarda i feed non
                //contengono necessariamente degli attachments, ossia delle immagini o video,
                //allora questo for scannerizza le proprietà dell'oggetto JSON in esame per
                //verificare la presenza del campo "media". In tal caso, effettua il push
                //di media.image all'interno dell'array ImagesData
                for(const property in rawJson.data[0]){
                    if(property == "media"){
                        ImagesData.push(rawJson.data[0].media.image);
                        break;
                    }
                }

                resolve(ImagesData);
            });
        });
    })
}

async function getFeedIds(){
    return new Promise(function(resolve, reject) {
        const req1 = https.get(URL_GetFeed, resp1 => {
            let rawJsonFeed = '';
    
            resp1.on('data', chunk => {
                rawJsonFeed += chunk;
            });
            resp1.on('end', async chunk => {
                rawJsonFeed = JSON.parse(rawJsonFeed);
    
                let FeedIds = [];
    
                //salvo in un array l'id di tutte le immagini presenti nel feed
                for(let x = 0; x < rawJsonFeed.data.length; x++){
                    FeedIds[x] = rawJsonFeed.data[x].id;
                    feedsPostNumber++;
                }

                resolve(FeedIds);
            });
        });
    });
}

router.get('/getFacebookImages', async (req, res) => {
    try{
        let data = [], ImagesData = [], tempData;
        data = await getFeedIds(); //funzione che getta gli id dei post del feed della pagina / utente

        //questo for utilizza gli id dei post del feed ottenuti per chiamare la funzione
        //getImagesData, la quale verifica al suo interno che il post del feed in esame
        //contenga un attachment, ossia un'immagine o video, per poi pushare all'interno
        //dell'array ImagesData i dati dell'immagine presa da quel post del feed,
        //quali width, height e src (url dove visualizzare l'immagine)
        for(let x = 0; x < data.length; x++){
            try{
                tempData = await getImagesData(x, data);
                ImagesData.push(tempData);
            }catch(e){
                console.log(e.toString());
                continue;
            }
        }
        //dati dell'immagine che viene considerata come quella che si avvicina di più
        //alle dimensioni richieste
        let selectedUrlData = {'area':0, 'url': '', 'height': 0, 'width': 0};
        const SearchArea = Width*Height; //area desiderata
                    
        //scannerizzo tutte le immagini che ho trovato
        for(var i = 0; i < ImagesData.length; i++){
            if(ImagesData[i][0] != undefined){
                let SearchedArea = ImagesData[i][0].width*ImagesData[i][0].height;
                let lastValidArea = SearchArea - selectedUrlData.area; //lastValidArea rappresenta l'area dell'ultima immagine ritenuta come quella che si avvicina di più alla dimensione data
                let newArea = SearchedArea - SearchArea;

                if(lastValidArea < 0) lastValidArea = -lastValidArea; //se la differenza è negativa, allora ne prendo il valore assoluto
                if(newArea < 0) newArea = -newArea; //stesso discorso per l'area che sto esaminando adesso

                //se la differenza fra l'area cercata e quella precedentemente ritenuta come valida
                //è maggiore rispetto alla differenza fra quella cercata e quella attualmente in esame
                //allora vuol dire che la nuova area rappresenta l'immagine che si avvicina di più a quella richiesta
                if(lastValidArea > newArea){
                    selectedUrlData.area = SearchedArea;
                    selectedUrlData.url = ImagesData[i][0].src;
                }
            }
        }
        //alla fine di questo for avrò trovato l'immagine con l'area che si avvicina di più a quella data
        res.json(selectedUrlData.url ? selectedUrlData.url : 'success: false').status(selectedUrlData.url ? 200 : 403);

    }catch(e){
        console.log(e.toString());
    }
});


module.exports = router;