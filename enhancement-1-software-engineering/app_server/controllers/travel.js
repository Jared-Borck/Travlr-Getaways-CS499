const apiOptions = {
  server: 'http://localhost:3000'
};

const renderTravelPage = function(req, res, responseBody) {
  res.render('travel', {
    title: 'Travlr Getaways',
    trips: responseBody
  });
};

module.exports.travel = async function(req, res) {
  const path = '/api/trips';
  const url = `${apiOptions.server}${path}`;

  try {
    const response = await fetch(url);
    const body = await response.json();

    if (response.status === 200) {
      renderTravelPage(req, res, body);
    } else {
      res.status(response.status).render('error', {
        message: 'Unable to retrieve trips from API',
        error: body
      });
    }
  } catch (err) {
    res.status(500).render('error', {
      message: 'Unable to connect to API',
      error: err
    });
  }
};