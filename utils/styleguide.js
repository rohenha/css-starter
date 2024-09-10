import fs from 'node:fs/promises'

/**
 * Initialize the process
 * @method init
 * @returns {void}
 */
const init = async () => {
  const params = formatArgs()
  const configStyleguideData = await queryFile(params.file ?? './styleguide.json')
  const configStyleguide = JSON.parse(configStyleguideData)
  createConfigFile(configStyleguide, params.output ?? './sources/styles/utils/_styleguide.scss')
}

const formatArgs = () => {
  const args = process.argv.slice(2)
  const params = args.reduce((acc, value) => {
    const splitted = value.split('=')    
    if (splitted.length > 1) {
      acc[splitted[0]] = splitted[1]
    }
    return acc
  }, {})
  return params
}

/**
 * Read file or throw error
 * @method queryFile
 * @param {*} file 
 * @returns {Object} data
 */
const queryFile = async (file = '') => {
  try {
    const data = await fs.readFile(file, { encoding: 'utf8' });
    return data
  } catch (err) {
    throw new Error(`File not found : ${err}`)
  }
}

/** 
 * Generate current date for build
 * Format YYYY-MM-DD HH:mm:ss
 * @method generateDate
 * @returns {String} date
 */
const generateDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Method to create array inside variable
 * @method generateArray
 * @param {String} key = ''
 * @param {Object} obj = {}
 * @param {Number} indent = 0 
 * @returns {String} content
 */
const generateArray = (key = '', obj = {}, indent = 0) => {
  let content = ''
  const spaceParent = Array.from(Array(Math.max(0, indent - 1)).keys()).reduce((acc, key) => acc + ' ', '')
  const spaceChild = Array.from(Array(indent).keys()).reduce((acc, key) => acc + ' ', '')
  
  if (indent > 1) {
    content += `${spaceParent}${key}: (\n`
  } else {
    content += `${key}: (\n`
  }
  const entries = Object.entries(obj)
  entries.forEach(([subkey, subvalue], key) => {
    if (typeof subvalue === 'object' && subvalue !== null) {
      content += generateArray(subkey, subvalue, indent + 1)
    } else {
      content += `${spaceChild}'${subkey}': ${subvalue},\n`
    }
  })
  content += `${spaceParent})`
  if (indent > 1) {
    content += ',\n'
  }
  return content
}

/**
 * Method for create base of file content
 * @method createBase
 * @param {Object} obj 
 * @returns {String} content
 */
const createBase = (obj) => {
  let content = ''
  // Loop base object to create variables
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      content += `$`;
      content += generateArray(key, value, 1);
      content += `;\n\n`;
    } else {
      content += `$${key}: ${value};\n\n`;
    }
  })
  return content
}

/**
 * Create a SCSS file from a JSON object
 * @method createConfigFile
 * @param {Object} json 
 * @param {String} file 
 * @returns {void}
 */
const createConfigFile = async (json = {}, file = './config.scss') => {
  const date = generateDate()
  let scssContent = createBase(json)
  scssContent = `// Styleguide\n\n` + scssContent
  scssContent += `// File automatically generated from ${file}, ${date}\n`
  // Écrire le contenu dans un fichier SCSS
  try {
    await fs.writeFile(file, scssContent);
    console.log('Le fichier SCSS a été créé avec succès.')
  } catch (err) {
    throw new Error(`Erreur lors de la création du fichier SCSS: ${err}`)
  }
}

init()