/****
 * FACEBOOK CONNECTION API
 * v.2.0
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
 
 const URL_GetFeed = 'https://graph.facebook.com/'+ObjectID+'?fields=feed{attachments{media}}&access_token='+access_token;

 async function getFeedData(){
     return new Promise(function(resolve, reject) {
         const req1 = https.get(URL_GetFeed, resp1 => {
             let rawJsonFeed = '';
     
             resp1.on('data', chunk => {
                rawJsonFeed += chunk;
             });
             resp1.on('end', async chunk => {
                rawJsonFeed = JSON.parse(rawJsonFeed);
     
                let ImagesData = [];

                for(let x = 0; x < rawJsonFeed.feed.data.length; x++){
                    for(const property in rawJsonFeed.feed.data[x].attachments){
                        if(property == "data"){
                            ImagesData.push(rawJsonFeed.feed.data[x].attachments.data[0].media.image);
                            break;
                        }
                    }
                }
                resolve(ImagesData);
             });
         });
     });
 }
 
 router.get('/getFacebookFeed', async (req, res) => {
     try{
         let data = [];
         data = await getFeedData(); //funzione che getta i dati degli attachments dei post del feed
         console.log(data);

         //dati dell'immagine che viene considerata come quella che si avvicina di più
         //alle dimensioni richieste
         let selectedUrlData = {'area':0, 'url': '', 'height': 0, 'width': 0};
         const SearchArea = Width*Height; //area desiderata
                     
         //scannerizzo tutte le immagini che ho trovato
         for(var i = 0; i < data.length; i++){
             if(data[i] != undefined){
                 let SearchedArea = data[i].width*data[i].height;
                 let lastValidArea = SearchArea - selectedUrlData.area; //lastValidArea rappresenta l'area dell'ultima immagine ritenuta come quella che si avvicina di più alla dimensione data
                 let newArea = SearchedArea - SearchArea;

                 if(lastValidArea < 0) lastValidArea = -lastValidArea; //se la differenza è negativa, allora ne prendo il valore assoluto
                 if(newArea < 0) newArea = -newArea; //stesso discorso per l'area che sto esaminando adesso
 
                 //se la differenza fra l'area cercata e quella precedentemente ritenuta come valida
                 //è maggiore rispetto alla differenza fra quella cercata e quella attualmente in esame
                 //allora vuol dire che la nuova area rappresenta l'immagine che si avvicina di più a quella richiesta
                 if(lastValidArea > newArea){
                     selectedUrlData.area = SearchedArea;
                     selectedUrlData.url = data[i].src;
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