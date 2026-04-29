const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length !== 8) {
    return helpers.message("password must be 8 characters");
  }
  return value;
};

const cnic = (cnic, helpers) => {
  if (!cnic.match(/^\d{13}$/)) {
    return helpers.message("CNIC must be 14 digit (without dash)");
  }
  return cnic;
};

const mobile = (mobile, helpers) => {
  if (!mobile.match(/^92(3)\d{9}$/)) {
    return helpers.message("Invalid mobile number");
  }
  return mobile;
};

module.exports = {
  objectId,
  password,
  cnic,
  mobile,
};
