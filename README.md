# FACEBOOK-API
A short API that permits to set the wanted dimension for an image and to retrieve the most similar image of the feed of a page and/or a user, basing on those dimensions.

HOW-TO-USE:

1) Get your Facebook token and a facebook app: just follow the instructions at https://developers.facebook.com/docs/graph-api/get-started
2) Once you get your Facebook token, exchange it for a long-life token: make an HTTP GET request to: https://graph.facebook.com/v12.0/oauth/access_token?grant_type=fb_exchange_token&client_id={YOUR APP-ID}&client_secret={APP SECRET}&fb_exchange_token={PUT HERE THE TOKEN YOU HAVE TO EXCHANGE}
3) Take the token you get from the request and put it in "access_token" const, inside /routes/api/facebook and /routes/api/facebook2
4) Put inside "ObjectID" const the ID of the page or the user you want to get the feed of.
5) Call the endpoints localhost:4100/api/facebook/getFacebookImages or localhost:4100/api/facebook/getFacebookFeed (if you're using your local machine; else put there the path of your website, where you put the api)
