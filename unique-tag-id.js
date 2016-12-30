var count = 1
module.exports = function (content, ...tags) {
  for(let i = 0; i < tags.length; i++){
    const re = new RegExp(`<${tags[i]} id="(.*?|$)"`, 'g')
    let matches = []
    let m = null
    do {
      m = re.exec(content)
      if (m) matches.push(m[1])
    } while(m)
    while(matches.length){
      const hashID = `id-${count}`
      content = content.split(matches.pop()).join(hashID);
      count++
    }
  }
  return content
}
