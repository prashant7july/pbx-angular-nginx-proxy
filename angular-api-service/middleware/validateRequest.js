const validateBodyRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  console.log(error, "Error")
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }
  next();
};

const validateQueryRequest = (schema) => (req, res, next) => {  
  const { error } = schema.validate(req.query);
  console.log(error, "Error")
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }
  next();
};

module.exports = { validateBodyRequest, validateQueryRequest };  