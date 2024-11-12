const cors=require('cors');

const corsOption={
    origin:'http://localhost',
    optionsSuccessStatus:200
};

module.exports=cors(corsOption);

