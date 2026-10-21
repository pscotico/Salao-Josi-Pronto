const util = {
  AWS: {
    bucketURL: process.env.REACT_APP_BUCKET_URL || 'http://localhost:8000/uploads',
  },

  allFields(data, fields) {
    return fields.every((field) => {
      const value = data?.[field];

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== undefined && value !== null && value !== '';
    });
  },
};

export default util;
