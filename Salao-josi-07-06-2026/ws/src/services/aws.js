const AWS = require('aws-sdk');

module.exports = {
    IAM_USER_KEY: process.env.AWS_ACCESS_KEY_ID || '',
    IAM_USER_SECRET: process.env.AWS_SECRET_ACCESS_KEY || '',
    BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'salao-na-mao',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    uploadToS3: function(file, filename, acl = 'public-read'){
        return new Promise((resolve, reject) =>{
            let IAM_USER_KEY = this.IAM_USER_KEY;
            let IAM_USER_SECRET = this.IAM_USER_SECRET;
            let BUCKET_NAME = this.BUCKET_NAME;

            let s3buket = new AWS.S3({
             accessKeyId: IAM_USER_KEY,
             secretAccessKey: IAM_USER_SECRET,
             region: this.AWS_REGION,
             Bucket:BUCKET_NAME,
            });
            
            s3buket.createBucket(function () {
                var params = {
                    Bucket: BUCKET_NAME,
                    Key: filename ,
                    Body : file.data,
                    ACL: acl,
                };

    s3buket.upload(params, function (err , data ){
        if(err){
            console.log(err);
            return resolve({error: true, message: err.message});
            }
            console.log(data);
              return resolve({error: false, message: data});
             });
         });
     });
},

 deleteFileS3: function (key) {
        return new Promise((resolve, ) => {
            let IAM_USER_KEY = this.IAM_USER_KEY;
            let IAM_USER_SECRET = this.IAM_USER_SECRET;
            let BUCKET_NAME = this.BUCKET_NAME;

            let s3buket = new AWS.S3 ({
                accessKeyId: IAM_USER_KEY,
                secretAccessKey: IAM_USER_SECRET,
                region: this.AWS_REGION,
                Bucket: BUCKET_NAME,
            });

      s3buket.createBucket(function () {
        s3buket.deleteObject(
            {
                Bucket: BUCKET_NAME,
                Key: key,
            },
            function (err, data){
                if(err) {
                    console.log(err);
                    return resolve({ error: true, message: err});
                }
                console.log(data);
                return resolve({error: false, message: data});
            }
        );
      });
    });
  },
};

        
    

           

            
        
    
