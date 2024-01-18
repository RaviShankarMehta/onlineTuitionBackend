import dataUriParser from 'datauri/parser.js';

import path from 'path';

const getDateUri = (file)=>{
    const parser = new dataUriParser();
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName,file.buffer)
}

export default getDateUri