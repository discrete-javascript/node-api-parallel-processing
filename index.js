import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import deepEqual from 'deep-equal';

const app = express();

// Body Parser Middleware
app.use(bodyParser.json());

// Handling Error API Calls
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send('Something broke!');
  next();
});

//Setting up server
const server = app.listen(process.env.PORT || 4000, function () {
  const port = server.address().port;
  console.log('App now running on port', port);
});

/**
 * @api {get} /getDetails:pincodes?{number},{number}... Get Details of Pincodes
 * @apiName GetDetails
 * @apiParam {number} pincode Pincode
 */
app.get('/get-details', function (expressReq, expressRes) {
  const { pincodes } = expressReq.query;
  const arr = pincodes.split(',');
  const pincodeDetails = [];

  const saveResponse = (details) => {
    pincodeDetails.push(details);
    if (pincodeDetails.length === arr.length) {
      expressRes.send(pincodeDetails);
    }
  };

  const detailsPromise = async () =>
    await Promise.allSettled(
      arr.map(async (pincode) => {
        await actualApi(
          [
            `https://api.postalpincode.in/pincode/${pincode}`,
            `https://api.postalpincode.in/pincode/${pincode}`,
          ],
          saveResponse,
          pincode
        );
      })
    );
  detailsPromise();
});

const actualApi = async (urls, saveResponse, pincode) => {
  try {
    const response = await axios.all(urls.map((url) => axios.get(url)));
    const returnObj = {
      [pincode]: deepEqual(response[0].data, response[1].data),
    };
    return saveResponse(returnObj);
  } catch (error) {
    console.error(error);
  }
};
