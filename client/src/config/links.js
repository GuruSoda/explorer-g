const process = require('process')

/* NO me funciona */
export const externalLink = () => {
//    console.log('node_env:', process.env.NODE_ENV)
    return process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : ''
}
